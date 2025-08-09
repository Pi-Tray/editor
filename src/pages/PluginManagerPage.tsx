import {usePluginList} from "../util/plugins";

export const PluginManagerPage = () => {
    const plugins = usePluginList();

    // basic package name list test

    return (
        <>
            <h1 className="text-2xl font-bold">Manage plugins</h1>
            <pre>{plugins.join("\n")}</pre>
        </>
    );
}
