import {useState, useEffect} from "react";

const PING_INTERVAL = 15000; // 15 seconds
const PONG_WINDOW = 30000; // 30 seconds, checked, every ping interval, after which we consider the connection dead

type ObservedWebSocketSubscriber = (status: WebSocket["readyState"]) => void;

interface ObservedWebSocketConnection {
    ws: WebSocket;
    status: WebSocket["readyState"];
    subscribers: Set<ObservedWebSocketSubscriber>;
    interval: number;
    last_pong_timestamp?: number;
    has_pinged?: boolean;
}

const connections = new Map<string, ObservedWebSocketConnection>();

/**
 * Subscribe to a WebSocket URL to monitor its status.<br>
 * Will establish a new connection if it doesn't exist, or subscribe to an existing one.
 * @param url the WebSocket URL to subscribe to
 * @param callback a callback function that will be called with the WebSocket status whenever it changes
 */
const subscribe_to_url = (url: string, callback: (status: WebSocket["readyState"]) => void) => {
    // TODO: port exponential backoff here since it isnt reattempting, or maybe just steal WSContext completely from the client
    // TODO: port pings to the client

    let connection = connections.get(url);

    if (!connection) {
        // establish a new connection if it doesn't exist
        const ws = new WebSocket(url);
        const new_connection: ObservedWebSocketConnection = {
            ws,
            status: ws.readyState,
            subscribers: new Set<ObservedWebSocketSubscriber>(),
            interval: -1
        }

        ws.onopen = () => {
            new_connection.status = WebSocket.OPEN;
            new_connection.subscribers.forEach(subscriber => subscriber(new_connection.status));
        };

        ws.onclose = () => {
            new_connection.status = WebSocket.CLOSED;
            new_connection.subscribers.forEach(subscriber => subscriber(new_connection.status));
        };

        ws.onerror = () => {
            // TODO: how should we handle errors?
            new_connection.status = WebSocket.CLOSED;
            new_connection.subscribers.forEach(subscriber => subscriber(new_connection.status));
        };

        // establish ping interval
        new_connection.interval = setInterval(() => {
            if (new_connection.ws.readyState === WebSocket.OPEN) {
                new_connection.ws.send(JSON.stringify({action: "ping"}));
            }

            // check if we received a pong recently (provided we have actually pinged yet)
            console.log(`Checking pong for ${url}: last pong at ${new_connection.last_pong_timestamp}, current time ${Date.now()}`);
            if (new_connection.has_pinged && (!new_connection.last_pong_timestamp || Date.now() - new_connection.last_pong_timestamp > PONG_WINDOW)) {
                // if not, close the connection
                new_connection.ws.close();
                new_connection.status = WebSocket.CLOSED;
                new_connection.subscribers.forEach(subscriber => subscriber(new_connection.status));
            }

            new_connection.has_pinged = true;
        }, PING_INTERVAL);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.action === "pong") {
                // update the last pong timestamp
                new_connection.last_pong_timestamp = Date.now();
            }
        }

        connections.set(url, new_connection);
        connection = new_connection;
    }

    // add the subscriber to the existing connection
    connection.subscribers.add(callback);
}

const unsubscribe_from_url = (url: string, callback: (status: WebSocket["readyState"]) => void) => {
    const connection = connections.get(url);
    if (connection) {
        connection.subscribers.delete(callback);
        if (connection.subscribers.size === 0) {
            // if there are no more subscribers, clear the interval and close the WebSocket
            clearInterval(connection.interval);
            connection.ws.close();
            connections.delete(url);
        }
    }
}

/**
 * A React hook to observe the status of a WebSocket connection.<br>
 * It will return the current status of the WebSocket connection, and update it whenever the status changes.
 * @param url the WebSocket URL to monitor
 * @returns the current status of the WebSocket connection, or null if the connection is not established yet
 */
export const useWebsocketStatus = (url: string): WebSocket["readyState"] | null => {
    const [status, setStatus] = useState<WebSocket["readyState"] | null>(null);

    useEffect(() => {
        // on mount, subscribe to the WebSocket URL

        const update_status = (newStatus: WebSocket["readyState"]) => {
            setStatus(newStatus);
        };

        subscribe_to_url(url, update_status);

        // unsubscribe when the component unmounts
        return () => {
            unsubscribe_from_url(url, update_status);
        };
    }, []);

    return status;
}
