import "./App.css";

import {Route, Switch} from "wouter";

import {LeftNav} from "./components/LeftNav.tsx";

import {GridEditor} from "./screens/GridEditor.tsx";
import {NotFound} from "./screens/NotFound.tsx";

const App = () => {
    return (
        <div className="flex h-screen bg-base-100">
            <LeftNav />
            <main className="font-dm-sans py-4 px-6 w-full h-full">
                <Switch>
                    <Route path="/" component={GridEditor} />

                    <Route>
                        <NotFound />
                    </Route>
                </Switch>
            </main>
        </div>
    )
}

export default App;
