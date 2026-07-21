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
import AABoundingBox from "bg2e-js/ts/scene/AABoundingBox.ts";

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
        this._textContainer.style.fontSize = "14px";
        this._textContainer.style.fontFamily = "monospace";
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

        // Load cubes model and add to root
        const drawable = await loader.loadDrawable("../resources/cubes.bg2");
        const modelNode = new Node("Cubes model");
        modelNode.addComponent(drawable);
        modelNode.addComponent(new Transform(Mat4.MakeTranslation(0, 0, -5)));
        root.addChild(modelNode);

        // Get main camera
        const mainCamera = CameraComponent.GetMain(root)!;
        const proj = new OpticalProjectionStrategy();
        mainCamera.projectionStrategy = proj;
        proj.focalLength = 55;
        proj.frameSize = 35;
        proj.near = 0.1;
        proj.far = 1000.0;

        return root;
    }

    async loadDone() {
        this.selectionManager!.onSelectionChanged("appController", selection => {
            this.clearText();
            if (selection.length === 0) {
                this.printText("No selection");
                return;
            }
            
            this.printText("Selection changed:");
            selection.forEach(item => {
                this.printText(`&nbsp;<b>${item.drawable.name}</b>`);
                
                // Calculate AABoundingBox for the selected node
                const node = item.drawable.node;
                if (node) {
                    const bbox = AABoundingBox.FromNode(node);
                    this.printText(`&nbsp;&nbsp;min: [${bbox.min.x.toFixed(2)}, ${bbox.min.y.toFixed(2)}, ${bbox.min.z.toFixed(2)}]`);
                    this.printText(`&nbsp;&nbsp;max: [${bbox.max.x.toFixed(2)}, ${bbox.max.y.toFixed(2)}, ${bbox.max.z.toFixed(2)}]`);
                    this.printText(`&nbsp;&nbsp;center: [${bbox.center.x.toFixed(2)}, ${bbox.center.y.toFixed(2)}, ${bbox.center.z.toFixed(2)}]`);
                    this.printText(`&nbsp;&nbsp;size: [${bbox.size.x.toFixed(2)}, ${bbox.size.y.toFixed(2)}, ${bbox.size.z.toFixed(2)}]`);
                    this.printText(`&nbsp;&nbsp;halfSize: [${bbox.halfSize.x.toFixed(2)}, ${bbox.halfSize.y.toFixed(2)}, ${bbox.halfSize.z.toFixed(2)}]`);
                }
            });
        });

        this.setupDropZone();
    }

    setupDropZone() {
        const loader = new Loader();
        loader.setupModelDropZone(document.body, ["bg2","vwglb"], drawable => {
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
