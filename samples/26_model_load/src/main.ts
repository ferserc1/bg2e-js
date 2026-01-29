import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import VitscnjLoaderPlugin from "bg2e-js/ts/db/VitscnjLoaderPlugin.ts";
import SceneAppController from "bg2e-js/ts/render/SceneAppController.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import CameraComponent, { OpticalProjectionStrategy } from "bg2e-js/ts/scene/Camera.ts";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";

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

        // Get main camera
        // Add Orbit camera controller component to the camera node
        const mainCamera = CameraComponent.GetMain(root);
        mainCamera.projectionStrategy = new OpticalProjectionStrategy();
        mainCamera.projectionStrategy.focalLength = 55;
        mainCamera.projectionStrategy.frameSize = 35;
        mainCamera.projectionStrategy.near = 0.1;
        mainCamera.projectionStrategy.far = 1000.0;

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

        this.setupDropZone();
    }

    async loadModelFile(file, dependencies = []) {
        const buffer = await file.arrayBuffer();
        console.log(buffer);
        const loader = new Loader();
        return await loader.loadDrawableBuffer(buffer, "bg2", dependencies );
        //const data = loader.loadDrawable(file.);
        //console.log(file);
    }

    setupDropZone() {
        const dropZone = document.body;

        dropZone.addEventListener("dragover", event => {
            event.stopPropagation();
            event.preventDefault();
            //event.dataTransfer.dropEffect = "copy";
        });

        dropZone.addEventListener("drop", async event => {
            event.stopPropagation();
            event.preventDefault();
            const files = Array.from(event.dataTransfer.files);
            console.log(files);

            const modelFile = files.find(f => f.name.toLowerCase().endsWith(".bg2") || f.name.toLowerCase().endsWith(".vwglb"));
            if (modelFile) {
                const result = await this.loadModelFile(modelFile, files);
                console.log(result);
            }
        });
    }
}

 
window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.MANUAL;
    await mainLoop.run();
    window.mainLoop = mainLoop;
}
