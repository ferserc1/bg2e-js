import Canvas from "bg2e/app/Canvas";
import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Camera, { OpticalProjectionStrategy } from "bg2e/scene/Camera";
import SceneAppController from "bg2e/render/SceneAppController";
import OrbitCameraController from "bg2e/scene/OrbitCameraController";
import Loader, { registerLoaderPlugin } from "bg2e/db/Loader";
import VitscnjLoaderPlugin from "bg2e/db/VitscnjLoaderPlugin";
import { registerComponents } from "bg2e/scene";

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
        const mainCamera = Camera.GetMain(root);
        mainCamera.projectionStrategy = new OpticalProjectionStrategy();
        //mainCamera.node.addComponent(new OrbitCameraController());

        return root;
    }
}

window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    canvas.domElement.style.width = "100vw";
    canvas.domElement.style.height = "100vh";
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}
