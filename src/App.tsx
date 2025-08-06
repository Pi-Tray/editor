import "./App.css";

import {Route, Switch} from "wouter";

import {LeftNav} from "./components/LeftNav.tsx";

import {GridEditor} from "./screens/GridEditor.tsx";
import {NotFound} from "./screens/NotFound.tsx";
import {StatusToast} from "./components/StatusToast.tsx";

const App = () => {
    return (
        <div className="font-dm-sans flex h-screen bg-base-100 select-none">
            <LeftNav />
            <main className="py-4 px-6 w-full h-full">
                <Switch>
                    <Route path="/" component={GridEditor} />

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
