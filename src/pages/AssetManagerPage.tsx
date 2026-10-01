import {create_asset, delete_asset, rename_asset, replace_asset, useAssets} from "../util/assets.ts";
import {useCallback} from "react";

const AssetTable = () => {
    const assets = useAssets();

    if (!assets || assets.length === 0) {
        return <i className="opacity-80">No assets yet. Time to create the first?</i>;
    }

    return (
        <table className="w-full border-collapse">
            <thead>
                <tr>
                    <th className="border p-2">Preview</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {assets.map(asset => (
                    <tr key={asset.name} title={`Asset ID: ${asset.id}`}>
                        <td className="border p-2">
                            <img src={asset.preview_url} alt={asset.name} className="max-w-[4rem] max-h-[4rem]" />
                        </td>

                        <td className="border p-2">{asset.name}</td>

                        <td className="border p-2">
                            <button
                                className="btn btn-sm btn-primary mr-2"
                                onClick={() => {
                                    const new_name = prompt("Enter a new name for the asset:", asset.name);
                                    if (new_name && new_name.trim() !== "" && new_name !== asset.name) {
                                        rename_asset(asset.id, new_name.trim()).catch(error => {
                                            console.error("Error renaming asset:", error);
                                            alert("Error renaming asset.");
                                        });
                                    }
                                }}
                            >
                                Rename
                            </button>

                            <button
                                className="btn btn-sm btn-primary mr-2"
                                onClick={() => {
                                    const file_input = document.createElement("input");
                                    file_input.type = "file";
                                    file_input.accept = "image/*";
                                    file_input.onchange = async () => {
                                        if (file_input.files && file_input.files.length > 0) {
                                            const file = file_input.files[0];
                                            try {
                                                await replace_asset(asset.id, file);
                                                alert("Asset replaced successfully!");
                                            } catch (error) {
                                                console.error("Error replacing asset:", error);
                                                alert("Error replacing asset.");
                                            }
                                        }
                                    };
                                    file_input.click();
                                }}
                            >
                                Replace file
                            </button>


                            <button
                                className="btn btn-sm btn-error"
                                onClick={async () => {
                                    if (confirm(`Are you sure you want to delete the asset "${asset.name}"? This action cannot be undone.`)) {
                                        delete_asset(asset.id).catch(error => {
                                            console.error("Error deleting asset:", error);
                                            alert("Error deleting asset.");
                                        });
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

const AssetCreateForm = () => {
    const on_submit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const form_data = new FormData(event.currentTarget);
            const file = form_data.get("file") as File | null;
            const name = form_data.get("name") as string | null;

            if (!file) {
                alert("Please select a file to create an asset from.");
                return;
            }

            try {
                await create_asset(file, name || undefined);
                alert("Asset created successfully!");
                event.currentTarget.reset();
            } catch (error) {
                console.error("Error creating asset:", error);
                alert("Error creating asset.");
            }
        },
        []
    );

    return (
        <form onSubmit={on_submit} className="flex flex-col gap-2">
            <label className="flex flex-col gap-1">
                Select a file to create an asset from:
                <input type="file" name="file" accept="image/*" required />
            </label>
            <label className="flex flex-col gap-1">
                Optional name for the asset (defaults to the file name):
                <input type="text" name="name" placeholder="Asset name" />
            </label>
            <button type="submit" className="btn btn-primary">Create Asset</button>
        </form>
    );
}

export const AssetManagerPage = () => {
    return (
        <>
            <h1 className="text-2xl font-bold">Manage assets</h1>

            <AssetTable />

            <h2 className="text-xl font-bold mt-4">Create a new asset</h2>
            <AssetCreateForm />
        </>
    );
}
