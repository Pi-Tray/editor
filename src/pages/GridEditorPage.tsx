import {useCallback, useEffect, useState} from "react";

import {useGridCell, useGridShape} from "../util/grid";
import {unwrap_plugin_reference} from "../util/plugins";
import {PushButtonGrid} from "../components/PushButtonGrid";

import {X} from "lucide-react";
import {JsonEditor} from "json-edit-react";

interface SidebarContentProps {
    coords: {x: number, y: number};
}

const SidebarContent = ({coords}: SidebarContentProps) => {
    const [cell, setCellData] = useGridCell(coords.y, coords.x);

    const plugin = cell && (cell.plugin ? unwrap_plugin_reference(cell.plugin) : null);

    const update_plugin_config = useCallback(
        (new_config: { [key: string]: any } | undefined) => {
            if (!cell) {
                return;
            }

            if (!cell.plugin) {
                return;
            }

            const new_plugin = unwrap_plugin_reference(cell.plugin);
            new_plugin.config = new_config;

            const new_cell = {
                ...cell,
                plugin: new_plugin
            }

            setCellData(new_cell);
        },
        [cell, setCellData]
    );

    const [cell_text_input, setCellTextInput] = useState(cell ? cell.text || "" : "");
    useEffect(() => {
        if (cell) {
            setCellTextInput(cell.text || "");
        }
    }, [cell]);

    if (!cell) {
        return <p>Empty cell</p>;
    }

    return (
        <>
            <label>
                Label:
                <input className="input input-bordered" value={cell_text_input} onChange={e => setCellTextInput(e.target.value)} onBlur={() => {
                    // TODO: fix the logic with the debounced autosave, it was just too many hooks setting each other off causing blank outs and infinite loops
                    setCellData({
                        ...cell,
                        text: cell_text_input
                    });
                }} />
            </label>

            <label className="flex items-center gap-2 my-2">
                Label type:
                <input type="radio" className="radio" name="label_type" checked={!cell.text_is_icon} onChange={() => {
                    setCellData({
                        ...cell,
                        text_is_icon: false
                    });
                }} /> Text
                <input type="radio" className="radio" name="label_type" checked={!!cell.text_is_icon} onChange={() => {
                    setCellData({
                        ...cell,
                        text_is_icon: true
                    });
                }} /> Icon
            </label>

            {plugin && <p>Plugin: {plugin.name}</p>}
            {!plugin && <p>No plugin!</p>}

            {/* @ts-ignore */}
            {plugin && plugin.config && <JsonEditor data={plugin.config} setData={update_plugin_config} />}
            {plugin && !plugin.config && <p>This plugin has no configuration set.</p>}
        </>
    );
}

export const GridEditorPage = () => {
    const [shape, setGridShape] = useGridShape();

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
            <div className={`flex-1 flex flex-col h-full max-h-full max-w-full gap-4 ${selected_button ? "w-25 mr-79" : "w-full mr-0"}`}>
                <h1 className="text-2xl font-bold">Edit grid</h1>

                <div className="flex-1">
                    <PushButtonGrid rows={shape.rows} cols={shape.cols} on_click={button_clicked} highlight={selected_button} />
                </div>

                <label className="flex items-center gap-2 mt-2">
                    Grid size:

                    <input
                        type="number"
                        className="input input-sm input-bordered w-15"
                        value={shape.cols}
                        onChange={e => setGridShape({rows: shape.rows, cols: Math.max(1, Math.min(20, Number(e.target.value)))})}
                        min={1}
                        max={20}
                    />
                    x
                    <input
                        type="number"
                        className="input input-sm input-bordered w-15"
                        value={shape.rows}
                        onChange={e => setGridShape({rows: Math.max(1, Math.min(20, Number(e.target.value))), cols: shape.cols})}
                        min={1}
                        max={20}
                    />

                    ({shape.cols * shape.rows} buttons)
                </label>
            </div>

            <aside className={`h-full fixed top-0 right-0 w-75 overflow-y-auto bg-base-200 border-l border-l-base-300 p-4 transition-transform ${!selected_button && "translate-x-full"}`}>
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

// TODO: clean into separate components, even if within the same file
