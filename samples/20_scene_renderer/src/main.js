import { app, base, math, primitives, render, scene, shaders } from "bg2e-js";

const {
    MainLoop,
    FrameUpdate,
    Canvas,
    AppController
} = app;
const {
    Material,
    Light,
    LightType,
    RenderLayer
} = base;
const {
    createCube,
    createSphere
} = primitives;
const {
    Mat4,
    Vec,
    degreesToRadians
} = math;
const {
    WebGLRenderer,
    RenderQueue
} = render;
const {
    Node,
    registerComponents,
    LightComponent,
    TransformComponent,
    DrawableComponent,
    CameraComponent,
    OpticalProjectionStrategy,
    Component,
    registerComponent
} = scene;
const {
    PBRLightIBLShader
} = shaders;

class RotateComponent extends Component {
    constructor() {
        super("RotateComponent");
    }

    clone() {
        return new RotateComponent();
    }

    willUpdate(delta) {
        if (this.transform) {
            this.transform.matrix.rotate(delta / 1000, 0, 1, 0);
        }
    }
}

class MyAppController extends AppController {
    async createScene() {
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
        cameraNode.camera.setMain(root);
        this._camera = cameraNode.camera;
        cameraNode.addComponent(new TransformComponent(Mat4.MakeTranslation(0, 0, 5)));
        root.addChild(cameraNode);

        // The projection strategy allows to update the projection matrix aspect
        // ratio automatically with sceneRenderer.resize() function.
        const cameraProjection = new OpticalProjectionStrategy();
        cameraProjection.focalLength = 50;
        cameraProjection.frameSize = 35;
        this._camera.projectionStrategy = cameraProjection;

        return root;
    }

    async init() {
        // Call this method before use any scene class
        registerComponents();

        // Register the new RotateComponent before use it
        registerComponent("RotateComponent", RotateComponent);

        this._sceneRoot = await this.createScene();

        this._env = this.renderer.factory.environment();
        await this._env.load({
            textureUrl: '../resources/equirectangular-env3.jpg'
        });

        this._sceneRenderer = this.renderer.factory.scene();
        await this._sceneRenderer.init();
        await this._sceneRenderer.setEnvironment(this._env);

        // This function binds the current renderer to the scene. You can skip this
        // function if you only going to use the scene functions to read or write
        // scenes, but you don't need to render it.
        this._sceneRenderer.bindRenderer(this._sceneRoot);
    }

    reshape(width,height) {
        // If no projection method has been configured in the camera, it would
        // be necessary to manually update the projection matrix here.
        this._sceneRenderer.resize(this._sceneRoot,width,height);
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

    keyDown(evt) {
        this._sceneRenderer.keyDown(this._sceneRoot, evt);
    }

    keyUp(evt) {
        this._sceneRenderer.keyUp(this._sceneRoot, evt);
    }

    mouseUp(evt) {
        this._sceneRenderer.mouseUp(this._sceneRoot, evt);
    }

    mouseDown(evt) {
        this._sceneRenderer.mouseDown(this._sceneRoot, evt);
    }

    mouseMove(evt) {
        this._sceneRenderer.mouseMove(this._sceneRoot, evt);
    }

    mouseOut(evt) {
        this._sceneRenderer.mouseOut(this._sceneRoot, evt);
    }

    mouseDrag(evt) {
        this._sceneRenderer.mouseDrag(this._sceneRoot, evt);
    }

    mouseWheel(evt) {
        this._sceneRenderer.mouseWheel(this._sceneRoot, evt);
    }

    touchStart(evt) {
        this._sceneRenderer.touchStart(this._sceneRoot, evt);
    }

    touchMove(evt) {
        this._sceneRenderer.touchMove(this._sceneRoot, evt);
    }

    touchEnd(evt) {
        this._sceneRenderer.touchEnd(this._sceneRoot, evt);
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
