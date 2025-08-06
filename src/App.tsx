import "./App.css";

import {Route, Switch} from "wouter";

import {LeftNav} from "./components/LeftNav";
import {StatusToast} from "./components/StatusToast";

import {NotFound} from "./pages/NotFound";
import {GridEditorPage} from "./pages/GridEditorPage";
import {PluginManagerPage} from "./pages/PluginManagerPage";
import {AssetManagerPage} from "./pages/AssetManagerPage";
import {SettingsPage} from "./pages/SettingsPage";

const App = () => {
    return (
        <div className="font-dm-sans flex h-screen bg-base-100 select-none">
            <LeftNav />
            <main className="py-4 px-6 w-full h-full">
                <Switch>
                    <Route path="/" component={GridEditorPage} />
                    <Route path="/plugins" component={PluginManagerPage} />
                    <Route path="/assets" component={AssetManagerPage} />

                    <Route path="/settings" component={SettingsPage} />

                    <Route>
                        <NotFound />
                    </Route>
                </Switch>
            </main>

            <StatusToast />
        </div>
    )
}

export default App;
