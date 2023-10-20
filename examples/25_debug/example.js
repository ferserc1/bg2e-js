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
import { PolyListCullFace, RenderLayer } from "bg2e/base/PolyList";
import { BlendFunction } from "bg2e/render/Pipeline";

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

        this._zoom = 10;

        this._shader = new PBRLightIBLShader(this.renderer);
        await this._shader.load();
        
        this._lights = await Promise.all([
            { direction: [ -1, -2, 1 ], intensity: 1, color_: [0.9, 0.9, 0.9, 1], lightType: LightType.DIRECTIONAL }
        ].map(async lightData => {
            const light = new Light();
            await light.deserialize(lightData);
            return light;
        }));

        console.log("Loading scene...");
        const sphereColor = [0.93, 0.95, 0.95, 1];
        const spherePlist = createSphere(2);
        this._plistRenderers = await Promise.all([
            { roughness: 0.5, metallic: 0.5, diffuse: sphereColor, position: [  0, 0, 0 ] }
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
        this._shader.lightTransforms = this._lights.map(() => Mat4.MakeIdentity());

        this._worldMatrix = Mat4.MakeIdentity();
        this._viewMatrix = Mat4.MakeIdentity();
        this._projMatrix = Mat4.MakeIdentity();

        this._opaquePipeline = this.renderer.factory.pipeline();
        this._opaquePipeline.setBlendState({
            enabled: false
        });
        this._opaquePipeline.create();
        this._transparentPipeline = this.renderer.factory.pipeline();
        this._transparentPipeline.setBlendState({
            enabled: true,
            blendFuncSrc: BlendFunction.SRC_ALPHA,
            blendFuncDst: BlendFunction.ONE_MINUS_SRC_ALPHA,
            blendFuncSrcAlpha: BlendFunction.ONE,
            blendFuncDstAlpha: BlendFunction.ONE_MINUS_SRC_ALPHA
        });
        this._transparentPipeline.create();

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

        this._rotation = new Vec();
    }

    reshape(width,height) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
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
        
        this._renderStates.forEach(rs => {
            if (rs.isLayerEnabled(RenderLayer.OPAQUE_DEFAULT)) {
                this._opaquePipeline.activate();
            }
            else if (rs.isLayerEnabled(RenderLayer.TRANSPARENT_DEFAULT)) {
                this._transparentPipeline.activate();
            }
            rs.draw()
        });
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

    mouseMove(evt) {
        this.mainLoop.postRedisplay();
    }
}

window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    canvas.domElement.style.width = "100vw";
    canvas.domElement.style.height = "100vh";
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);

    // We set FrameUpdate.MANUAL to stop on each frame until the user
    // trigger an input event
    mainLoop.updateMode = FrameUpdate.MANUAL;
    await mainLoop.run();
}
