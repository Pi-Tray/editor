import {useCallback, useEffect, useRef, useState} from "react";
import {ConfigKey, useConfigValue} from "../util/config";

interface BaseSettingProps {
    label: string;
    tooltip?: string;
    config_key: ConfigKey;
}

const ToggleSetting = ({label, config_key, tooltip}: BaseSettingProps) => {
    const [value, setValue] = useConfigValue(config_key);

    return (
        <label className="label">
            {label}

            <input
                type="checkbox"
                className="toggle toggle-primary"

                title={tooltip}

                checked={value}
                onChange={
                    (e) => setValue(e.target.checked)
                }
            />
        </label>
    );
}


interface TextSettingProps extends BaseSettingProps {
    placeholder?: string;
    type?: "text" | "number" | "password" | "url" | "email" | "tel" | "search" | "date" | "time";
    button_text?: string;
    validate?: (value: string) => "" | string; // returns an error message if invalid, or an empty string if valid
    pattern?: string;
}

const TextSetting = ({label, config_key, button_text, type, placeholder, pattern, validate, tooltip}: TextSettingProps) => {
    const [config_value, setConfigValue] = useConfigValue(config_key);
    const [input_value, setInputValue] = useState(config_value || "");

    const input_ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // update input value when config value changes
        setInputValue(config_value || "");
    }, [config_value]);

    const validate_and_set = useCallback(
        (value: string) => {
            if (validate) {
                const error = validate(value);

                if (error) {
                    // if validation fails, show an alert and don't set the value
                    input_ref.current?.setCustomValidity(error);
                    input_ref.current?.reportValidity();
                    return;
                }
            }

            setConfigValue(value);
        },
        [setConfigValue, validate, input_ref]
    );

    return (
        <div className="flex gap-2 items-center">
            <label className="label">
                {label}

                <input
                    ref={input_ref}

                    type={type || "text"}
                    className="input input-bordered w-full max-w-xs"
                    placeholder={placeholder}

                    title={tooltip}

                    defaultValue={config_value}
                    value={input_value}
                    onChange={
                        (e) => {
                            input_ref.current?.setCustomValidity("");
                            setInputValue(e.target.value);
                        }
                    }

                    pattern={pattern}
                />
            </label>

            <button className="btn btn-primary"
                    onClick={() => {
                        validate_and_set(input_value);
                    }
            }>
                {button_text || "Apply"}
            </button>
        </div>
    );
}

export const SettingsPage = () => {
    const validate_ws_url = useCallback(
        (value: string) => {
            try {
                const url = new URL(value);

                if (url.protocol !== "ws:" && url.protocol !== "wss:") {
                    return "WebSocket URL must start with ws:// or wss://";
                }

                return "";
            } catch (e) {
                return "Invalid URL.";
            }
        },
        []
    );

    return (
        <>
            <h1 className="text-2xl font-bold">Settings</h1>

            <div className="flex flex-wrap gap-8 mt-4">
                <ToggleSetting
                    label="Show DevTools"
                    config_key="devtools"

                    tooltip="Enable or disable the DevTools page."
                />

                <TextSetting
                    label="WebSocket URL"
                    config_key="ws_url"

                    tooltip="The address which Pi-Tray Server is listening on for WebSocket connections."

                    type="url"
                    validate={validate_ws_url}
                    //pattern="^wss?://.+"
                />

                {/* TODO: should this be changed to an "override url" setting and have the url input be disabled if this option isn't enabled? */}
                <ToggleSetting
                    label="Lock WebSocket URL"
                    config_key="dont_overwrite_ws_url"

                    tooltip="If enabled, the WebSocket URL will not be automatically overwritten by the server process. This is useful if you want to use force a custom URL."
                />
            </div>
        </>
    );
}
