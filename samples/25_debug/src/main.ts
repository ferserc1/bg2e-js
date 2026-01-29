import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Color from "bg2e-js/ts/base/Color.ts";
import { TextureTarget } from "bg2e-js/ts/base/Texture.ts";
import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import VitscnjLoaderPlugin from "bg2e-js/ts/db/VitscnjLoaderPlugin.ts";
import DebugRenderer from "bg2e-js/ts/debug/DebugRenderer.ts";
import WebGLTextureViewer from "bg2e-js/ts/debug/WebGLTextureViewer.ts";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import SceneAppController from "bg2e-js/ts/render/SceneAppController.ts";
import TextureRenderer from "bg2e-js/ts/render/TextureRenderer.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import CameraComponent, { OpticalProjectionStrategy } from "bg2e-js/ts/scene/Camera.ts";
import FindNodeVisitor from "bg2e-js/ts/scene/FindNodeVisitor.ts";
import LightComponent from "bg2e-js/ts/scene/LightComponent.ts";
import SmoothOrbitCameraControllerComponent from "bg2e-js/ts/scene/SmoothOrbitCameraController.ts";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";
import WebGLTextureRenderer from "bg2e-js/ts/render/webgl/TextureRenderer.js";
import Texture from "bg2e-js/ts/base/Texture.ts";
import OrbitCameraController from "bg2e-js/ts/scene/OrbitCameraController.js";

/*
 * This example shows how to use the basic pbr shader to render objects using lights
 */
class MyAppController extends SceneAppController {
    private _textureViewer!: WebGLTextureViewer;

    initDebugger() {
        const debugArea = document.getElementById('debugArea');
        if (!debugArea) {
            console.error("Cannot find debugArea element");
            return;
        }

        this._textureViewer = new WebGLTextureViewer(this.renderer);
        this._textureViewer.attachToElement(debugArea);

        
        const debugSelect = document.getElementById('debugSelect');
        if (!debugSelect) {
            console.error("Cannot find debugSelect element");
            return;
        }

        let currentTexture: Texture | null = null;
        const updateTextureSelect = () => {
            debugSelect.innerHTML = "";
            Object.keys(WebGLTextureRenderer.ListTextures(this.renderer))
                .forEach(textureName => {
                    const texture = WebGLTextureRenderer.ListTextures(this.renderer)[textureName];
                    if (texture.target == TextureTarget.TEXTURE_2D) {
                        if (!currentTexture) {
                            currentTexture = texture;
                            this._textureViewer.drawTexture(currentTexture!);
                        }
                        const option = document.createElement('option');
                        option.value = textureName;
                        option.innerHTML = textureName;
                        debugSelect.appendChild(option);
                    }
                });
        }

        document.getElementById("updateTextureListButton")?.addEventListener('click', evt => {
            updateTextureSelect();
        });

        document.getElementById("updateTextureButton")?.addEventListener('click', evt => {
            if (currentTexture) {
                this._textureViewer.drawTexture(currentTexture);
            }
        });

        debugSelect.addEventListener('change', evt => {
            const textureName = (evt.target as any)?.value;
            currentTexture = WebGLTextureRenderer.ListTextures(this.renderer)[textureName];
            if (currentTexture) {
                this._textureViewer.drawTexture(currentTexture);
            }
        });
    }

    get selectionManagerEnabled() {
        return false;
    }

    get selectionHighlightEnabled() {
        return false;
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
        const root = await loader.loadNode("/resources/furniture/furniture.vitscnj");

        const findVisitor = new FindNodeVisitor();
        //findVisitor.name = "ciclo_02";
        findVisitor.hasComponents(["Drawable"]);
        root.accept(findVisitor);
        findVisitor.result.forEach(node => {
            if (node.name === "ciclo_02") {
                node.drawable?.items.forEach(({ material }) => {
                    material.lightEmission = 0.5;
                });
            }
            else if (node.name === "Floor") {
                node.drawable?.items.forEach(({ material }) => {
                    material.lightEmission = 0.1;
                });
            }
        });


        // Get main camera
        // Add Orbit camera controller component to the camera node
        const mainCamera = CameraComponent.GetMain(root);
        if (!mainCamera) {
            throw new Error("No main camera found in the scene");
        }
        const proj = new OpticalProjectionStrategy();
        proj.focalLength = 55;
        proj.frameSize = 35;
        proj.far = 1000;

        mainCamera.projectionStrategy = proj;

        const cameraController = mainCamera.node.component("OrbitCameraController") as OrbitCameraController;
        if (cameraController) {
            cameraController.center = new Vec(0,1,0);
            cameraController.distance = 10;
            cameraController.rotation.x = 0;
            cameraController.rotation.y = 0;
        }
        const smoothCameraController = new SmoothOrbitCameraControllerComponent();
        smoothCameraController.assign(cameraController as SmoothOrbitCameraControllerComponent);
        mainCamera.node.addComponent(smoothCameraController);
        mainCamera.node.removeComponent(cameraController);

        const mainLight = LightComponent.GetMainDirectionalLight(root);
        mainLight!.light.shadowStrength = 0.8;
        mainLight!.light.shadowBias = 0.000002;

        return root;
    }

    async loadDone() {
        
        (globalThis as any).sceneRenderer = this.sceneRenderer;

        this.initDebugger();
    }

    async frame(dt: number) {
        super.frame(dt);

        //const debugRenderer = DebugRenderer.Get(this.renderer);
        //debugRenderer.drawSphere({ radius: 0.1, color: Color.Red(), position: new Vec(0,4,0) });

        //const trx = Mat4.MakeRotationWithDirection(new Vec(1,-2,0.6), new Vec(0,0,1));
        //const transformMatrix = trx.mult(Mat4.MakeTranslation(new Vec(0,4,0)));
        //debugRenderer.drawArrow({ length: 0.8, color: Color.Green(), transformMatrix });
    }
}

window.onload = async () => {
    const canvasElem = document.getElementById('gl-canvas') as HTMLCanvasElement;
    if (!canvasElem) {
        console.error("Cannot find canvas element with id 'gl-canvas'");
        return;
    }
    const canvas = new Canvas(canvasElem, new WebGLRenderer());
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);

    // We set FrameUpdate.MANUAL to stop on each frame until the user
    // trigger an input event
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}
