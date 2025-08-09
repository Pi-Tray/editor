import path from "path";
import {createRequire} from "module";

// thanks https://stackoverflow.com/a/26227660/19678893
const appdata_root = process.env.APPDATA || (process.platform === "darwin" ? process.env.HOME + "/Library/Application Support" : process.env.HOME + "/.config");

// returns the path relative to the appdata root directory
const appdata = (in_path: string): string => {
    return path.join(appdata_root, in_path);
}

const data_dir = appdata("pi-tray");
const in_data_dir = (in_path: string): string => {
    return path.join(data_dir, in_path);
}

const plugin_env = in_data_dir("plugin-env");
const in_plugin_env = (in_path: string): string => {
    return path.join(plugin_env, in_path);
}

const command = process.argv[2];

switch (command) {
    case "list-plugins":
        // lists the plugins inside a given package

        const pkg_ref = process.argv[3];
        if (!pkg_ref) {
            console.error("Usage: sidecar list-plugins <package-ref>");
            process.exit(1);
        }

        const pkg_require = createRequire(in_plugin_env("package.json"));
        try {
            const pkg = pkg_require(pkg_ref);
            if (pkg) {
                console.log(JSON.stringify(Object.keys(pkg)));
            } else {
                console.log(`No plugins found in ${pkg_ref}.`);
            }
        } catch (error) {
            console.error(`Error loading package ${pkg_ref}:`, error);
            process.exit(1);
        }

        break;
}
