import {ConfigKey, useConfigValue} from "../util/config";

interface SettingProps {
    label: string;
    config_key: ConfigKey;
}

const ToggleSetting = ({label, config_key}: SettingProps) => {
    const [value, setValue] = useConfigValue(config_key);

    return (
        <label className="label">
            {label}

            <input
                type="checkbox"
                className="toggle toggle-primary"

                checked={value}
                onChange={
                    (e) => setValue(e.target.checked)
                }
            />
        </label>
    );
}

export const SettingsPage = () => {
    return (
        <>
            <h1 className="text-2xl font-bold">Settings</h1>

            <div className="flex flex-wrap gap-4 mt-4">
                <ToggleSetting label="Show DevTools" config_key="devtools" />
            </div>
        </>
    );
}
