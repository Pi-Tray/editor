import {DynamicIcon} from "lucide-react/dynamic";
import {AutoTextScale} from "./AutoTextScale.tsx";
import {CUSTOM_ICON_MAP} from "../custom_icons.ts";

export const CustomDynamicIcon = ({name, className = ""}: {name: string, className?: string}) => {
    if (CUSTOM_ICON_MAP.has(name)) {
        return (
            <img
                src={CUSTOM_ICON_MAP.get(name)!.src}
                alt=""
                className={`${className} object-contain`}
                draggable={false}
            />
        );
    } else {
        // otherwise, use DynamicIcon to load the lucide icon by name

        return (
            <DynamicIcon
                // @ts-expect-error we have no realistic way to validate the icon name at compile time, so assume it's valid and catch errors at runtime
                name={name}
                className={className}
                fallback={
                    // fallback to text if the icon is not found
                    () => <AutoTextScale>{name}</AutoTextScale>
                }
            ></DynamicIcon>
        );
    }
}
