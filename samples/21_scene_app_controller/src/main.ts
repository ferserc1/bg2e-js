import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Light, { LightType } from "bg2e-js/ts/base/Light.ts";
import Material from "bg2e-js/ts/base/Material.ts";
import PolyList from "bg2e-js/ts/base/PolyList.js";
import Bg2LoaderPlugin from "bg2e-js/ts/db/Bg2LoaderPlugin.ts";
import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import ObjLoaderPlugin from "bg2e-js/ts/db/ObjLoaderPlugin.ts";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import { createSphere } from "bg2e-js/ts/primitives/index.ts";
import SceneAppController from "bg2e-js/ts/render/SceneAppController.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import CameraComponent, { OpticalProjectionStrategy } from "bg2e-js/ts/scene/Camera.ts";
import DrawableComponent from "bg2e-js/ts/scene/Drawable.ts";
import EnvironmentComponent from "bg2e-js/ts/scene/EnvironmentComponent.ts";
import LightComponent from "bg2e-js/ts/scene/LightComponent.ts";
import Node from "bg2e-js/ts/scene/Node.ts";
import OrbitCameraControllerComponent from "bg2e-js/ts/scene/OrbitCameraController.ts";
import TransformComponent from "bg2e-js/ts/scene/Transform.ts";

class MyAppController extends SceneAppController {
    protected _sphereModel: PolyList | null = null;
    protected _camera: CameraComponent | null = null;

    async loadScene() {
        registerLoaderPlugin(new Bg2LoaderPlugin({ bg2ioPath: "dist/" }));
        registerLoaderPlugin(new ObjLoaderPlugin());

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

        root.addChild(addLight({ position: [ 0, 0, 0 ], color: [1, 0.3, 0.1], intensity:250, lightType: LightType.POINT, transform: Mat4.MakeTranslation(  10.0, 10.0, -10.0) }));
        root.addChild(addLight({ position: [ 0, 0, 0 ], color: [0.3, 1, 0.1], intensity:250, lightType: LightType.POINT, transform: Mat4.MakeTranslation( -10.0, 10.0, -10.0) }));
        root.addChild(addLight({ position: [ 0, 0, 0 ], color: [0.1, 0.3, 1], intensity:250, lightType: LightType.POINT, transform: Mat4.MakeTranslation( -10.0,-10.0, -10.0) }));
        root.addChild(addLight({ position: [ 0, 0, 0 ], color: [0.1, 1, 0.3], intensity:250, lightType: LightType.POINT, transform: Mat4.MakeTranslation(  10.0,-10.0, -10.0) }));

        const directionalLight = addLight({ lightType: LightType.DIRECTIONAL, intensity: 5, transform: Mat4.MakeRotation(0.7853, -1, 0, 0), color: [1,1,1], position: [0,0,0] });
        root.addChild(directionalLight);

        const spheres = new Node("Spheres");
        spheres.addComponent(new TransformComponent());
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

        const loader = new Loader();
        const drawable = await loader.loadDrawable("../resources/plane.obj");
        const modelNode = new Node("Model");
        modelNode.addComponent(drawable);
        root.addChild(modelNode);

        const cameraNode = new Node("Camera");
        cameraNode.addComponent(new CameraComponent());
        cameraNode.camera?.setMain(root);
        this._camera = cameraNode.camera ?? null;
        cameraNode.addComponent(new TransformComponent(Mat4.MakeTranslation(0, 0, 5)));
        cameraNode.addComponent(new OrbitCameraControllerComponent());
        root.addChild(cameraNode);

        // The projection strategy allows to update the projection matrix aspect
        // ratio automatically with sceneRenderer.resize() function.
        const cameraProjection = new OpticalProjectionStrategy();
        cameraProjection.focalLength = 50;
        cameraProjection.frameSize = 35;
        if (this._camera) {
            this._camera.projectionStrategy = cameraProjection;
        }

        const env = new EnvironmentComponent();
        env.equirectangularTexture = '../resources/equirectangular-env3.jpg';
        env.showSkybox = true;
        root.addComponent(env);

        return root;
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
