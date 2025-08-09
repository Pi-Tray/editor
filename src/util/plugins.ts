import {useEffect, useState} from "react";

import {dataDir, join} from "@tauri-apps/api/path";
import {readTextFile, watch} from "@tauri-apps/plugin-fs";

const appdata = await dataDir();

const plugin_env = await join(appdata, "pi-tray", "plugin-env");
const package_json = await join(plugin_env, "package.json");

/**
 * Lists the package names of installed plugins by reading the `package.json` file in the plugin-env directory.
 * @returns array of installed plugin package names
 */
export const list_installed_plugins = async (): Promise<string[]> => {
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
 * Subscribe to changes in the list of installed plugins.<br>
 * This will notify the callback whenever plugin-env's `package.json` file changes, indicating a change in the installed plugins.
 * @param callback the callback to call when the list of installed plugins changes
 */
export const subscribe_to_plugin_list_change = (callback: () => void): void => {
    change_listeners.add(callback);
}

/**
 * Unsubscribe from changes in the list of installed plugins.
 * @param callback a reference equivalent to the callback passed to `subscribe_to_plugin_list_change`
 */
export const unsubscribe_from_plugin_list_change = (callback: () => void): void => {
    change_listeners.delete(callback);
}

const notify_plugin_list_change = (): void => {
    change_listeners.forEach(callback => callback());
}

/**
 * A React hook that provides the list of installed plugins.<br>
 * It fetches the list of installed plugins from the `package.json` file in the plugin-env directory and updates whenever the file changes.
 * @returns array of installed plugin package names
 */
export const usePluginList = () => {
    const [plugins, setPlugins] = useState<string[]>([]);

    useEffect(() => {
        const fetch_plugins = async () => {
            setPlugins(await list_installed_plugins());
        };

        fetch_plugins();

        const listener = () => fetch_plugins();
        subscribe_to_plugin_list_change(listener);

        return () => {
            unsubscribe_from_plugin_list_change(listener);
        };
    }, []);

    return plugins;
}

await watch(package_json, async () => {
    console.log("package.json changed, notifying listeners...");
    notify_plugin_list_change();
});
