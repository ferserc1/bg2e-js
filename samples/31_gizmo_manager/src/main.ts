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
import FindNodeVisitor from "bg2e-js/ts/scene/FindNodeVisitor.ts";
import GizmoComponent from "bg2e-js/ts/manipulation/GizmoComponent.ts";
import GizmoActionLabel from "bg2e-js/ts/manipulation/GizmoActionLabel.ts";
import { SelectionChangedData } from "bg2e-js/ts/manipulation/SelectionManager.ts";

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
        textContainer.style.fontSize = "14px";
        textContainer.style.fontFamily = "monospace";
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

    get gizmoManagerEnabled() {
        return true;
    }

    async loadScene() {
        registerLoaderPlugin(new VitscnjLoaderPlugin());
        registerComponents();

        // Load scene
        const loader = new Loader();
        const root = await loader.loadNode("../resources/test-scene/test-scene.vitscnj");

        // Every node with a Drawable component gets a Transform (if it doesn't already have
        // one) and a Gizmo component, so GizmoManager can show a gizmo on it once selected.
        const findVisitor = new FindNodeVisitor();
        findVisitor.hasComponents(["Drawable"]);
        root.accept(findVisitor);
        findVisitor.result.forEach(node => {
            if (!node.transform) {
                node.addComponent(new Transform());
            }
            node.addComponent(new GizmoComponent());
        });

        // Load cubes model and add to root
        const cubesParent = new Node("cubesParent");
        cubesParent.addComponent(new Transform(Mat4.MakeTranslation(0, 0, -5)));
        cubesParent.addComponent(new GizmoComponent());
        root.addChild(cubesParent);

        const drawable = await loader.loadDrawable("../resources/cubes.bg2");
        const modelNode = new Node("Cubes model");
        modelNode.addComponent(drawable);
        cubesParent.addChild(modelNode);

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
        this.createOutputText();

        if (this.gizmoManager) {
            // Replace the default procedural cube gizmo with a custom model. Its single PolyList
            // is named "Cube.0010" in the source file, so it's remapped to TranslateXZ to keep it
            // draggable (same action the default cube used).
            await this.gizmoManager.loadGizmo("../resources/PlaneGizmo.bg2", {
                "Cube.0010": GizmoActionLabel.TranslateXZ
            });
            this.gizmoManager.fixedScreenSize = 0.05;
        }

        // Multi-select enabled: the gizmo follows the last item added to the selection.
        this.selectionManager!.multiSelectMode = true;

        this.selectionManager!.onSelectionChanged("appController", (selection: SelectionChangedData[]) => {
            this.clearText();
            if (selection.length === 0) {
                this.printText("No selection. Click a cube to select it (shift-click to add to the selection).");
                this.printText("The gizmo shows on the last selected cube — drag it to translate the cube on its local XZ plane.");
                return;
            }
            this.printText("Selection changed:");
            selection.forEach(item => {
                this.printText(`&nbsp;<b>${item.drawable.name}</b>`);
            });
        });

        (globalThis as any).selectionManager = this.selectionManager;
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
