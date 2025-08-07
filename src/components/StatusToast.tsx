import {useWebsocketStatus} from "../hooks/useWebsocketStatus";

import {motion} from "motion/react";

export const StatusToast = () => {
    const status = useWebsocketStatus("ws://192.168.137.1:8080");

    let text = "Connecting...";
    let status_class = "status-neutral";
    let show_pinger = true;

    if (status === WebSocket.OPEN) {
        text = "Running";
        status_class = "status-success";
        show_pinger = false;
    } else if (status === WebSocket.CLOSED || status === WebSocket.CLOSING) {
        text = "Stopped";
        status_class = "status-error";
        show_pinger = true;
    }

    return (
        <motion.div layout className="toast toast-bottom toast-end">
            <div className="inline-flex items-center gap-2 rounded-full bg-base-300 px-3 py-1.5 text-sm text-base-content">
                <span>{text}</span>

                <div className="inline-grid *:[grid-area:1/1]">
                    {show_pinger && <span className={`status animate-ping ${status_class}`}></span>}
                    <span className={`status ${status_class}`}></span>
                </div>
            </div>
        </motion.div>
    );
}
