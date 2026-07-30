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
import Instance from "bg2e-js/ts/scene/Instance.ts";
import AABoundingBox from "bg2e-js/ts/scene/AABoundingBox.ts";
import type Drawable from "bg2e-js/ts/scene/Drawable.ts";
import Color from "bg2e-js/ts/base/Color.ts";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import { type SelectionChangedData } from "bg2e-js/ts/manipulation/SelectionManager.ts";

// Size of the instance matrix and distance between the instance nodes
const GRID_SIZE = 8;
const GRID_SEPARATION = 2;

class MyAppController extends SceneAppController {
    private _textContainer: HTMLHeadingElement;

    // The Drawable component rendered by every Instance of the scene. Note that this
    // component is NOT part of the scene graph: it lives in a node that is never added to
    // the scene, so the only thing that draws it are the Instance components.
    private _sourceDrawable: Drawable | null = null;

    constructor() {
        super();
        this._textContainer = document.createElement("h1");
        this._textContainer.style.position = "absolute";
        this._textContainer.style.top = "0px";
        this._textContainer.style.left = "0px";
        this._textContainer.style.color = "white";
        this._textContainer.style.fontSize = "18px";
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

        // Load one single model. The node returned by the loader is not added to the scene:
        // its Drawable component is the source of all the instances, and it is rendered
        // only through them. Because the node is not part of the scene graph, nobody binds
        // the renderer to the drawable: each Instance component takes care of it.
        const modelNode = await loader.loadNode("../resources/chain/chair.bg2");
        const drawable = modelNode.drawable;
        if (!drawable) {
            throw new Error("The loaded model does not contain a Drawable component");
        }
        this._sourceDrawable = drawable;

        // Matrix of GRID_SIZE x GRID_SIZE nodes, each one with an instance of the drawable
        const gridNode = new Node("Instance matrix");
        const offset = (GRID_SIZE - 1) * GRID_SEPARATION / 2;
        for (let row = 0; row < GRID_SIZE; ++row) {
            for (let column = 0; column < GRID_SIZE; ++column) {
                const name = `Instance ${ row },${ column }`;
                const instanceNode = new Node(name);
                instanceNode.addComponent(new Transform(Mat4.MakeTranslation(
                    row * GRID_SEPARATION - offset,
                    0,
                    column * GRID_SEPARATION - offset
                )));
                instanceNode.addComponent(new Instance(drawable, name));
                gridNode.addChild(instanceNode);
            }
        }
        root.addChild(gridNode);

        return root;
    }

    async loadDone() {
        // Each instance is picked separately, even if all of them share the polyLists of
        // the source drawable: the picking color codes and the selection flags of an
        // instance are stored in its own Instance component
        this.selectionManager!.onSelectionChanged("appController", (selection: SelectionChangedData[]) => {
            this.printSceneInfo();
            if (selection.length) {
                this.printText("Selection:");
                selection.forEach(item => {
                    const instanceName = item.instance ? `${ item.instance.name } -> ` : "";
                    this.printText(`&nbsp;${ instanceName }${ item.drawable.name } (${ item.polyList.name })`);
                });
            }
        });

        this.printSceneInfo();
        this.setupAlbedoControls();
    }

    printSceneInfo() {
        this.clearText();
        const drawable = this._sourceDrawable;
        this.printText(`${ GRID_SIZE * GRID_SIZE } instances of the drawable '${ drawable?.name }'`);
        if (drawable) {
            // The model size is printed to check that it fits in the space between the
            // instance nodes
            const size = AABoundingBox.FromDrawable(drawable).size;
            this.printText(`Model size: ${ size.x.toFixed(2) } x ${ size.y.toFixed(2) } x ${ size.z.toFixed(2) } ` +
                `(node separation: ${ GRID_SEPARATION })`);
        }
        this.printText("Click on any instance to select it");
    }

    // The three sliders modify the albedo color of the materials of the source drawable.
    // Because all the instances render that same drawable, with its same materials, the
    // change is applied to all of them at once.
    setupAlbedoControls() {
        const channels: Array<"r" | "g" | "b"> = ["r", "g", "b"];
        const sliders = channels.map(channel => document.getElementById(`albedo-${ channel }`) as HTMLInputElement);
        const values = channels.map(channel => document.getElementById(`albedo-${ channel }-value`) as HTMLSpanElement);

        // Initialize the sliders with the albedo of the first material of the drawable
        const initialAlbedo = this._sourceDrawable?.items[0]?.material.albedo;
        if (initialAlbedo) {
            sliders.forEach((slider, index) => {
                slider.value = `${ Math.round(initialAlbedo[index] * 255) }`;
            });
        }

        const updateAlbedo = () => {
            const rgb = sliders.map(slider => Number(slider.value));
            sliders.forEach((slider, index) => values[index].innerText = slider.value);

            this._sourceDrawable?.items.forEach(({ material }) => {
                // The alpha component of the albedo is used as transparency factor, so it
                // is preserved
                material.albedo = new Color([rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, material.albedo.a]);
            });

            // The main loop is configured in manual update mode, so a redisplay must be
            // requested to see the new material color
            this.mainLoop.postRedisplay();
        };

        sliders.forEach(slider => slider.addEventListener("input", updateAlbedo));
        updateAlbedo();
    }
}


window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas') as HTMLCanvasElement, new WebGLRenderer());
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.MANUAL;
    await mainLoop.run();
}
