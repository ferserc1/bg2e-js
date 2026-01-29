import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import VitscnjLoaderPlugin from "bg2e-js/ts/db/VitscnjLoaderPlugin.ts";
import SceneAppController from "bg2e-js/ts/render/SceneAppController.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import CameraComponent, { OpticalProjectionStrategy } from "bg2e-js/ts/scene/Camera.ts";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";

class MyAppController extends SceneAppController {
    async loadScene() {

        // Register loader plugins
        // bg2ioPath is the path from the html file to the distribution files of the bg2io library, if
        // this path is different from the compiled js file (generated from this file, in this case, 
        // using Rollup)
        registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "dist/" }));
        registerComponents();

        // Load scene
        const loader = new Loader();
        const root = await loader.loadNode("../resources/test-scene/test-scene.vitscnj");

        // Get main camera
        // Add Orbit camera controller component to the camera node
        const mainCamera = CameraComponent.GetMain(root);
        mainCamera!.projectionStrategy = new OpticalProjectionStrategy();

        return root;
    }
}

window.onload = async () => {
    const canvasElem = document.getElementById('gl-canvas') as HTMLCanvasElement;
    if (!canvasElem) {
        console.error("Cannot find canvas element with id 'gl-canvas'");
        return;
    }
    const canvas = new Canvas(canvasElem, new WebGLRenderer());
    canvas.domElement.style.width = "100vw";
    canvas.domElement.style.height = "100vh";
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}
