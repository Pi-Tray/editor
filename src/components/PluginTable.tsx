import {useCallback, useEffect, useState} from "react";

import {RefreshCw} from "lucide-react";

import {check_plugin_updates, PackageUpdateStatus, update_plugin_package} from "../util/plugin_updates";

/**
 * Shortens commit hashes for display, leaves version numbers alone.
 */
const format_revision = (status: PackageUpdateStatus, revision: string | null) => {
    if (!revision) {
        return "?";
    }

    return status.source.kind === "github" ? revision.slice(0, 7) : revision;
}

/**
 * Lists installed plugin packages with their update status, and lets the user update them.
 * @returns the element
 */
export const PluginTable = () => {
    const [statuses, setStatuses] = useState<PackageUpdateStatus[] | null>(null);
    const [checking, setChecking] = useState(false);

    // npm can't run two installs in the same directory at once, so only one update runs at a time
    const [updating_name, setUpdatingName] = useState<string | null>(null);

    const check = useCallback(
        async () => {
            setChecking(true);

            try {
                setStatuses(await check_plugin_updates());
            } catch (error) {
                console.error("Failed to check for plugin updates:", error);
            }

            setChecking(false);
        },
        []
    );

    // check once when opened, more would burn through github's rate limit
    useEffect(() => {
        check();
    }, [check]);

    const update_packages = useCallback(
        async (to_update: PackageUpdateStatus[]) => {
            for (const status of to_update) {
                setUpdatingName(status.name);

                try {
                    await update_plugin_package(status);
                } catch (error) {
                    console.error(`Failed to update ${status.name}:`, error);
                }
            }

            setUpdatingName(null);
            await check();
        },
        [check]
    );

    const busy = checking || updating_name !== null;
    const updatable = statuses ? statuses.filter(status => status.update_available) : [];

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold mr-auto">Updates</h2>

                {updatable.length > 1 && (
                    <button className="btn btn-sm btn-primary" disabled={busy} onClick={() => update_packages(updatable)}>
                        Update all ({updatable.length})
                    </button>
                )}

                <button className="btn btn-sm btn-outline" disabled={busy} onClick={check}>
                    <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
                    Check
                </button>
            </div>

            {statuses === null && <p className="opacity-70">Checking for updates...</p>}
            {statuses !== null && statuses.length === 0 && <p className="opacity-70">No plugin packages installed.</p>}

            {statuses !== null && statuses.length > 0 && (
                <table className="table table-sm">
                    <thead>
                    <tr>
                        <th>Package</th>
                        <th>Installed</th>
                        <th>Latest</th>
                        <th></th>
                    </tr>
                    </thead>

                    <tbody>
                    {statuses.map(status => (
                        <tr key={status.name}>
                            <td>
                                <div className="font-medium">{status.name}</div>
                                <div className="text-xs opacity-60">{status.spec}</div>
                            </td>
                            <td className="font-mono text-xs">{format_revision(status, status.installed)}</td>
                            <td className="font-mono text-xs">{status.error ? "-" : format_revision(status, status.latest)}</td>
                            <td className="text-right">
                                {status.error && <span className="text-xs text-warning" title={status.error}>{status.error}</span>}

                                {!status.error && !status.update_available && <span className="text-xs opacity-60">Up to date</span>}

                                {!status.error && status.update_available && (
                                    <button className="btn btn-xs btn-primary" disabled={busy} onClick={() => update_packages([status])}>
                                        {updating_name === status.name ? <span className="loading loading-spinner loading-xs" /> : "Update"}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
