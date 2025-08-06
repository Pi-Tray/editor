export const StatusToast = () => {
    return (
        <div className="toast toast-bottom toast-end">
            <div className="inline-flex items-center gap-2 rounded-full bg-base-300 px-3 py-1.5 text-sm text-base-content">
                <span>Running</span>
                <span className="status status-success"></span>
            </div>
        </div>
    );
}
