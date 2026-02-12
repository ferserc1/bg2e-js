import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import VitscnjLoaderPlugin from "bg2e-js/ts/db/VitscnjLoaderPlugin.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import SceneAppController from "bg2e-js/ts/render/SceneAppController.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import CameraComponent, { OpticalProjectionStrategy } from "bg2e-js/ts/scene/Camera.ts";
import OrbitCameraController from "bg2e-js/ts/scene/OrbitCameraController.ts";
import FindNodeVisitor from "bg2e-js/ts/scene/FindNodeVisitor.ts";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";
import { SelectionChangedData } from "bg2e-js/ts/manipulation/SelectionManager.js";
import MaterialModifier, { MaterialModifierData } from "bg2e-js/ts/tools/MaterialModifier.ts";

class MyAppController extends SceneAppController {
    private _textContainer!: HTMLElement;

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

    printText(text: string) {
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
            node.drawable?.items.forEach(item => {
                item.polyList.groupName = "material(base)";
            })
        });


        // Get main camera
        // Add Orbit camera controller component to the camera node
        const mainCamera = CameraComponent.GetMain(root);
        if (mainCamera) {
            const strategy = new OpticalProjectionStrategy();
            strategy.focalLength = 55;
            strategy.frameSize = 35;
            mainCamera.projectionStrategy = strategy;
            const cameraController = mainCamera.node.component("OrbitCameraController") as OrbitCameraController;
            if (cameraController) {
                cameraController.center = new Vec(0,1,0);
                cameraController.distance = 10;
            }
        }

        return root;
    }

    async loadDone() {
        const texturesPath = "../resources/";
        const materialModifierData: MaterialModifierData = {
            diffuse: [ 1, 0, 0, 1 ],    // Deprecated property example
            albedoTexture: "logo.png",
            albedoScale: [6, 6],
            normalTexture: "logo_nm.png",
            normalScale: [6, 6],
        };

        this.selectionManager?.onSelectionChanged("appController", (selection: SelectionChangedData[]) => {
            this.clearText();
            this.printText("Selection changed:");
            const materialModifier = new MaterialModifier(materialModifierData, texturesPath);

            selection.forEach(item => {
                this.printText(`&nbsp;${ item.drawable.name }`);
                materialModifier.applyDrawable(this.canvas, item.drawable, { groupRE: /^material\(([a-z0-9]+)\)$/ });
            });
        });

        this.createOutputText();
        // Adjust brightness and contrast of the scene shader
        //this.sceneRenderer.brightness = 0.34;
        //this.sceneRenderer.contrast = 1.4;
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
    mainLoop.updateMode = FrameUpdate.MANUAL;
    await mainLoop.run();
}
