import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import * as math from "bg2e/math/functions";
import Canvas from "bg2e/app/Canvas";
import AppController from "bg2e/app/AppController";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Mat4 from "bg2e/math/Mat4";

import Vec from "bg2e/math/Vec";
import Color from "bg2e/base/Color";
import Loader, { registerLoaderPlugin } from "bg2e/db/Loader";
import Bg2LoaderPlugin from "bg2e/db/Bg2LoaderPlugin";
import { registerComponents } from "bg2e/scene";
import Material from "bg2e/base/Material";
import RenderState from "bg2e/render/RenderState";
import { createCube, createSphere, createCylinder, createCone, createPlane } from 'bg2e/primitives';

import PBRLightIBLShader from "bg2e/shaders/PBRLightIBLShader";
import Light, { LightType } from "bg2e/base/Light";

/*
 * This example shows how to use the basic pbr shader to render objects using lights
 */
class MyAppController extends AppController {
    async init() {
        if (!this.renderer instanceof WebGLRenderer) {
            throw new Error("This example works only with WebGL Renderer");
        }

        const { state } = this.renderer;

        state.depthTestEnabled = true;
        state.clearColor = new Color([0.1, 0.1, 0.112, 1]);

        this._shader = new PBRLightIBLShader(this.renderer);
        await this._shader.load();
        
        this._lights = await Promise.all([
            { position: [10.0, 10.0, -10.0], color: [1.0, 0.5, 0.0], intensity:300, lightType: LightType.POINT },
            { position: [-10.0, 10.0, -10.0], color: [0.5, 0.0, 1.0], intensity:300, lightType: LightType.POINT },
            { position: [-10.0,-10.0, -10.0], color: [0.0, 0.5, 1.0], intensity:300, lightType: LightType.POINT },
            { position: [ 10.0,-10.0, -10.0], color: [0.0, 1.0, 0.5], intensity:300, lightType: LightType.POINT },
            { direction: [ -1, 2, 1 ], intensity: 1, color_: [0.9, 0.9, 0.9, 1], lightType: LightType.DIRECTIONAL }
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

        this._env = this.renderer.factory.environment();
        await this._env.load({ textureUrl: '../resources/equirectangular-env3.jpg' });
        this._shader.environment = this._env;

        // A sky cube to render the environment
        this._skyCube = this.renderer.factory.skyCube();
        await this._skyCube.load(this._env.environmentMap);
    }

    reshape(width,height) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
        this.renderer.canvas.updateViewportSize();
    }

    frame(delta) {
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
        
        this._shader.cameraPosition = Mat4.GetPosition(cameraMatrix);

        this._skyCube.updateRenderState({
            viewMatrix: this._viewMatrix,
            projectionMatrix: this._projMatrix
        });
    }

    display() {
        const { state } = this.renderer;
        state.clear();
        state.depthTestEnabled = true;
            state.frontFace = state.CCW;

        if (!this._env.updated) {
            this._env.updateMaps();
            
        }

        this._skyCube.draw();

        this._renderStates.forEach(rs => rs.draw());
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
