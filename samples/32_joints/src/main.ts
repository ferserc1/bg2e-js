import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import VitscnjLoaderPlugin from "bg2e-js/ts/db/VitscnjLoaderPlugin.ts";
import SceneAppController from "bg2e-js/ts/render/SceneAppController.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import CameraComponent, { OpticalProjectionStrategy } from "bg2e-js/ts/scene/Camera.ts";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";
import Node from "bg2e-js/ts/scene/Node.ts";
import Transform from "bg2e-js/ts/scene/Transform.ts";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import Chain from "bg2e-js/ts/scene/Chain.js";

class MyAppController extends SceneAppController {
    private _textContainer: HTMLHeadingElement;

    constructor() {
        super();
        this._textContainer = document.createElement("h1");
        this._textContainer.style.position = "absolute";
        this._textContainer.style.top = "0px";
        this._textContainer.style.left = "0px";
        this._textContainer.style.color = "white";
        this._textContainer.style.textShadow = "0px 0px 18px rgba(0,0,0,0.8)";
        document.body.appendChild(this._textContainer);
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
        registerLoaderPlugin(new VitscnjLoaderPlugin());
        registerComponents();

        // Load scene
        const loader = new Loader();
        const root = await loader.loadNode("../resources/test-scene/test-scene.vitscnj");

        // Get main camera
        // Add Orbit camera controller component to the camera node
        const mainCamera = CameraComponent.GetMain(root)!;
        const proj = new OpticalProjectionStrategy();
        mainCamera.projectionStrategy = proj;
        proj.focalLength = 55;
        proj.frameSize = 35;
        proj.near = 0.1;
        proj.far = 1000.0;

        const createModelNode = async (loader: Loader, path: string): Promise<Node> => {
            const modelNode = await loader.loadNode(path);
            console.log(modelNode);
            return modelNode;
        };

        const sofaNode = new Node("Sofa");
        sofaNode.addComponent(new Chain());
        sofaNode.addComponent(new Transform(Mat4.MakeTranslation(3, 0, 3)));

        const models = [
            "../resources/chain/left_arm.bg2",
            "../resources/chain/chair.bg2",
            "../resources/chain/chaise.bg2",
            "../resources/chain/sofa.bg2",
            "../resources/chain/right_arm.bg2"
        ];

        for (const path of models) {
            const modelNode = await createModelNode(loader, path);
            sofaNode.addChild(modelNode);
        }

        root.addChild(sofaNode);

        return root;
    }

    async loadDone() {
        this.selectionManager!.onSelectionChanged("appController", selection => {
            this.clearText();
            this.printText("Selection changed:");
            selection.forEach(item => {
                this.printText(`&nbsp;${ item.drawable.name }`);
            });
        });

        this.setupDropZone();
    }

    setupDropZone() {
        const loader = new Loader();
        loader.setupModelDropZone(document.body, drawable => {
            const modelNode = new Node("Dropped model");
            modelNode.addComponent(drawable);
            modelNode.addComponent(new Transform(Mat4.MakeTranslation(0, 0, 0).scale(10, 10, 10)));
            this.sceneRoot!.addChild(modelNode);
        });
    }
}

 
window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas') as HTMLCanvasElement, new WebGLRenderer());
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.MANUAL;
    await mainLoop.run();
}
