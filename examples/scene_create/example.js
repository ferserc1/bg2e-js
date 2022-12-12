import AppController from "bg2e/app/AppController";
import Canvas from "bg2e/app/Canvas";
import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import Mat4 from "bg2e/math/Mat4";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Node from "bg2e/scene/Node";
import Transform from "bg2e/scene/Transform";
import { registerComponents } from "bg2e/scene";
import LightComponent from "bg2e/scene/LightComponent";
import { LightType } from "bg2e/base/Light";
import { createSphere } from "bg2e/primitives";
import Drawable from "bg2e/scene/Drawable";
import Material from "bg2e/base/Material";
import SceneRenderer from "bg2e/render/SceneRenderer";
import Vec from "bg2e/math/Vec";

class MyAppController extends AppController {
    async createScene() {
        const root = new Node("scene root");

        const addLight = ({ color, position, type, intensity }) => {
            const lightNode = new Node("Light node");
            lightNode.addComponent(new LightComponent());
            lightNode.lightComponent.setProperties({ color, position, type, intensity });
            return lightNode;
        }

        const addSphere = async (roughness, metallic, diffuse, position) => {
            this._sphereModel = this._sphereModel || createSphere(0.3);
            const sphereNode = new Node("Sphere");
            sphereNode.addComponent(new Drawable());
            sphereNode.drawable.addPolyList(this._sphereModel, await Material.Deserialize({
                diffuse, roughness, metallic
            }));
            sphereNode.addComponent(new Transform(Mat4.MakeTranslation(position[0], position[1], position[2])));
            return sphereNode;
        }

        root.addChild(addLight({ position: [ 10.0, 10.0, -10.0], color: [1, 0.3, 0.1], intensity:300, lightType: LightType.POINT }));
        root.addChild(addLight({ position: [-10.0, 10.0, -10.0], color: [0.3, 1, 0.1], intensity:300, lightType: LightType.POINT }));
        root.addChild(addLight({ position: [-10.0,-10.0, -10.0], color: [0.1, 0.3, 1], intensity:300, lightType: LightType.POINT }));
        root.addChild(addLight({ position: [ 10.0,-10.0, -10.0], color: [0.1, 1, 0.3], intensity:300, lightType: LightType.POINT }));

        root.addChild(await addSphere(0.1, 0.8, [0.93, 0.95, 0.95, 1], [0, 0, 0]));

        return root;
    }

    async init() {
        registerComponents();
        this._sceneRoot = await this.createScene();

        this._env = this.renderer.factory.environment();
        await this._env.load({
            textureUrl: '../resources/equirectangular-env3.jpg'
        });

        this._sceneRenderer = new SceneRenderer(this.renderer);
        this._sceneRenderer.environment = this._env;

        console.log(this._sceneRoot);

        this._viewMatrix = Mat4.MakeIdentity();
        this._projMatrix = Mat4.MakeIdentity();
    }

    reshape(width,height) {
        this.renderer.viewport = new Vec(width, height);
        this.renderer.canvas.updateViewportSize();
    }

    frame(delta) {
        this._sceneRenderer.frame(this._sceneRoot, delta);
    }

    display() {
        this.renderer.frameBuffer.clear();
        this._sceneRenderer.draw();
    }

    destroy() {
        this._sceneRenderer.destroy();
    }

    keyUp(evt) {

    }

    mouseWheel(evt) {

    }

    mouseDown(evt) {

    }

    mouseDrag(evt) {

    }
}

window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    canvas.domElement.style.width = "100vw";
    canvas.domElement.style.height = "100vh";
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}