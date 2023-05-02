import Canvas from "bg2e/app/Canvas";
import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Camera, { OpticalProjectionStrategy } from "bg2e/scene/Camera";
import SceneAppController from "bg2e/render/SceneAppController";
import OrbitCameraController from "bg2e/scene/OrbitCameraController";
import Loader, { registerLoaderPlugin } from "bg2e/db/Loader";
import VitscnjLoaderPlugin from "bg2e/db/VitscnjLoaderPlugin";
import { registerComponents } from "bg2e/scene";
import FindNodeVisitor from "bg2e/scene/FindNodeVisitor";
import Drawable from "bg2e/scene/Drawable";

class MyAppController extends SceneAppController {
    createOutputText() {
        const textContainer = document.createElement("h1");
        document.body.appendChild(textContainer);
        textContainer.style.position = "absolute";
        textContainer.style.top = "0px";
        textContainer.style.left = "0px";
        textContainer.style.color = "white";
        textContainer.style.textShadow = "0px 0px 18px rgba(0,0,0,0.8)";
        this._textContainer = textContainer;
    }

    printText(text) {
        this._textContainer.innerHTML += `<br/>${text}`;
    }

    clearText() {
        this._textContainer.innerHTML = "";
    }

    get selectionManagerEnabled() {
        return true;
    }

    get selectionHighlightEnabled() {
        return true;
    }

    async loadScene() {
        //this.updateOnInputEvents = false;
        // Register loader plugins
        // bg2ioPath is the path from the html file to the distribution files of the bg2io library, if
        // this path is different from the compiled js file (generated from this file, in this case, 
        // using Rollup)
        registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "dist/" }));
        registerComponents();

        // Load scene
        const loader = new Loader();
        const root = await loader.loadNode("../resources/test-scene/test-scene.vitscnj");

        const findVisitor = new FindNodeVisitor();
        findVisitor.name = "Ball";
        findVisitor.hasComponents(["Drawable"]);
        root.accept(findVisitor);
        findVisitor.result.forEach(node => {
            node.drawable?.makeSelectable(node.name === "Ball");
        });


        // Get main camera
        // Add Orbit camera controller component to the camera node
        const mainCamera = Camera.GetMain(root);
        mainCamera.projectionStrategy = new OpticalProjectionStrategy();
        mainCamera.projectionStrategy.focalLength = 55;
        mainCamera.projectionStrategy.frameSize = 35;

        window.root = root;

        return root;
    }

    async loadDone() {
        this.selectionManager.onSelectionChanged("appController", selection => {
            this.clearText();
            this.printText("Selection changed:");
            selection.forEach(item => {
                this.printText(`&nbsp;${ item.drawable.name }`);
            });
        });

        this.createOutputText();
    }
}

window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    canvas.domElement.style.width = "100vw";
    canvas.domElement.style.height = "100vh";
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.MANUAL;
    await mainLoop.run();
    window.mainLoop = mainLoop;
}
