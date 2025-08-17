import {useGridShape} from "../util/grid";
import {PushButtonGrid} from "../components/PushButtonGrid";

export const GridEditorPage = () => {
    const [shape] = useGridShape();

    return (
        <div className="flex flex-col h-full gap-2">
            <h1 className="text-2xl font-bold">Edit grid</h1>

            <div className="flex-1">
                <PushButtonGrid rows={shape.rows} cols={shape.cols} />
            </div>

            <p className="flex-1">hello</p>
        </div>
    );
}
