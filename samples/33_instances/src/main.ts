import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import VitscnjLoaderPlugin from "bg2e-js/ts/db/VitscnjLoaderPlugin.ts";
import SceneAppController from "bg2e-js/ts/render/SceneAppController.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import CameraComponent, { OpticalProjectionStrategy } from "bg2e-js/ts/scene/Camera.ts";
import OrbitCameraController from "bg2e-js/ts/scene/OrbitCameraController.ts";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";
import Node from "bg2e-js/ts/scene/Node.ts";
import Transform from "bg2e-js/ts/scene/Transform.ts";
import DrawableInstance from "bg2e-js/ts/scene/DrawableInstance.ts";
import GizmoComponent from "bg2e-js/ts/manipulation/GizmoComponent.ts";
import AABoundingBox from "bg2e-js/ts/scene/AABoundingBox.ts";
import Color from "bg2e-js/ts/base/Color.ts";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import { type SelectionChangedData } from "bg2e-js/ts/manipulation/SelectionManager.ts";

// Size of the instance matrix and distance between the instance nodes
const GRID_SIZE = 8;
const GRID_SEPARATION = 2;

class MyAppController extends SceneAppController {
    private readonly _referenceChairs: DrawableInstance[] = [];
    private readonly _status = document.getElementById("selection-status")!;
    private readonly _selectedSwatch = document.getElementById("selected-swatch")!;
    private readonly _referenceSwatch = document.getElementById("reference-swatch")!;
    private readonly _referenceName = document.getElementById("reference-name")!;
    private readonly _referenceValue = document.getElementById("reference-color")!;
    private _selected: DrawableInstance | undefined;
    private _colorControls: HTMLInputElement[] = [];
    private _colorValues: HTMLSpanElement[] = [];

    async loadScene() {
        registerLoaderPlugin(new VitscnjLoaderPlugin());
        registerComponents();

        // Load scene
        const loader = new Loader();
        const root: Node = await loader.loadNode("../resources/test-scene/test-scene.vitscnj");

        // Get main camera and set it up to see the whole instance matrix
        const mainCamera = CameraComponent.GetMain(root)!;
        const proj = new OpticalProjectionStrategy();
        mainCamera.projectionStrategy = proj;
        proj.focalLength = 55;
        proj.frameSize = 35;
        proj.near = 0.1;
        proj.far = 1000.0;

        const cameraController = mainCamera.node.component("OrbitCameraController") as OrbitCameraController;
        if (cameraController) {
            cameraController.center = new Vec(0, 0, 0);
            cameraController.maxDistance = 80;
            cameraController.distance = 26;
        }

        const resource = await root.drawableCache!.loadBg2("../resources/chain/chair.bg2", loader);
        const palette = [[0.78, 0.27, 0.17], [0.18, 0.58, 0.75], [0.46, 0.66, 0.27]];

        this._referenceChairs.length = 0;
        const gridNode = new Node("Chairs");
        const offset = (GRID_SIZE - 1) * GRID_SEPARATION / 2;
        for (let row = 0; row < GRID_SIZE; ++row) {
            for (let column = 0; column < GRID_SIZE; ++column) {
                const name = `Chair ${row + 1},${column + 1}`;
                const instanceNode = new Node(name);
                instanceNode.addComponent(new Transform(Mat4.MakeTranslation(
                    row * GRID_SEPARATION - offset,
                    0,
                    column * GRID_SEPARATION - offset
                )));
                const instance = new DrawableInstance(resource);
                const [r, g, b] = palette[(row + column) % palette.length];
                for (const { material } of instance.items) {
                    material.albedo = new Color([r, g, b, material.albedo.a]);
                }
                instanceNode.addComponent(instance);
                instanceNode.addComponent(new GizmoComponent());
                gridNode.addChild(instanceNode);
                if (row === 0 && column < 2) this._referenceChairs.push(instance);
            }
        }
        root.addChild(gridNode);

        return root;
    }

    async loadDone() {
        document.getElementById("model-summary")!.textContent = `${GRID_SIZE * GRID_SIZE} chairs share one model`;
        const channels = ["r", "g", "b"];
        this._colorControls = channels.map(channel => document.getElementById(`albedo-${channel}`) as HTMLInputElement);
        this._colorValues = channels.map(channel => document.getElementById(`albedo-${channel}-value`) as HTMLSpanElement);
        for (const slider of this._colorControls) slider.addEventListener("input", () => this.updateAlbedo());

        this.selectionManager!.onSelectionChanged("appController", (selection: SelectionChangedData[]) => {
            const picked = selection[selection.length - 1]?.drawable;
            this._selected = picked instanceof DrawableInstance ? picked : undefined;
            this.updatePanel();
        });
        this.updatePanel();
    }

    private updatePanel(): void {
        const instance = this._selected;
        if (instance) {
            const size = AABoundingBox.FromNode(instance.node).size;
            this._status.textContent = `${instance.name} · ${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)}`;
        }
        else {
            this._status.textContent = "Click a chair to select it.";
        }

        const albedo = instance?.items[0]?.material.albedo;
        this._colorControls.forEach((slider, index) => {
            slider.disabled = !albedo;
            if (albedo) slider.value = String(Math.round(albedo[index] * 255));
            this._colorValues[index].textContent = albedo ? slider.value : "—";
        });
        this.updateSwatches();
    }

    private updateSwatches(): void {
        const reference = this._referenceChairs.find(chair => chair !== this._selected);
        this._referenceName.textContent = reference ? `Compare with ${reference.name}` : "Reference chair";
        this._referenceValue.textContent = this.showColor(this._referenceSwatch, reference) ?? "—";
        this.showColor(this._selectedSwatch, this._selected);
    }

    private showColor(swatch: HTMLElement, instance?: DrawableInstance): string | undefined {
        const color = instance?.items[0]?.material.albedo;
        swatch.hidden = !color;
        if (!color) return undefined;
        const channels = [color.r, color.g, color.b].map(channel => Math.round(channel * 255));
        swatch.style.backgroundColor = `rgb(${channels.join(", ")})`;
        return channels.join(", ");
    }

    private updateAlbedo(): void {
        if (!this._selected) return;
        const [r, g, b] = this._colorControls.map(slider => Number(slider.value) / 255);
        this._colorControls.forEach((slider, index) => this._colorValues[index].textContent = slider.value);
        for (const { material } of this._selected.items) {
            material.albedo = new Color([r, g, b, material.albedo.a]);
        }
        this.updateSwatches();
        this.mainLoop.postRedisplay();
    }
}


window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas') as HTMLCanvasElement, new WebGLRenderer());
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.MANUAL;
    await mainLoop.run();
}
