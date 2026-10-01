import {useEffect, useState} from "react";

import {dataDir, join} from "@tauri-apps/api/path";
import {readTextFile, watch} from "@tauri-apps/plugin-fs";
import {Command} from "@tauri-apps/plugin-shell";
import {platform} from "@tauri-apps/plugin-os";

// TODO: does pi-tray want to be a monorepo?
import type {PluginReference, PluginConfigTemplate} from "pi-tray-server/src/types";

const appdata = await dataDir();

const plugin_env = await join(appdata, "pi-tray", "plugin-env");
const package_json = await join(plugin_env, "package.json");

/**
 * Lists the package names of installed plugins by reading the `package.json` file in the plugin-env directory.
 * @returns array of installed plugin package names
 */
export const list_installed_packages = async (): Promise<string[]> => {
    try {
        const text = await readTextFile(package_json);
        const data = JSON.parse(text);

        if (data && data.dependencies) {
            return Object.keys(data.dependencies);
        } else {
            console.warn("No dependencies found in package.json");
            return [];
        }
    } catch (error) {
        console.error("Error listing installed plugins:", error);
        return [];
    }
}

const change_listeners = new Set<() => void>();

/**
 * Subscribe to changes in the list of installed packages.<br>
 * This will notify the callback whenever plugin-env's `package.json` file changes, indicating a change in the installed packages.
 * @param callback the callback to call when the list of installed packages changes
 */
export const subscribe_to_package_list_change = (callback: () => void): void => {
    change_listeners.add(callback);
}

/**
 * Unsubscribe from changes in the list of installed packages.
 * @param callback a reference equivalent to the callback passed to `subscribe_to_package_list_change`
 */
export const unsubscribe_from_package_list_change = (callback: () => void): void => {
    change_listeners.delete(callback);
}

const notify_package_list_change = (): void => {
    change_listeners.forEach(callback => callback());
}

/**
 * A React hook that provides the list of installed packages in plugin-env.
 * @param set_null_when_reindexing whether to set the package list to null while reindexing (default: true)
 * @returns array of installed plugin package names or null if not yet loaded
 */
export const usePackageList = (set_null_when_reindexing = true) => {
    const [packages, setPackages] = useState<string[] | null>(null);

    useEffect(() => {
        const fetch_packages = async () => {
            if (set_null_when_reindexing) {
                setPackages(null);
            }

            setPackages(await list_installed_packages());
        };

        fetch_packages();

        const listener = () => fetch_packages();
        subscribe_to_package_list_change(listener);

        return () => {
            unsubscribe_from_package_list_change(listener);
        };
    }, []);

    return packages;
}

export const usePluginList = (set_null_when_reindexing = true) => {
    const [plugins, setPlugins] = useState<string[] | null>(null);

    const packages = usePackageList();

    // reindex plugins when packages change
    // TODO: do this more optimised in the real thing
    useEffect(() => {
        if (set_null_when_reindexing) {
            setPlugins(null);
        }

        if (packages === null) {
            // packages not yet loaded
            return;
        }

        // use iife to safely use an async function inside useEffect
        (async () => {
            let new_plugins: string[] = [];

            for (const pkg of packages) {
                try {
                    const pkg_plugins = await list_plugins_in_package(pkg);
                    pkg_plugins.forEach(plugin => {
                        if (!new_plugins.includes(plugin)) {
                            new_plugins.push(plugin);
                        }
                    });
                } catch (error) {
                    console.error(`Error listing plugins in package ${pkg}:`, error);
                }
            }
            setPlugins(new_plugins);
        })();
    }, [packages]);

    return plugins;
}

/**
 * Installs a package in the plugin-env directory by executing `npm install <package_ref>`.
 * @param package_ref the package reference to install, such as a name or git url
 */
export const install_package = async (package_ref: string) => {
    let command: Command<string>;

    if (platform() === "windows") {
        // windows command resolution is bonkers, so this is actually a harshly restricted call to cmd.exe
        command = Command.create("npm-install-windows", ["/c", `npm install ${package_ref}`], {
            cwd: plugin_env,
        });
    } else {
        command = Command.create("npm-install", ["install", package_ref], {
            cwd: plugin_env,
        });
    }

    const result = await command.execute();

    if (result.code !== 0) {
        console.error("Failed to install package:", package_ref, result);
        throw new Error(`Failed to install package: ${package_ref}`);
    } else {
        console.log("Package installed successfully:", package_ref);
        //notify_plugin_list_change(); // not necessary, the watcher will handle this
    }
}

