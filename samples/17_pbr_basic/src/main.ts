import AppController from "bg2e-js/ts/app/AppController.ts";
import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Color from "bg2e-js/ts/base/Color.ts";
import Light, { LightType } from "bg2e-js/ts/base/Light.ts";
import Material from "bg2e-js/ts/base/Material.ts";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import { createSphere } from "bg2e-js/ts/primitives/index.ts";
import RenderState from "bg2e-js/ts/render/RenderState.ts";
import Renderer from "bg2e-js/ts/render/Renderer.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import BasicPBRLightShader from "bg2e-js/ts/shaders/BasicPBRLightShader.ts";

/*
 * This example shows how to use the basic pbr shader to render objects using lights
 */
class MyAppController extends AppController {
    protected _shader: BasicPBRLightShader | null = null;
    protected _lights: Light[] = [];
    protected _plistRenderers: {
        plistRenderer: any,
        materialRenderer: any,
        transform: Mat4
    }[] = [];
    protected _worldMatrix: Mat4 = Mat4.MakeIdentity();
    protected _viewMatrix: Mat4 = Mat4.MakeIdentity();
    protected _projMatrix: Mat4 = Mat4.MakeIdentity();
    protected _renderStates: RenderState[] = [];
    protected _elapsed: number = 0;
    protected _angle: number = 0;
    
    async init() {
        if (!(this.renderer instanceof WebGLRenderer)) {
            throw new Error("This example works only with WebGL Renderer");
        }

        const { state } = this.renderer;

        state.depthTestEnabled = true;
        state.clearColor = Color.Black();

        this._shader = new BasicPBRLightShader(this.renderer);
        await this._shader.load();
        
        this._lights = await Promise.all([
            { position: [10.0, 10.0, -10.0], color: [1.0, 0.5, 0.0], intensity:50, lightType: LightType.POINT },
            { position: [-10.0, 10.0, -10.0], color: [0.5, 0.0, 1.0], intensity:50, lightType: LightType.POINT },
            { position: [-10.0,-10.0, -10.0], color: [0.0, 0.5, 1.0], intensity:50, lightType: LightType.POINT },
            { position: [ 10.0,-10.0, -10.0], color: [0.0, 1.0, 0.5], intensity:50, lightType: LightType.POINT },
            { direction: [ -1, 2, 1 ], intensity: 100, color_: [0.9, 0.9, 0.9, 1], lightType: LightType.DIRECTIONAL }
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
                transform: Mat4.MakeTranslation(position)
            }
        }));
        console.log("Scene load done");

        this._shader.lights = this._lights;

        this._worldMatrix = Mat4.MakeIdentity();
        this._viewMatrix = Mat4.MakeIdentity();
        this._projMatrix = Mat4.MakeIdentity();

        this._renderStates = [];
        this._plistRenderers.forEach(({ plistRenderer, materialRenderer, transform }) => {
            this._renderStates.push(new RenderState({
                shader: this._shader,
                materialRenderer: materialRenderer,
                modelMatrix: (new Mat4(transform)).mult(this._worldMatrix),
                polyListRenderer: plistRenderer,

                // Save view and projection matrixes pointers to update
                // from the frame() callback
                viewMatrix: this._viewMatrix,
                projectionMatrix: this._projMatrix
            }))
        });
    }

    reshape(width: number,height: number) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
        this.renderer.canvas.updateViewportSize();
    }

    async frame(delta: number) {
        this._elapsed = this._elapsed || 0;
        this._elapsed += delta / 1000;
        this._angle = this._angle || 0;

        this._angle += (delta / 1000) * Math.PI / 4;

        const cameraMatrix = Mat4.MakeIdentity()
            .translate(0, 0, 10)
            .rotate(0.3, -1, 0, 0)
            .rotate(this._angle, 0, 1, 0);
        
        // Update projection and view matrixes
        this._projMatrix.assign(Mat4.MakePerspective(45, this.canvas.viewport.aspectRatio, 0.1, 1000.0));
        this._viewMatrix.assign(Mat4.GetInverted(cameraMatrix));
        
        this._shader!.cameraPosition = Mat4.GetPosition(cameraMatrix);   
    }

    display() {
        const { state } = this.renderer;
        state.clear();

        this._renderStates.forEach(rs => rs.draw());
    }

    destroy() {
        this._plistRenderers.forEach(plRenderer => plRenderer.plistRenderer.destroy());
        this._plistRenderers = [];
        this._shader?.destroy();
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
