import { app, base, math, primitives, render, scene, shaders } from "bg2e-js";

const {
    MainLoop,
    FrameUpdate,
    Canvas
} = app;
const {
    Material,
    LightType
} = base;
const {
    createSphere
} = primitives;
const {
    Mat4
} = math;
const {
    WebGLRenderer,
    SceneAppController
} = render;
const {
    Node,
    LightComponent,
    TransformComponent,
    DrawableComponent,
    CameraComponent,
    OpticalProjectionStrategy,
    OrbitCameraControllerComponent,
    EnvironmentComponent,
} = scene;

class MyAppController extends SceneAppController {
    async loadScene() {
        const root = new Node("scene root");
        root.addComponent(new TransformComponent(Mat4.MakeTranslation(0, -0.3, -10)));

        const addLight = ({ color, position, lightType, intensity, transform = Mat4.MakeIdentity() }) => {
            const lightNode = new Node("Light node");
            lightNode.addComponent(new LightComponent());
            lightNode.lightComponent.setProperties({ color, position, lightType, intensity });
            lightNode.addComponent(new TransformComponent(transform));
            return lightNode;
        }

        const addSphere = async (roughness, metallic, diffuse, position) => {
            this._sphereModel = this._sphereModel || createSphere(0.3);
            const sphereNode = new Node("Sphere");
            sphereNode.addComponent(new DrawableComponent());
            sphereNode.drawable.addPolyList(this._sphereModel, await Material.Deserialize({
                diffuse, roughness, metallic
            }), Mat4.MakeIdentity(), this.renderer);
            sphereNode.addComponent(new TransformComponent(Mat4.MakeTranslation(position[0], position[1], position[2])));
            return sphereNode;
        }

        root.addChild(addLight({ position: [ 0, 0, 0 ], color: [1, 0.3, 0.1], intensity:250, lightType: LightType.POINT, transform: Mat4.MakeTranslation(  10.0, 10.0, -10.0) }));
        root.addChild(addLight({ position: [ 0, 0, 0 ], color: [0.3, 1, 0.1], intensity:250, lightType: LightType.POINT, transform: Mat4.MakeTranslation( -10.0, 10.0, -10.0) }));
        root.addChild(addLight({ position: [ 0, 0, 0 ], color: [0.1, 0.3, 1], intensity:250, lightType: LightType.POINT, transform: Mat4.MakeTranslation( -10.0,-10.0, -10.0) }));
        root.addChild(addLight({ position: [ 0, 0, 0 ], color: [0.1, 1, 0.3], intensity:250, lightType: LightType.POINT, transform: Mat4.MakeTranslation(  10.0,-10.0, -10.0) }));

        const directionalLight = addLight({ lightType: LightType.DIRECTIONAL, intensity: 5, transform: Mat4.MakeRotation(0.7853, -1, 0, 0) });
        root.addChild(directionalLight);
        window.light = directionalLight;

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

        const cameraNode = new Node("Camera");
        cameraNode.addComponent(new CameraComponent());
        cameraNode.camera.setMain(root);
        this._camera = cameraNode.camera;
        cameraNode.addComponent(new TransformComponent(Mat4.MakeTranslation(0, 0, 5)));
        cameraNode.addComponent(new OrbitCameraControllerComponent());
        root.addChild(cameraNode);

        // The projection strategy allows to update the projection matrix aspect
        // ratio automatically with sceneRenderer.resize() function.
        const cameraProjection = new OpticalProjectionStrategy();
        cameraProjection.focalLength = 50;
        cameraProjection.frameSize = 35;
        this._camera.projectionStrategy = cameraProjection;

        const env = new EnvironmentComponent();
        env.equirectangularTexture = '../resources/equirectangular-env3.jpg';
        env.showSkybox = true;
        root.addComponent(env);

        return root;
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
