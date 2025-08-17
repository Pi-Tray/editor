import {useCallback} from "react";
import {useGridCell} from "../../util/grid";

import {AutoTextScale} from "../AutoTextScale";

import {DynamicIcon} from "lucide-react/dynamic";

import styles from "./component.module.css";

// adapted from client PushButton code, but ws behaviour ripped out and adapted to a callback function
// also uses the hook useGridCell to handle the button's representation rather than asking the server for it
// TODO: would be good to have some unified component package rather than duplicating this code by hand and changing it

interface PushButtonProps {
    x: number;
    y: number;
    on_click?: (x: number, y: number) => void;
    style?: React.CSSProperties;
    className?: string;
}

/**
 * The button component that represents a single push button on the grid.
 * @param x x coordinate of the button on the grid, used to identify the button in the callback
 * @param y y coordinate of the button on the grid, used to identify the button in the callback
 * @param style inline styles to apply to the button
 * @param className additional class names to apply
 * @param on_click callback function to call when the button is clicked, receives x and y coordinates
 * @returns the element
 */
export const PushButton = ({x, y, style, className, on_click}: PushButtonProps) => {
    // this made me realise that all the files are row first, but we use x and y for indices. doesnt really matter just initially confusing
    const [cell] = useGridCell(y, x);

    // log function that includes button coordinates, acts just like console.log
    const button_log = useCallback(
        (...msg: any[]) => {
            console.log(`[PushButton ${x},${y}]:`, ...msg);
        },
        [x, y]
    );

    // no prizes for guessing what this does
    const button_error = useCallback(
        (...msg: any[]) => {
            console.error(`[PushButton ${x},${y}]:`, ...msg);
        },
        [x, y]
    );

    // run callback when the button is clicked
    const handle_click = useCallback(
        () => {
            try {
                button_log("Button clicked.");
                if (on_click) {
                    on_click(x, y);
                } else {
                    button_log("No on_click callback provided, not sending push action.");
                }
            } catch (e) {
                button_error("Error in on_click callback:", e);
            }
        },
        [on_click, x, y]
    );

    if (cell) {
        button_log(cell);
    } else {
        button_error("No cell data found for button at", x, y);
    }

    let content: React.ReactNode = null;

    const text = cell?.text || "";
    const text_is_icon = cell?.text_is_icon || false;

    if (text) {
        if (text_is_icon) {
            // if the name is "pi-tray", load our logo specially :)
            if (text === "pi-tray") {
                content = (
                    <img
                        src={`${import.meta.env.BASE_URL}icon.svg`}
                        alt="Pi Tray Logo"
                        className={styles.icon}
                        draggable={false}
                    />
                );
            } else {
                // otherwise, use DynamicIcon to load the lucide icon by name

                content = (
                    <DynamicIcon
                        // @ts-expect-error we have no realistic way to validate the icon name at compile time, so assume it's valid and catch errors at runtime
                        name={text}
                        className={styles.icon}
                        fallback={
                            // fallback to text if the icon is not found
                            () => <AutoTextScale>{text}</AutoTextScale>
                        }
                    ></DynamicIcon>
                );
            }
        } else {
            content = <AutoTextScale>{text}</AutoTextScale>;
        }
    }

    return (
        <button style={style} className={`${styles.element} ${className || ""}`} onClick={handle_click}>
            {content}
        </button>
    );
}
