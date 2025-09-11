import { app, base, math, primitives, render, shaders } from "bg2e-js";

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
    Vec
} = math;
const {
    WebGLRenderer,
    RenderQueue
} = render;
const {
    PBRLightIBLShader
} = shaders;

/*
 * This example shows how to use the basic pbr shader to render objects using lights
 */
class MyAppController extends AppController {
    async init() {
        this._zoom = 10;

        this._shader = new PBRLightIBLShader(this.renderer);
        await this._shader.load();
        
        this._lights = await Promise.all([
            { position: [10.0, 10.0, -10.0], color: [1, 0.3, 0.1], intensity:300, lightType: LightType.POINT },
            { position: [-10.0, 10.0, -10.0], color: [0.3, 1, 0.1], intensity:300, lightType: LightType.POINT },
            { position: [-10.0,-10.0, -10.0], color: [0.1, 0.3, 1], intensity:300, lightType: LightType.POINT },
            { position: [ 10.0,-10.0, -10.0], color: [0.1, 1, 0.3], intensity:300, lightType: LightType.POINT },
            //{ direction: [ -1, 2, 1 ], intensity: 1, color_: [0.9, 0.9, 0.9, 1], lightType: LightType.DIRECTIONAL }
        ].map(async lightData => {
            const light = new Light();
            await light.deserialize(lightData);
            return light;
        }));


        console.log("Loading scene...");
        const sphereColor = [0.93, 0.95, 0.95, 1];
        const spherePlist = createSphere(0.3);
        this._plistRenderers = await Promise.all([
            { roughness: 0.0, metallic: 1.0, diffuse: sphereColor, position: [ -3, 3, 0 ] },
            { roughness: 0.1, metallic: 1.0, diffuse: sphereColor, position: [ -2, 3, 0 ] },
            { roughness: 0.3, metallic: 1.0, diffuse: sphereColor, position: [ -1, 3, 0 ] },
            { roughness: 0.5, metallic: 1.0, diffuse: sphereColor, position: [  0, 3, 0 ] },
            { roughness: 0.6, metallic: 1.0, diffuse: sphereColor, position: [  1, 3, 0 ] },
            { roughness: 0.8, metallic: 1.0, diffuse: sphereColor, position: [  2, 3, 0 ] },
            { roughness: 1.0, metallic: 1.0, diffuse: sphereColor, position: [  3, 3, 0 ] },
            
            { roughness: 0.0, metallic: 0.8, diffuse: sphereColor, position: [ -3, 2, 0 ] },
            { roughness: 0.1, metallic: 0.8, diffuse: sphereColor, position: [ -2, 2, 0 ] },
            { roughness: 0.3, metallic: 0.8, diffuse: sphereColor, position: [ -1, 2, 0 ] },
            { roughness: 0.5, metallic: 0.8, diffuse: sphereColor, position: [  0, 2, 0 ] },
            { roughness: 0.6, metallic: 0.8, diffuse: sphereColor, position: [  1, 2, 0 ] },
            { roughness: 0.8, metallic: 0.8, diffuse: sphereColor, position: [  2, 2, 0 ] },
            { roughness: 1.0, metallic: 0.8, diffuse: sphereColor, position: [  3, 2, 0 ] },
            
            { roughness: 0.0, metallic: 0.6, diffuse: sphereColor, position: [ -3, 1, 0 ] },
            { roughness: 0.1, metallic: 0.6, diffuse: sphereColor, position: [ -2, 1, 0 ] },
            { roughness: 0.3, metallic: 0.6, diffuse: sphereColor, position: [ -1, 1, 0 ] },
            { roughness: 0.5, metallic: 0.6, diffuse: sphereColor, position: [  0, 1, 0 ] },
            { roughness: 0.6, metallic: 0.6, diffuse: sphereColor, position: [  1, 1, 0 ] },
            { roughness: 0.8, metallic: 0.6, diffuse: sphereColor, position: [  2, 1, 0 ] },
            { roughness: 1.0, metallic: 0.6, diffuse: sphereColor, position: [  3, 1, 0 ] },

            { roughness: 0.0, metallic: 0.5, diffuse: sphereColor, position: [ -3, 0, 0 ] },
            { roughness: 0.1, metallic: 0.5, diffuse: sphereColor, position: [ -2, 0, 0 ] },
            { roughness: 0.3, metallic: 0.5, diffuse: sphereColor, position: [ -1, 0, 0 ] },
            { roughness: 0.5, metallic: 0.5, diffuse: sphereColor, position: [  0, 0, 0 ] },
            { roughness: 0.6, metallic: 0.5, diffuse: sphereColor, position: [  1, 0, 0 ] },
            { roughness: 0.8, metallic: 0.5, diffuse: sphereColor, position: [  2, 0, 0 ] },
            { roughness: 1.0, metallic: 0.5, diffuse: sphereColor, position: [  3, 0, 0 ] },

            { roughness: 0.0, metallic: 0.3, diffuse: sphereColor, position: [ -3,-1, 0 ] },
            { roughness: 0.1, metallic: 0.3, diffuse: sphereColor, position: [ -2,-1, 0 ] },
            { roughness: 0.3, metallic: 0.3, diffuse: sphereColor, position: [ -1,-1, 0 ] },
            { roughness: 0.5, metallic: 0.3, diffuse: sphereColor, position: [  0,-1, 0 ] },
            { roughness: 0.6, metallic: 0.3, diffuse: sphereColor, position: [  1,-1, 0 ] },
            { roughness: 0.8, metallic: 0.3, diffuse: sphereColor, position: [  2,-1, 0 ] },
            { roughness: 1.0, metallic: 0.3, diffuse: sphereColor, position: [  3,-1, 0 ] },
            
            { roughness: 0.0, metallic: 0.1, diffuse: sphereColor, position: [ -3,-2, 0 ] },
            { roughness: 0.1, metallic: 0.1, diffuse: sphereColor, position: [ -2,-2, 0 ] },
            { roughness: 0.3, metallic: 0.1, diffuse: sphereColor, position: [ -1,-2, 0 ] },
            { roughness: 0.5, metallic: 0.1, diffuse: sphereColor, position: [  0,-2, 0 ] },
            { roughness: 0.6, metallic: 0.1, diffuse: sphereColor, position: [  1,-2, 0 ] },
            { roughness: 0.8, metallic: 0.1, diffuse: sphereColor, position: [  2,-2, 0 ] },
            { roughness: 1.0, metallic: 0.1, diffuse: sphereColor, position: [  3,-2, 0 ] },
            
            { roughness: 0.0, metallic: 0.1, diffuse: sphereColor, position: [ -3,-3, 0 ] },
            { roughness: 0.1, metallic: 0.1, diffuse: sphereColor, position: [ -2,-3, 0 ] },
            { roughness: 0.3, metallic: 0.1, diffuse: sphereColor, position: [ -1,-3, 0 ] },
            { roughness: 0.5, metallic: 0.1, diffuse: sphereColor, position: [  0,-3, 0 ] },
            { roughness: 0.6, metallic: 0.1, diffuse: sphereColor, position: [  1,-3, 0 ] },
            { roughness: 0.8, metallic: 0.1, diffuse: sphereColor, position: [  2,-3, 0 ] },
            { roughness: 1.0, metallic: 0.1, diffuse: sphereColor, position: [  3,-3, 0 ] }
        ].map(async ({ roughness, metallic, diffuse, position }) => {
            return {
                plistRenderer: this.renderer.factory.polyList(spherePlist),
                materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                    diffuse,
                    roughness,
                    metallic
                })),
                transform: Mat4.MakeTranslation(...position)
            }
        }));

        const scale = [1, 1];
        const cube = createCube(1,1,1);
        cube.enableCullFace = false;
        this._plistRenderers.push({
            plistRenderer: this.renderer.factory.polyList(cube),
            materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                diffuse: "../resources/logo_transparent.png",
                metallic: "../resources/logo.png",
                roughness: "../resources/logo.png",
                normal: "../resources/logo_nm.png",
                diffuseScale:  scale,
                metallicScale:  scale,
                roughnessScale:  scale,
                normalScale: scale,
                isTransparent: true
            })),
            transform: Mat4.MakeIdentity()
        })
        console.log("Scene load done");

        this._shader.lights = this._lights;
        this._shader.lightTransforms = this._lights.map(() => Mat4.MakeIdentity());

        this._worldMatrix = Mat4.MakeIdentity();
        this._viewMatrix = Mat4.MakeIdentity();
        this._projMatrix = Mat4.MakeIdentity();

        this._renderQueue = new RenderQueue(this.renderer);
        this._renderQueue.enableQueue(RenderLayer.OPAQUE_DEFAULT, this._shader);
        this._renderQueue.enableQueue(RenderLayer.TRANSPARENT_DEFAULT, this._shader);
        
        this._env = this.renderer.factory.environment();
        await this._env.load({ textureUrl: '../resources/equirectangular-env3.jpg' });
        this._shader.environment = this._env;

        // A sky cube to render the environment
        this._skyCube = this.renderer.factory.skyCube();
        await this._skyCube.load(this._env.environmentMap);

        this._rotation = new Vec();
    }

    reshape(width,height) {
        this.renderer.viewport = new Vec(width,height);
        console.log(this.renderer.viewport);
        this.renderer.canvas.updateViewportSize();
    }

    frame(delta) {
        const rotScale = 0.02;
        const cameraMatrix = Mat4.MakeIdentity()
            .translate(0, 0, this._zoom)
            .rotate(this._rotation[1] * rotScale, 1, 0, 0)
            .rotate(this._rotation[0] * rotScale, 0, 1, 0);
        
        // Update projection and view matrixes
        this._projMatrix.assign(Mat4.MakePerspective(45, this.canvas.viewport.aspectRatio, 0.1, 1000.0));
        this._viewMatrix.assign(Mat4.GetInverted(cameraMatrix));
        
        this._shader.cameraPosition = Mat4.GetPosition(cameraMatrix);

        this._renderQueue.viewMatrix = this._viewMatrix;
        this._renderQueue.projectionMatrix = this._projMatrix;
        this._renderQueue.newFrame();
        this._plistRenderers.forEach(({ plistRenderer, materialRenderer, transform }) => {
            this._renderQueue.addPolyList(plistRenderer,materialRenderer,transform);
        });

        this._skyCube.updateRenderState({
            viewMatrix: this._viewMatrix,
            projectionMatrix: this._projMatrix
        });
    }

    display() {
        this.renderer.frameBuffer.clear();
        
        if (!this._env.updated) {
            this._env.updateMaps();
        }

        this._skyCube.draw();

        this._renderQueue.draw(RenderLayer.OPAQUE_DEFAULT);
        this._renderQueue.draw(RenderLayer.TRANSPARENT_DEFAULT);
    }

    destroy() {
        this._plistRenderers.forEach(plRenderer => plRenderer.destroy());
        this._plistRenderers = [];
        this._shader.destroy();
    }

    async keyUp(evt) {
        let img = null;
        switch (evt.key) {
        case 'Digit1':
            img = '../resources/equirectangular-env.jpg';
            break;
        case 'Digit2':
            img = '../resources/equirectangular-env2.jpg';
            break;
        case 'Digit3':
            img = '../resources/equirectangular-env3.jpg';
            break;
        case 'Digit4':
            img = '../resources/equirectangular-env4.jpg';
            break;
        case 'Digit5':
            img = '../resources/equirectangular-env5.jpg';
            break;
        case 'Digit6':
            img = '../resources/equirectangular-env6.jpg';
            break;
        case 'Digit7':
            img = '../resources/equirectangular-env7.jpg';
            break;
        }
        if (img) {
            await this._env.reloadImage(img);
            this._shader.environment = this._env;
            this._skyCube.load(this._env);
        }
    }

    mouseWheel(evt) {
        this._zoom += evt.delta * 0.005;
        evt.stopPropagation();
    }

    mouseDown(evt) {
        this._downPos = new Vec([evt.x, evt.y]);
    }

    mouseDrag(evt) {
        const currPos = new Vec([evt.x, evt.y]);
        const diff = Vec.Sub(this._downPos, currPos);
        this._rotation = Vec.Add(this._rotation, diff);
        this._downPos = currPos;
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
