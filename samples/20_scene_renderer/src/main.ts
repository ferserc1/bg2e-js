import AppController from "bg2e-js/ts/app/AppController.ts";
import Bg2KeyboardEvent from "bg2e-js/ts/app/Bg2KeyboardEvent.ts";
import Bg2MouseEvent from "bg2e-js/ts/app/Bg2MouseEvent.ts";
import Bg2TouchEvent from "bg2e-js/ts/app/Bg2TouchEvent.ts";
import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Light, { LightType } from "bg2e-js/ts/base/Light.ts";
import Material from "bg2e-js/ts/base/Material.ts";
import PolyList from "bg2e-js/ts/base/PolyList.js";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import { createSphere } from "bg2e-js/ts/primitives/index.ts";
import Environment from "bg2e-js/ts/render/Environment.js";
import SceneRenderer from "bg2e-js/ts/render/SceneRenderer.js";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import CameraComponent, { OpticalProjectionStrategy } from "bg2e-js/ts/scene/Camera.ts";
import Component, { registerComponent } from "bg2e-js/ts/scene/Component.ts";
import DrawableComponent from "bg2e-js/ts/scene/Drawable.ts";
import LightComponent from "bg2e-js/ts/scene/LightComponent.ts";
import Node from "bg2e-js/ts/scene/Node.ts";
import TransformComponent from "bg2e-js/ts/scene/Transform.ts";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";

class RotateComponent extends Component {
    constructor() {
        super("RotateComponent");
    }

    clone() {
        return new RotateComponent();
    }

    willUpdate(delta: number) {
        if (this.transform) {
            this.transform.matrix.rotate(delta / 1000, 0, 1, 0);
        }
    }
}

class MyAppController extends AppController {
    protected _sphereModel: PolyList | null = null;
    protected _camera?: CameraComponent | null = null;
    protected _sceneRoot: Node | null = null;
    protected _env: Environment | null = null;
    protected _sceneRenderer: SceneRenderer | null = null;

