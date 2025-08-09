import {useEffect, useState} from "react";

import {install_package, list_plugins_in_package, usePackageList} from "../util/plugins";

export const PluginManagerPage = () => {
    const packages = usePackageList();

    const [plugins, setPlugins] = useState<string[]>([]);

    const [pkg_name_input, setPkgNameInput] = useState("");
    const [installing, setInstalling] = useState(false);

    // reindex plugins when packages change
    // TODO: do this more optimised in the real thing
    useEffect(() => {
        // use iife to safely use an async function inside useEffect
        (async () => {
            setPlugins([]);

            let new_plugins: string[] = [];

            for (const pkg of packages) {
                try {
                    const pkg_plugins = await list_plugins_in_package(pkg);
                    pkg_plugins.forEach(plugin => {
                        if (!new_plugins.includes(plugin)) {
                            new_plugins.push(plugin);
                        }
                    });
                } catch (error) {
                    console.error(`Error listing plugins in package ${pkg}:`, error);
                }
            }

            setPlugins(new_plugins);
        })();
    }, [packages]);

    return (
        <>
            <h1 className="text-2xl font-bold">Manage plugins</h1>
            <pre>{plugins.length > 0 ? plugins.join("\n") : "Indexing plugins..."}</pre>

            <input type="text" disabled={installing} value={pkg_name_input} onChange={(e) => setPkgNameInput(e.target.value)} placeholder="Package name or git URL" className="border p-2 rounded" />
            <button className="btn btn-primary" disabled={installing} onClick={async () => {
                // TODO: make this proper and secure, this is just a test

                if (pkg_name_input.trim() === "") {
                    alert("Please enter a package name or git URL.");
                    return;
                }

                if (!confirm("This is a test, and if you don't know what this is, you should cancel now.")) {
                    return;
                }

                setInstalling(true);

                try {
                    await install_package(pkg_name_input.trim());
                    alert("Package installed successfully.");
                } catch (error) {
                    console.error("Error installing package:", error);
                    alert("Failed to install package. Check the console for details.");
                }

                setInstalling(false);
            }}>
                {installing ? "..." : "Install"}
            </button>
        </>
    );
}
