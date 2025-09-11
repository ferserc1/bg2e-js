import { app, db, render, scene } from "bg2e-js";

const {
    MainLoop,
    FrameUpdate,
    Canvas
} = app;
const {
    Loader,
    registerLoaderPlugin,
    VitscnjLoaderPlugin
} = db;
const {
    WebGLRenderer,
    SceneAppController
} = render;
const {
    OpticalProjectionStrategy,
    registerComponents,
    CameraComponent
} = scene;

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
        mainCamera.projectionStrategy = new OpticalProjectionStrategy();

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