    async createScene() {
        const root = new Node("scene root");
        root.addComponent(new TransformComponent(Mat4.MakeTranslation(0, -0.3, -10)));

        const addLight = ({
            color, position, lightType, intensity, transform = Mat4.MakeIdentity()
        } : {
            color: number[], position: number[], lightType: LightType, intensity: number, transform?: Mat4
        }) => {
            const lightNode = new Node("Light node");
            lightNode.addComponent(new LightComponent());
            lightNode.lightComponent?.setProperties({ color, position, lightType, intensity });
            lightNode.addComponent(new TransformComponent(transform));
            return lightNode;
        }

        const addSphere = async (roughness: number, metallic: number, diffuse: number[], position: number[]) => {
            this._sphereModel = this._sphereModel || createSphere(0.3);
            const sphereNode = new Node("Sphere");
            sphereNode.addComponent(new DrawableComponent());
            sphereNode.drawable?.addPolyList(this._sphereModel, await Material.Deserialize({
                diffuse, roughness, metallic
            }), Mat4.MakeIdentity());
            sphereNode.addComponent(new TransformComponent(Mat4.MakeTranslation(position[0], position[1], position[2])));
            return sphereNode;
        }

        root.addChild(addLight({ position: [  10.0, 10.0, -10.0], color: [1, 0.3, 0.1], intensity:300, lightType: LightType.POINT, transform: Mat4.MakeTranslation( 0, 0, 0) }));
        root.addChild(addLight({ position: [ -10.0, 10.0, -10.0], color: [0.3, 1, 0.1], intensity:300, lightType: LightType.POINT, transform: Mat4.MakeTranslation( 0, 0, 0) }));
        root.addChild(addLight({ position: [ -10.0,-10.0, -10.0], color: [0.1, 0.3, 1], intensity:300, lightType: LightType.POINT, transform: Mat4.MakeTranslation( 0, 0, 0) }));
        root.addChild(addLight({ position: [  10.0,-10.0, -10.0], color: [0.1, 1, 0.3], intensity:300, lightType: LightType.POINT, transform: Mat4.MakeTranslation( 0, 0, 0) }));

        const spheres = new Node("Spheres");
        spheres.addComponent(new TransformComponent());
        spheres.addComponent(new RotateComponent());
        root.addChild(spheres);

        spheres.addChild(await addSphere(0.0, 1.0, [0.93, 0.95, 0.95, 1], [ -3, 3, 0 ]));
        spheres.addChild(await addSphere(0.1, 1.0, [0.93, 0.95, 0.95, 1], [ -2, 3, 0 ]));
        spheres.addChild(await addSphere(0.3, 1.0, [0.93, 0.95, 0.95, 1], [ -1, 3, 0 ]));
        spheres.addChild(await addSphere(0.5, 1.0, [0.93, 0.95, 0.95, 1], [  0, 3, 0 ]));
        spheres.addChild(await addSphere(0.6, 1.0, [0.93, 0.95, 0.95, 1], [  1, 3, 0 ]));
        spheres.addChild(await addSphere(0.8, 1.0, [0.93, 0.95, 0.95, 1], [  2, 3, 0 ]));
        spheres.addChild(await addSphere(1.0, 1.0, [0.93, 0.95, 0.95, 1], [  3, 3, 0 ]));
        spheres.addChild(await addSphere(0.0, 0.8, [0.93, 0.95, 0.95, 1], [ -3, 2, 0 ]));
        spheres.addChild(await addSphere(0.1, 0.8, [0.93, 0.95, 0.95, 1], [ -2, 2, 0 ]));
        spheres.addChild(await addSphere(0.3, 0.8, [0.93, 0.95, 0.95, 1], [ -1, 2, 0 ]));
        spheres.addChild(await addSphere(0.5, 0.8, [0.93, 0.95, 0.95, 1], [  0, 2, 0 ]));
        spheres.addChild(await addSphere(0.6, 0.8, [0.93, 0.95, 0.95, 1], [  1, 2, 0 ]));
        spheres.addChild(await addSphere(0.8, 0.8, [0.93, 0.95, 0.95, 1], [  2, 2, 0 ]));
        spheres.addChild(await addSphere(1.0, 0.8, [0.93, 0.95, 0.95, 1], [  3, 2, 0 ]));
        spheres.addChild(await addSphere(0.0, 0.6, [0.93, 0.95, 0.95, 1], [ -3, 1, 0 ]));
        spheres.addChild(await addSphere(0.1, 0.6, [0.93, 0.95, 0.95, 1], [ -2, 1, 0 ]));
        spheres.addChild(await addSphere(0.3, 0.6, [0.93, 0.95, 0.95, 1], [ -1, 1, 0 ]));
        spheres.addChild(await addSphere(0.5, 0.6, [0.93, 0.95, 0.95, 1], [  0, 1, 0 ]));
        spheres.addChild(await addSphere(0.6, 0.6, [0.93, 0.95, 0.95, 1], [  1, 1, 0 ]));
        spheres.addChild(await addSphere(0.8, 0.6, [0.93, 0.95, 0.95, 1], [  2, 1, 0 ]));
        spheres.addChild(await addSphere(1.0, 0.6, [0.93, 0.95, 0.95, 1], [  3, 1, 0 ]));
        spheres.addChild(await addSphere(0.0, 0.5, [0.93, 0.95, 0.95, 1], [ -3, 0, 0 ]));
        spheres.addChild(await addSphere(0.1, 0.5, [0.93, 0.95, 0.95, 1], [ -2, 0, 0 ]));
        spheres.addChild(await addSphere(0.3, 0.5, [0.93, 0.95, 0.95, 1], [ -1, 0, 0 ]));
        spheres.addChild(await addSphere(0.5, 0.5, [0.93, 0.95, 0.95, 1], [  0, 0, 0 ]));
        spheres.addChild(await addSphere(0.6, 0.5, [0.93, 0.95, 0.95, 1], [  1, 0, 0 ]));
        spheres.addChild(await addSphere(0.8, 0.5, [0.93, 0.95, 0.95, 1], [  2, 0, 0 ]));
        spheres.addChild(await addSphere(1.0, 0.5, [0.93, 0.95, 0.95, 1], [  3, 0, 0 ]));
        spheres.addChild(await addSphere(0.0, 0.3, [0.93, 0.95, 0.95, 1], [ -3,-1, 0 ]));
        spheres.addChild(await addSphere(0.1, 0.3, [0.93, 0.95, 0.95, 1], [ -2,-1, 0 ]));
        spheres.addChild(await addSphere(0.3, 0.3, [0.93, 0.95, 0.95, 1], [ -1,-1, 0 ]));
        spheres.addChild(await addSphere(0.5, 0.3, [0.93, 0.95, 0.95, 1], [  0,-1, 0 ]));
        spheres.addChild(await addSphere(0.6, 0.3, [0.93, 0.95, 0.95, 1], [  1,-1, 0 ]));
        spheres.addChild(await addSphere(0.8, 0.3, [0.93, 0.95, 0.95, 1], [  2,-1, 0 ]));
        spheres.addChild(await addSphere(1.0, 0.3, [0.93, 0.95, 0.95, 1], [  3,-1, 0 ]));
        spheres.addChild(await addSphere(0.0, 0.1, [0.93, 0.95, 0.95, 1], [ -3,-2, 0 ]));
        spheres.addChild(await addSphere(0.1, 0.1, [0.93, 0.95, 0.95, 1], [ -2,-2, 0 ]));
        spheres.addChild(await addSphere(0.3, 0.1, [0.93, 0.95, 0.95, 1], [ -1,-2, 0 ]));
        spheres.addChild(await addSphere(0.5, 0.1, [0.93, 0.95, 0.95, 1], [  0,-2, 0 ]));
        spheres.addChild(await addSphere(0.6, 0.1, [0.93, 0.95, 0.95, 1], [  1,-2, 0 ]));
        spheres.addChild(await addSphere(0.8, 0.1, [0.93, 0.95, 0.95, 1], [  2,-2, 0 ]));
        spheres.addChild(await addSphere(1.0, 0.1, [0.93, 0.95, 0.95, 1], [  3,-2, 0 ]));
        spheres.addChild(await addSphere(0.0, 0.1, [0.93, 0.95, 0.95, 1], [ -3,-3, 0 ]));
        spheres.addChild(await addSphere(0.1, 0.1, [0.93, 0.95, 0.95, 1], [ -2,-3, 0 ]));
        spheres.addChild(await addSphere(0.3, 0.1, [0.93, 0.95, 0.95, 1], [ -1,-3, 0 ]));
        spheres.addChild(await addSphere(0.5, 0.1, [0.93, 0.95, 0.95, 1], [  0,-3, 0 ]));
        spheres.addChild(await addSphere(0.6, 0.1, [0.93, 0.95, 0.95, 1], [  1,-3, 0 ]));
        spheres.addChild(await addSphere(0.8, 0.1, [0.93, 0.95, 0.95, 1], [  2,-3, 0 ]));
        spheres.addChild(await addSphere(1.0, 0.1, [0.93, 0.95, 0.95, 1], [  3,-3, 0 ]));

        const cameraNode = new Node("Camera");
        cameraNode.addComponent(new CameraComponent());
        cameraNode.camera?.setMain(root);
        this._camera = cameraNode.camera;
        cameraNode.addComponent(new TransformComponent(Mat4.MakeTranslation(0, 0, 5)));
        root.addChild(cameraNode);

        // The projection strategy allows to update the projection matrix aspect
        // ratio automatically with sceneRenderer.resize() function.
        const cameraProjection = new OpticalProjectionStrategy();
        cameraProjection.focalLength = 50;
        cameraProjection.frameSize = 35;
        this._camera!.projectionStrategy = cameraProjection;

        return root;
    }