/**
 * Uses the sidecar binary to list the plugins in a given package.
 * @param package_name the name of the package to list plugins from e.g. @pi-tray/builtin
 * @param fully_qualify whether to prepend the package name to each plugin name (default: true)
 */
export const list_plugins_in_package = async (package_name: string, fully_qualify = true): Promise<string[]> => {
    const command = Command.sidecar("binaries/sidecar", ["list-plugins", package_name]);
    const result = await command.execute();

    if (result.code !== 0) {
        console.error("Failed to list plugins in package:", package_name, result);
        throw new Error(`Failed to list plugins in package: ${package_name}`);
    }

    const plugins = JSON.parse(result.stdout.trim());

    if (fully_qualify) {
        return plugins.map((plugin: string) => `${package_name}/${plugin}`);
    } else {
        return plugins;
    }
}

export interface PluginInfo {
    display_name?: string;
    config_template?: PluginConfigTemplate;
}

// keyed by package name, cleared whenever the installed packages change
const plugin_info_cache = new Map<string, Promise<Record<string, PluginInfo>>>();
subscribe_to_package_list_change(() => plugin_info_cache.clear());

/**
 * Uses the sidecar binary to get the display name and config template of every plugin in a package.<br>
 * Results are cached until the installed packages change, as each call spawns the sidecar.
 * @param package_name the package name e.g. @pi-tray/builtin
 * @returns plugin info keyed by the plugin's name within the package, e.g. `run_command`
 */
const get_package_plugin_info = (package_name: string): Promise<Record<string, PluginInfo>> => {
    const cached_info = plugin_info_cache.get(package_name);
    if (cached_info) {
        return cached_info;
    }

    const info_promise = (async () => {
        const command = Command.sidecar("binaries/sidecar", ["plugin-info", package_name]);
        const result = await command.execute();

        if (result.code !== 0) {
            console.error("Failed to get plugin info for package:", package_name, result);
            throw new Error(`Failed to get plugin info for package: ${package_name}`);
        }

        return JSON.parse(result.stdout.trim()) as Record<string, PluginInfo>;
    })();

    // don't cache failures, so the next call retries
    info_promise.catch(() => plugin_info_cache.delete(package_name));

    plugin_info_cache.set(package_name, info_promise);
    return info_promise;
}

/**
 * Gets the display name and config template of a plugin.
 * @param plugin_name the fully qualified plugin name e.g. @pi-tray/builtin/run_command
 * @returns the plugin info, or null if the plugin isn't found in its package
 */
export const get_plugin_info = async (plugin_name: string): Promise<PluginInfo | null> => {
    // the plugin's own name is always the last segment, everything before it is the (possibly scoped) package
    const separator_idx = plugin_name.lastIndexOf("/");
    if (separator_idx <= 0) {
        return null;
    }

    const package_name = plugin_name.slice(0, separator_idx);
    const plugin_key = plugin_name.slice(separator_idx + 1);

    const package_info = await get_package_plugin_info(package_name);
    return package_info[plugin_key] ?? null;
}

/**
 * A React hook that provides a plugin's display name and config template.
 * @param plugin_name the fully qualified plugin name, or null if there is no plugin
 * @returns the plugin info, `undefined` while loading, or `null` if there is no plugin or it couldn't be loaded
 */
export const usePluginInfo = (plugin_name: string | null) => {
    const [info, setInfo] = useState<PluginInfo | null | undefined>(undefined);

    useEffect(() => {
        if (!plugin_name) {
            setInfo(null);
            return;
        }

        // ignore results that arrive after the plugin has changed
        let superseded = false;
        setInfo(undefined);

        get_plugin_info(plugin_name)
            .then(new_info => {
                if (!superseded) {
                    setInfo(new_info);
                }
            })
            .catch(error => {
                console.error(`Error getting info for plugin ${plugin_name}:`, error);
                if (!superseded) {
                    setInfo(null);
                }
            });

        return () => {
            superseded = true;
        };
    }, [plugin_name]);

    return info;
}
export const unwrap_plugin_reference = (plugin_ref: PluginReference) => {
    if (typeof plugin_ref === "string") {
        return {name: plugin_ref, config: {}};
    }

    return {name: plugin_ref.name, config: plugin_ref.config || {}};
}

// TODO: observe node_modules or package-lock.json so then we know when updates are happened and the plugin list needs to be rescanned. ideally supporting any manager but npm gets priority
await watch(package_json, async () => {
    console.log("package.json changed, notifying listeners...");
    notify_package_list_change();
});
