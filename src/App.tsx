import "./App.css";

import {LeftNav} from "./components/LeftNav";
import {StatusToast} from "./components/StatusToast";

import {NotFound} from "./pages/NotFound";
import {GridEditorPage} from "./pages/GridEditorPage";
import {PluginManagerPage} from "./pages/PluginManagerPage";
import {AssetManagerPage} from "./pages/AssetManagerPage";
import {SettingsPage} from "./pages/SettingsPage";
import {AnimatedRouter} from "./components/AnimatedRouter";
import {DevToolsPage} from "./pages/DevToolsPage";

const App = () => {
    return (
        <div className="font-dm-sans flex h-screen max-h-screen bg-base-100 select-none">
            <LeftNav/>
            <main className="py-4 px-6 w-full h-full">
                <AnimatedRouter
                    routes={{
                        "/": <GridEditorPage/>,
                        "/plugins": <PluginManagerPage/>,
                        "/assets": <AssetManagerPage/>,
                        "/settings": <SettingsPage/>,
                        "/devtools": <DevToolsPage />,
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

            <StatusToast/>
        </div>
    )
}

export default App;
