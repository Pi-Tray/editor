import {useGridShape} from "../util/grid";

export const GridEditorPage = () => {
    const [shape] = useGridShape();

    return (
        <>
            <h1 className="text-2xl font-bold">Edit grid</h1>
            <p>{shape.cols}, {shape.rows}</p>
        </>
    );
}
