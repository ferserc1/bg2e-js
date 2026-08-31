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
import SelectionMode from "bg2e-js/ts/manipulation/SelectionMode.js";

const leftArm = "../resources/chain/left_arm.bg2";
const chair = "../resources/chain/chair.bg2";
const chaise = "../resources/chain/chaise.bg2";
const sofa = "../resources/chain/sofa.bg2";
const rightArm = "../resources/chain/right_arm.bg2";

const createModelNode = async (loader: Loader, path: string): Promise<Node> => {
    const modelNode = await loader.loadNode(path);
    console.log(modelNode);
    return modelNode;
};

class MyAppController extends SceneAppController {
    private _textContainer: HTMLHeadingElement;
    private _uiContainer: HTMLElement;

    async insertElement(element: string, position: "before" | "after") {
        const sel = this.selectionManager!.selection[0];
        if (!sel) {
            alert("No sofa module selected");
            return;
        }

        const node = sel.drawable.node;
        if (!node) {
            console.error("Unexpected error: the selection does not belongs to a node");
            return;
        }

        const selectionParent = node.parent;
        if (!selectionParent) {
            console.error("Unexpected error: the selected node does not belongs to any scene node");
            return;
        }

        const chain = selectionParent.component("Chain");
        if (!chain) {
            alert("The selected node does not belongs to a sofa");
            return;
        }

        const loader = new Loader();
        const modelNode = await createModelNode(loader, element);
        selectionParent.addChild(modelNode, position === "after"
            ? { after: node }
            : { before: node}
        );
    }

    constructor() {
        super();
        this._textContainer = document.createElement("h1");
        this._textContainer.style.position = "absolute";
        this._textContainer.style.top = "0px";
        this._textContainer.style.left = "0px";
        this._textContainer.style.color = "white";
        this._textContainer.style.textShadow = "0px 0px 18px rgba(0,0,0,0.8)";
        document.body.appendChild(this._textContainer);

        this._uiContainer = document.createElement("div");
        this._uiContainer.innerHTML = `
            <p>Insert module before selection</p>
            <div id="beforeButtons"></div>
            <p>Insert module after selection</p>
            <div id="afterButtons"></div>
        `;
        this._uiContainer.style.position = "absolute";
        this._uiContainer.style.top = "0px";
        this._uiContainer.style.right = "0px";
        this._uiContainer.style.color = "white";
        this._uiContainer.style.textShadow = "0px 0px 18px rgba(0,0,0,0.8)";

        const beforeButtons = this._uiContainer.querySelector("#beforeButtons") as HTMLElement;
        const afterButtons = this._uiContainer.querySelector("#afterButtons") as HTMLElement;
        const addButton = (title: string, action: () => void, parent: HTMLElement) => {
            const btn = document.createElement("button") as HTMLButtonElement;
            btn.innerText = title;
            btn.addEventListener("click", action);
            parent.appendChild(btn);
        }
        addButton("Chair", () => {
            this.insertElement(chair, "before");
        }, beforeButtons)
        addButton("Chaise Longue", () => {
            this.insertElement(chaise, "before");
        }, beforeButtons)
        addButton("Sofa", () => {
            this.insertElement(sofa, "before");
        }, beforeButtons)
        

        addButton("Chair", () => {
            this.insertElement(chair, "after");
        }, afterButtons)
        addButton("Chaise Longue", () => {
            this.insertElement(chaise, "after");
        }, afterButtons)
        addButton("Sofa", () => {
            this.insertElement(sofa, "after");
        }, afterButtons)

        document.body.appendChild(this._uiContainer);
        

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

        const sofaNode = new Node("Sofa");
        sofaNode.addComponent(new Chain());
        sofaNode.addComponent(new Transform(Mat4.MakeTranslation(3, 0, 3)));

        for (const path of [leftArm, chair, chair, sofa, rightArm]) {
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

        this.selectionManager!.selectionMode = SelectionMode.OBJECT;
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
