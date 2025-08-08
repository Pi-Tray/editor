import "./App.css";

import {WSProvider} from "./contexts/WSProvider";
import {useConfigValue} from "./util/config";

import {AnimatedRouter} from "./components/AnimatedRouter";
import {LeftNav} from "./components/LeftNav";
import {StatusToast} from "./components/StatusToast";

import {NotFound} from "./pages/NotFound";
import {GridEditorPage} from "./pages/GridEditorPage";
import {PluginManagerPage} from "./pages/PluginManagerPage";
import {AssetManagerPage} from "./pages/AssetManagerPage";
import {SettingsPage} from "./pages/SettingsPage";
import {DevToolsPage} from "./pages/DevToolsPage";
import {DevToolsWebsocketPage} from "./pages/DevToolsPage/DevToolsWebsocketPage";

/**
 * A wrapper component that conditionally renders the WebSocket provider based on the provided URL.<br>
 * If the URL is `null`, it will not render the provider and simply return the children.<br>
 * This signals to children components using `WSProvider` hooks that no URL has been configured by the user yet.
 * @param children the children to render inside the provider
 * @param url the WebSocket URL to connect to, or `null` if no URL is configured
 * @constructor
 */
const ConditionalWSProvider = ({children, url}: { children: React.ReactNode, url: string | null }) => {
    if (url === null) {
        // if no WS_URL is provided, don't render the provider
        return <>{children}</>;
    }

    // use key to prevent leftover state from previous connections
    // TODO: make the state in WSProvider stable so this isn't needed as this causes a full rerender of the page
    return (
        <WSProvider url={url} key={`ws-provider-${url}`}>
            {children}
        </WSProvider>
    );
}

const App = () => {
    // TODO: this needs to watch file changes so the server process can tell the editor where it is
    const [ws_url] = useConfigValue("ws_url");

    return (
        <ConditionalWSProvider url={ws_url}>
            <div className="font-dm-sans flex h-screen max-h-screen bg-base-100 select-none">
                <LeftNav/>
                <main className="py-4 px-6 w-full h-full">
                    <AnimatedRouter
                        routes={{
                            "/": <GridEditorPage/>,
                            "/plugins": <PluginManagerPage/>,
                            "/assets": <AssetManagerPage/>,
                            "/settings": <SettingsPage/>,
                            "/devtools": <DevToolsPage/>,
                            "/devtools/websocket": <DevToolsWebsocketPage/>,
                        }}

                        not_found={<NotFound/>}

                        animation_props={{
                            initial: {opacity: 0},
                            animate: {opacity: 1},
                            exit: {opacity: 0},
                            transition: {duration: 0.25, ease: "easeInOut"},

                            className: "h-full w-full"
                        }}
                    />
                </main>

                {/* use a key to force remounting the component when the websocket url changes to reset its internal state */}
                <StatusToast key={`status-${ws_url}`} />
            </div>
        </ConditionalWSProvider>
    );
}

export default App;
