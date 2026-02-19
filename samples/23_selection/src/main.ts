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
import ObjLoaderPlugin from "bg2e-js/ts/db/ObjLoaderPlugin.js";
import Transform from "bg2e-js/ts/scene/Transform.js";
import Mat4 from "bg2e-js/ts/math/Mat4.js";
import Node from "bg2e-js/ts/scene/Node.js";
import SelectionMode from "bg2e-js/ts/manipulation/SelectionMode.js";

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
        registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "dist/", materialImportCallback: (mat: any) => {
            console.log(mat);
            return mat;
        } }));
        registerLoaderPlugin(new ObjLoaderPlugin());

        registerComponents();

        // Load scene
        const loader = new Loader();
        const root = await loader.loadNode("../resources/test-scene/test-scene.vitscnj");

        const findVisitor = new FindNodeVisitor();
        findVisitor.hasComponents(["Drawable"]);
        root.accept(findVisitor);
        findVisitor.result.forEach(node => {
            // Make only nodes named “Ball” selectable. This will prevent the ground in the scene from being selected.
            node.drawable?.makeSelectable(node.name === "Ball");
        });

        const cube = await loader.loadDrawable("../resources/simple_cube.obj");
        // This isn't necessary. By default, all polyList are selectable. If you want to make
        // a specific polyList selectable or non selectable, you must iterate through the
        // drawable items and set the selectable property of the polyList you want to change.
        // The makeSelectable() method apply the selectable property to all polyLists of
        // the drawable.
        cube.makeSelectable(true);
        const cubeNode = new Node("Cube node");
        cubeNode.addComponent(cube);
        cubeNode.addComponent(new Transform(Mat4.MakeTranslation(3, 0, 3)));
        root.addChild(cubeNode);

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
        this.selectionManager?.onSelectionChanged("appController", (selection: SelectionChangedData[]) => {
            this.clearText();
            this.printText("Selection changed:");
            selection.forEach(item => {
                this.printText(`&nbsp;${ item.drawable.name }`);
            });
        });

        if (this.selectionManager) {
            this.selectionManager.selectionMode = SelectionMode.POLY_LIST;
        }

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