    async init() {
        // Call this method before use any scene class
        registerComponents();

        // Register the new RotateComponent before use it
        registerComponent("RotateComponent", RotateComponent);

        this._sceneRoot = await this.createScene();

        this._env = this.renderer.factory.environment();
        await this._env?.load({
            textureUrl: '../resources/equirectangular-env3.jpg'
        });

        this._sceneRenderer = this.renderer.factory.scene();
        if (this._sceneRenderer === null) {
            throw new Error("Cannot create SceneRenderer instance");
        }
        await this._sceneRenderer.init();
        await this._sceneRenderer.setEnvironment(this._env!);

        // This function binds the current renderer to the scene. You can skip this
        // function if you only going to use the scene functions to read or write
        // scenes, but you don't need to render it.
        this._sceneRenderer.bindRenderer(this._sceneRoot);
    }

    reshape(width: number,height: number) {
        // If no projection method has been configured in the camera, it would
        // be necessary to manually update the projection matrix here.
        if (!this._sceneRoot || !this._camera) {
            return;
        }
        this._sceneRenderer?.resize(this._sceneRoot, width, height);
    }

    async frame(delta: number) {
        if (!this._sceneRoot) {
            return;
        }
        this._sceneRenderer?.frame(this._sceneRoot, delta);
    }

    display() {
        this._sceneRenderer?.draw();
    }

    destroy() {
        this._sceneRenderer?.destroy();
    }

    keyDown(evt: Bg2KeyboardEvent) {
        this._sceneRenderer?.keyDown(this._sceneRoot!, evt);
    }

    keyUp(evt: Bg2KeyboardEvent) {
        this._sceneRenderer?.keyUp(this._sceneRoot!, evt);
    }

    mouseUp(evt: Bg2MouseEvent) {
        this._sceneRenderer?.mouseUp(this._sceneRoot!, evt);
    }

    mouseDown(evt: Bg2MouseEvent) {
        this._sceneRenderer?.mouseDown(this._sceneRoot!, evt);
    }

    mouseMove(evt: Bg2MouseEvent) {
        this._sceneRenderer?.mouseMove(this._sceneRoot!, evt);
    }

    mouseOut(evt: Bg2MouseEvent) {
        this._sceneRenderer?.mouseOut(this._sceneRoot!, evt);
    }

    mouseDrag(evt: Bg2MouseEvent) {
        this._sceneRenderer?.mouseDrag(this._sceneRoot!, evt);
    }

    mouseWheel(evt: Bg2MouseEvent) {
        this._sceneRenderer?.mouseWheel(this._sceneRoot!, evt);
    }

    touchStart(evt: Bg2TouchEvent) {
        this._sceneRenderer?.touchStart(this._sceneRoot!, evt);
    }

    touchMove(evt: Bg2TouchEvent) {
        this._sceneRenderer?.touchMove(this._sceneRoot!, evt);
    }

    touchEnd(evt: Bg2TouchEvent) {
        this._sceneRenderer?.touchEnd(this._sceneRoot!, evt);
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
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}
