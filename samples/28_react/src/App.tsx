import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import AppController from './AppController.ts'
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import useBg2e from "bg2e-js/ts/react/useBg2e.ts";
import './App.css'
import { FrameUpdate } from 'bg2e-js/ts/app/MainLoop.js';

function App() {
    const [count, setCount] = useState(0)

    useBg2e("#bg2eCanvas", WebGLRenderer, AppController, (canvas, mainLoop) => {
        console.log("Canvas loaded:", canvas);
        console.log("Main loop started:", mainLoop);
        mainLoop.updateMode = FrameUpdate.MANUAL;
        const appCtrl = mainLoop.appController as AppController;
        console.log(appCtrl.selectionManager);
    });

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank" rel="noopener">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noopener">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
