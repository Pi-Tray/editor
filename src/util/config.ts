import {exists, writeTextFile, readTextFile} from "@tauri-apps/plugin-fs";
import { join, dataDir } from '@tauri-apps/api/path';

const appdata = await dataDir();
const CONFIG_FILE = await join(appdata, "pi-tray", "editor.json");

// explicitly declare something as undefined here is you don't want to set a default value
// we are using the keys of defaults as types for the config getters and setters so it needs to be declared here
const DEFAULTS = {
    devtools: false
};

/**
 * Get a configuration value from the config file, or the default value if it does not exist.
 * @param key the key of the configuration value to get
 */
export const get_config = async (key: keyof typeof DEFAULTS): Promise<any> => {
    if (!await exists(CONFIG_FILE)) {
        // write default config and return the default value
        await writeTextFile(CONFIG_FILE, JSON.stringify(DEFAULTS, null, 4));
        return DEFAULTS[key];
    }

    const config = JSON.parse(await readTextFile(CONFIG_FILE));
    if (key in config) {
        return config[key];
    } else {
        // if the key does not exist for some reason, return the default value
        return DEFAULTS[key];
    }
}

/**
 * Set a configuration value in the config file.
 * @param key the key of the configuration value to set
 * @param value the value to set
 */
export const set_config = async (key: keyof typeof DEFAULTS, value: any): Promise<void> => {
    let config: Record<string, any>;

    if (await exists(CONFIG_FILE)) {
        config = JSON.parse(await readTextFile(CONFIG_FILE));
    } else {
        config = DEFAULTS;
    }

    config[key] = value;
    await writeTextFile(CONFIG_FILE, JSON.stringify(config, null, 4));
}
