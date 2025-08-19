import {useCallback, useState} from "react";

import {useGridCell, useGridShape} from "../util/grid";
import {PushButtonGrid} from "../components/PushButtonGrid";

import {X} from "lucide-react";

interface SidebarContentProps {
    coords: {x: number, y: number};
}

const SidebarContent = ({coords}: SidebarContentProps) => {
    const [cell, setCellData] = useGridCell(coords.y, coords.x);

    return <p>{cell?.text}</p>
}

export const GridEditorPage = () => {
    const [shape] = useGridShape();

    // when a button is selected, the sidebar will be open
    const [selected_button, setSelectedButton] = useState<{x: number, y: number} | null>(null);

    const button_clicked = useCallback(
        (x: number, y: number) => {
            setSelectedButton({x, y});
        },
        []
    );

    const close_sidebar = useCallback(
        () => {
        setSelectedButton(null);
        },
        []
    );


    return (
        <div className="flex h-full max-h-full w-full max-w-full flex-1">
            <div className={`flex-1 flex flex-col h-full max-h-full max-w-full gap-4 ${selected_button ? "w-33 mr-71" : "w-full mr-0"}`}>
                <h1 className="text-2xl font-bold">Edit grid</h1>

                <div className="flex-1">
                    <PushButtonGrid rows={shape.rows} cols={shape.cols} on_click={button_clicked} highlight={selected_button} />
                </div>

                <p>hello<br/>bello</p>
            </div>

            <aside className={`h-full fixed top-0 right-0 w-66 overflow-y-auto bg-base-200 border-l border-l-base-300 p-4 transition-transform ${!selected_button && "translate-x-full"}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Configure button</h3>

                    <button title="Close configure button sidebar" onClick={close_sidebar} className="cursor-pointer">
                        <X />
                    </button>
                </div>

                {selected_button && <SidebarContent coords={selected_button} />}
            </aside>
        </div>
    );
}
