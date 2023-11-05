import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import Canvas from "bg2e/app/Canvas";
import Vec from "bg2e/math/Vec";
import Mat4 from "bg2e/math/Mat4";
import WebGLTextureViewer from "bg2e/debug/WebGLTextureViewer";
import WebGLTextureRenderer from "bg2e/render/webgl/TextureRenderer";
import { TextureTarget } from "bg2e/base/Texture";
import SceneAppController from "bg2e/render/SceneAppController";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Camera, { OpticalProjectionStrategy } from "bg2e/scene/Camera";
import Loader, { registerLoaderPlugin } from "bg2e/db/Loader";
import VitscnjLoaderPlugin from "bg2e/db/VitscnjLoaderPlugin";
import { registerComponents } from "bg2e/scene";
import FindNodeVisitor from "bg2e/scene/FindNodeVisitor";
import DebugRenderer from "bg2e/debug/DebugRenderer";
import Color from "bg2e/base/Color";
import SmoothOrbitCameraController from "bg2e/scene/SmoothOrbitCameraController";

/*
 * This example shows how to use the basic pbr shader to render objects using lights
 */
class MyAppController extends SceneAppController {
    initDebugger() {
        const debugArea = document.getElementById('debugArea');
        this._textureViewer = new WebGLTextureViewer(this.renderer);
        this._textureViewer.attachToElement(debugArea);

        window.textureViewer = this._textureViewer;

        const debugSelect = document.getElementById('debugSelect');
        let currentTexture = null;
        const updateTextureSelect = () => {
            debugSelect.innerHTML = "";
            Object.keys(WebGLTextureRenderer.ListTextures(this.renderer))
                .forEach(textureName => {
                    const texture = WebGLTextureRenderer.ListTextures(this.renderer)[textureName];
                    if (texture.target == TextureTarget.TEXTURE_2D) {
                        if (!currentTexture) {
                            currentTexture = texture;
                            this._textureViewer.drawTexture(currentTexture);
                        }
                        const option = document.createElement('option');
                        option.value = textureName;
                        option.innerHTML = textureName;
                        debugSelect.appendChild(option);
                    }
                });
        }

        window.updateTextureListButton.addEventListener('click', evt => {
            updateTextureSelect();
        });

        window.updateTextureButton.addEventListener('click', evt => {
            if (currentTexture) {
                this._textureViewer.drawTexture(currentTexture);
            }
        });

        debugSelect.addEventListener('change', evt => {
            currentTexture = WebGLTextureRenderer.ListTextures(this.renderer)[evt.target.value];
            this._textureViewer.drawTexture(currentTexture);
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
        registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "bg2io/" }));
        registerComponents();

        // Load scene
        const loader = new Loader();
        const root = await loader.loadNode("/test-scene/test-scene.vitscnj");

        const findVisitor = new FindNodeVisitor();
        findVisitor.name = "Ball";
        findVisitor.hasComponents(["Drawable"]);
        root.accept(findVisitor);
        findVisitor.result.forEach(node => {
            node.drawable?.makeSelectable(node.name === "Ball");
        });


        // Get main camera
        // Add Orbit camera controller component to the camera node
        const mainCamera = Camera.GetMain(root);
        mainCamera.projectionStrategy = new OpticalProjectionStrategy();
        mainCamera.projectionStrategy.focalLength = 55;
        mainCamera.projectionStrategy.frameSize = 35;
        mainCamera.projectionStrategy.far = 1000;
        const cameraController = mainCamera.node.component("OrbitCameraController");
        if (cameraController) {
            cameraController.center = new Vec(0,1,0);
            cameraController.distance = 10;
            cameraController.rotation.x = 0;
            cameraController.rotation.y = 0;
        }
        const smoothCameraController = new SmoothOrbitCameraController();
        smoothCameraController.assign(cameraController);
        mainCamera.node.addComponent(smoothCameraController);
        mainCamera.node.removeComponent(cameraController);

        window.root = root;

        return root;
    }

    async loadDone() {
        this.initDebugger();
    }

    frame(dt) {
        super.frame(dt);

        //const debugRenderer = DebugRenderer.Get(this.renderer);
        //debugRenderer.drawSphere({ radius: 0.1, color: Color.Red(), position: new Vec(0,4,0) });

        //const trx = Mat4.MakeRotationWithDirection(new Vec(1,-2,0.6), new Vec(0,0,1));
        //const transformMatrix = trx.mult(Mat4.MakeTranslation(new Vec(0,4,0)));
        //debugRenderer.drawArrow({ length: 0.8, color: Color.Green(), transformMatrix });
    }
}

window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);

    // We set FrameUpdate.MANUAL to stop on each frame until the user
    // trigger an input event
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}
