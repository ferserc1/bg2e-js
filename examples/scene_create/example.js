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
import { RenderLayer } from "bg2e/base/PolyList";
import Camera from "bg2e/scene/Camera";
import { degreesToRadians } from "bg2e/math/functions";

class MyAppController extends AppController {
    async createScene() {
        const root = new Node("scene root");
        root.addComponent(new Transform(Mat4.MakeTranslation(0, -0.3, -10)));

        const addLight = ({ color, position, lightType, intensity, transform = Mat4.MakeIdentity() }) => {
            const lightNode = new Node("Light node");
            lightNode.addComponent(new LightComponent());
            lightNode.lightComponent.setProperties({ color, position, lightType, intensity });
            lightNode.addComponent(new Transform(transform));
            return lightNode;
        }

        const addSphere = async (roughness, metallic, diffuse, position) => {
            this._sphereModel = this._sphereModel || createSphere(0.3);
            const sphereNode = new Node("Sphere");
            sphereNode.addComponent(new Drawable());
            sphereNode.drawable.addPolyList(this._sphereModel, await Material.Deserialize({
                diffuse, roughness, metallic
            }), Mat4.MakeIdentity(), this.renderer);
            sphereNode.addComponent(new Transform(Mat4.MakeTranslation(position[0], position[1], position[2])));
            return sphereNode;
        }

        root.addChild(addLight({ position: [  10.0, 10.0, -10.0], color: [1, 0.3, 0.1], intensity:300, lightType: LightType.POINT, transform: Mat4.MakeTranslation( 0, 0, 0) }));
        root.addChild(addLight({ position: [ -10.0, 10.0, -10.0], color: [0.3, 1, 0.1], intensity:300, lightType: LightType.POINT, transform: Mat4.MakeTranslation( 0, 0, 0) }));
        root.addChild(addLight({ position: [ -10.0,-10.0, -10.0], color: [0.1, 0.3, 1], intensity:300, lightType: LightType.POINT, transform: Mat4.MakeTranslation( 0, 0, 0) }));
        root.addChild(addLight({ position: [  10.0,-10.0, -10.0], color: [0.1, 1, 0.3], intensity:300, lightType: LightType.POINT, transform: Mat4.MakeTranslation( 0, 0, 0) }));


        root.addChild(await addSphere(0.0, 1.0, [0.93, 0.95, 0.95, 1], [ -3, 3, 0 ]));
        root.addChild(await addSphere(0.1, 1.0, [0.93, 0.95, 0.95, 1], [ -2, 3, 0 ]));
        root.addChild(await addSphere(0.3, 1.0, [0.93, 0.95, 0.95, 1], [ -1, 3, 0 ]));
        root.addChild(await addSphere(0.5, 1.0, [0.93, 0.95, 0.95, 1], [  0, 3, 0 ]));
        root.addChild(await addSphere(0.6, 1.0, [0.93, 0.95, 0.95, 1], [  1, 3, 0 ]));
        root.addChild(await addSphere(0.8, 1.0, [0.93, 0.95, 0.95, 1], [  2, 3, 0 ]));
        root.addChild(await addSphere(1.0, 1.0, [0.93, 0.95, 0.95, 1], [  3, 3, 0 ]));
        root.addChild(await addSphere(0.0, 0.8, [0.93, 0.95, 0.95, 1], [ -3, 2, 0 ]));
        root.addChild(await addSphere(0.1, 0.8, [0.93, 0.95, 0.95, 1], [ -2, 2, 0 ]));
        root.addChild(await addSphere(0.3, 0.8, [0.93, 0.95, 0.95, 1], [ -1, 2, 0 ]));
        root.addChild(await addSphere(0.5, 0.8, [0.93, 0.95, 0.95, 1], [  0, 2, 0 ]));
        root.addChild(await addSphere(0.6, 0.8, [0.93, 0.95, 0.95, 1], [  1, 2, 0 ]));
        root.addChild(await addSphere(0.8, 0.8, [0.93, 0.95, 0.95, 1], [  2, 2, 0 ]));
        root.addChild(await addSphere(1.0, 0.8, [0.93, 0.95, 0.95, 1], [  3, 2, 0 ]));
        root.addChild(await addSphere(0.0, 0.6, [0.93, 0.95, 0.95, 1], [ -3, 1, 0 ]));
        root.addChild(await addSphere(0.1, 0.6, [0.93, 0.95, 0.95, 1], [ -2, 1, 0 ]));
        root.addChild(await addSphere(0.3, 0.6, [0.93, 0.95, 0.95, 1], [ -1, 1, 0 ]));
        root.addChild(await addSphere(0.5, 0.6, [0.93, 0.95, 0.95, 1], [  0, 1, 0 ]));
        root.addChild(await addSphere(0.6, 0.6, [0.93, 0.95, 0.95, 1], [  1, 1, 0 ]));
        root.addChild(await addSphere(0.8, 0.6, [0.93, 0.95, 0.95, 1], [  2, 1, 0 ]));
        root.addChild(await addSphere(1.0, 0.6, [0.93, 0.95, 0.95, 1], [  3, 1, 0 ]));
        root.addChild(await addSphere(0.0, 0.5, [0.93, 0.95, 0.95, 1], [ -3, 0, 0 ]));
        root.addChild(await addSphere(0.1, 0.5, [0.93, 0.95, 0.95, 1], [ -2, 0, 0 ]));
        root.addChild(await addSphere(0.3, 0.5, [0.93, 0.95, 0.95, 1], [ -1, 0, 0 ]));
        root.addChild(await addSphere(0.5, 0.5, [0.93, 0.95, 0.95, 1], [  0, 0, 0 ]));
        root.addChild(await addSphere(0.6, 0.5, [0.93, 0.95, 0.95, 1], [  1, 0, 0 ]));
        root.addChild(await addSphere(0.8, 0.5, [0.93, 0.95, 0.95, 1], [  2, 0, 0 ]));
        root.addChild(await addSphere(1.0, 0.5, [0.93, 0.95, 0.95, 1], [  3, 0, 0 ]));
        root.addChild(await addSphere(0.0, 0.3, [0.93, 0.95, 0.95, 1], [ -3,-1, 0 ]));
        root.addChild(await addSphere(0.1, 0.3, [0.93, 0.95, 0.95, 1], [ -2,-1, 0 ]));
        root.addChild(await addSphere(0.3, 0.3, [0.93, 0.95, 0.95, 1], [ -1,-1, 0 ]));
        root.addChild(await addSphere(0.5, 0.3, [0.93, 0.95, 0.95, 1], [  0,-1, 0 ]));
        root.addChild(await addSphere(0.6, 0.3, [0.93, 0.95, 0.95, 1], [  1,-1, 0 ]));
        root.addChild(await addSphere(0.8, 0.3, [0.93, 0.95, 0.95, 1], [  2,-1, 0 ]));
        root.addChild(await addSphere(1.0, 0.3, [0.93, 0.95, 0.95, 1], [  3,-1, 0 ]));
        root.addChild(await addSphere(0.0, 0.1, [0.93, 0.95, 0.95, 1], [ -3,-2, 0 ]));
        root.addChild(await addSphere(0.1, 0.1, [0.93, 0.95, 0.95, 1], [ -2,-2, 0 ]));
        root.addChild(await addSphere(0.3, 0.1, [0.93, 0.95, 0.95, 1], [ -1,-2, 0 ]));
        root.addChild(await addSphere(0.5, 0.1, [0.93, 0.95, 0.95, 1], [  0,-2, 0 ]));
        root.addChild(await addSphere(0.6, 0.1, [0.93, 0.95, 0.95, 1], [  1,-2, 0 ]));
        root.addChild(await addSphere(0.8, 0.1, [0.93, 0.95, 0.95, 1], [  2,-2, 0 ]));
        root.addChild(await addSphere(1.0, 0.1, [0.93, 0.95, 0.95, 1], [  3,-2, 0 ]));
        root.addChild(await addSphere(0.0, 0.1, [0.93, 0.95, 0.95, 1], [ -3,-3, 0 ]));
        root.addChild(await addSphere(0.1, 0.1, [0.93, 0.95, 0.95, 1], [ -2,-3, 0 ]));
        root.addChild(await addSphere(0.3, 0.1, [0.93, 0.95, 0.95, 1], [ -1,-3, 0 ]));
        root.addChild(await addSphere(0.5, 0.1, [0.93, 0.95, 0.95, 1], [  0,-3, 0 ]));
        root.addChild(await addSphere(0.6, 0.1, [0.93, 0.95, 0.95, 1], [  1,-3, 0 ]));
        root.addChild(await addSphere(0.8, 0.1, [0.93, 0.95, 0.95, 1], [  2,-3, 0 ]));
        root.addChild(await addSphere(1.0, 0.1, [0.93, 0.95, 0.95, 1], [  3,-3, 0 ]));

        const cameraNode = new Node("Camera");
        cameraNode.addComponent(new Camera());
        cameraNode.camera.setMain(root);
        this._camera = cameraNode.camera;
        root.addChild(cameraNode);

        const testNodeA = new Node("Test Node A");
        testNodeA.addComponent(new Transform(Mat4.MakeRotation(degreesToRadians(90), 0, 1, 0)));
        const testNodeB = new Node("Test Node B");
        testNodeB.addComponent(new Transform(Mat4.MakeTranslation(10, 0, 0)));
        testNodeA.addChild(testNodeB);
        const testNodeC = new Node("Test Node C");
        testNodeC.addComponent(new Transform(Mat4.MakeTranslation(0, 5, 3)));
        testNodeB.addChild(testNodeC);

        const transform = Transform.GetWorldMatrix(testNodeC);
        console.log(transform.toString());
        console.log(transform.multVector(new Vec([1, 0, 0])));
        
        return root;
    }

    async init() {
        registerComponents();
        this._sceneRoot = await this.createScene();

        this._env = this.renderer.factory.environment();
        await this._env.load({
            textureUrl: '../resources/equirectangular-env3.jpg'
        });

        this._sceneRenderer = this.renderer.factory.scene();
        await this._sceneRenderer.init();
        await this._sceneRenderer.setEnvironment(this._env);


        this._viewMatrix = Mat4.MakeIdentity();
        this._projMatrix = Mat4.MakeIdentity();

        this._sceneRenderer.bindRenderer(this._sceneRoot);
    }

    reshape(width,height) {
        this.renderer.viewport = new Vec(width, height);
        this.renderer.canvas.updateViewportSize();
        // Camera: update viewport if the camera has a projection method, or
        // the projection matrix in other case.
        this._camera.projectionMatrix.perspective(45, this.renderer.viewport.aspectRatio, 0.1, 100.0);

        // TODO: sceneRenderer.resize();
    }

    frame(delta) {
        this._sceneRenderer.frame(this._sceneRoot, delta);
    }

    display() {
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