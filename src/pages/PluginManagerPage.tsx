import {useState} from "react";

import {install_package, usePluginList} from "../util/plugins";

export const PluginManagerPage = () => {
    const plugins = usePluginList();

    const [pkg_name_input, setPkgNameInput] = useState("");
    const [installing, setInstalling] = useState(false);

    // basic package name list and install test

    return (
        <>
            <h1 className="text-2xl font-bold">Manage plugins</h1>
            <pre>{plugins.join("\n")}</pre>

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
