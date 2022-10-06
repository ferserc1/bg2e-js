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

import BasicPBRLightShader from 'bg2e/shaders/BasicPBRLightShader';

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
        state.cullFaceEnabled = true;
        state.cullFace = state.BACK;
        state.frontFace = state.CCW;
        state.clearColor = Color.Black();

        this._shader = new BasicPBRLightShader(this.renderer);
        await this._shader.load();

        registerLoaderPlugin(new Bg2LoaderPlugin({ bg2ioPath: "dist" }));
        registerComponents();
        const loader = new Loader();
        const drawable = await loader.loadDrawable("../resources/cubes.bg2");
        this._plistRenderers = [];
        this._plistRenderers = drawable.items.map(({ polyList, material, transform }) => {
            const plistRenderer = this.renderer.factory.polyList(polyList);
            material.metallic = 1;
            material.roughness = 0.4;
            const materialRenderer = this.renderer.factory.material(material);
            return {
                plistRenderer,
                materialRenderer,
                transform: Mat4.Mult(Mat4.MakeTranslation(0, 1, 0),transform)
            }
        });

        this._plistRenderers.push({
            plistRenderer: this.renderer.factory.polyList(createCube(5,0.5,2)),
            materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                diffuse: [0.8, 0.4, 0.1],
                roughness: 0.2,
                metallic: 1
            })),
            transform: Mat4.MakeRotation(45,0,1,0).rotate(0.3, 1, 0, 0)
        });

        this._plistRenderers.push({
            plistRenderer: this.renderer.factory.polyList(createSphere(0.5)),
            materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                diffuse: [0.3,0.98,0.05],
                roughness: 0.1,
                metallic: 1
            })),
            transform: Mat4.MakeTranslation(2, 0, 0)
        });

        this._plistRenderers.push({
            plistRenderer: this.renderer.factory.polyList(createCylinder(1,1)),
            materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                diffuse: [0.3,0.28,0.95],
                roughness: 0.2,
                metallic: 0.2
            })),
            transform: Mat4.MakeTranslation(-2,0,0).rotate(0.3, 1, 0, 0)
        });

        this._plistRenderers.push({
            plistRenderer: this.renderer.factory.polyList(createCone(1,0.5)),
            materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                diffuse: [0.3,0.98,0.85],
                roughness: 0.4,
                metallic: 0.98
            })),
            transform: Mat4.MakeTranslation(-2,0,-2)
        });

        this._plistRenderers.push({
            plistRenderer: this.renderer.factory.polyList(createPlane(5, 5)),
            materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                diffuse: [0.93,0.98,0.05],
                roughness: 0.2,
                metallic: 0
            })),
            transform: Mat4.MakeIdentity()
        });
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
        this._worldMatrix = Mat4.MakeIdentity();
        this._projMatrix = Mat4.MakePerspective(45, this.canvas.viewport.aspectRatio, 0.1, 1000.0);

        this._angle += (delta / 1000) * Math.PI / 4;

        const cameraMatrix = Mat4.MakeIdentity()
            .translate(0, 0, 10)
            .rotate(0.3, -1, 0, 0)
            .rotate(this._angle, 0, 1, 0);
            
        this._viewMatrix = Mat4.GetInverted(cameraMatrix);
        this._shader.cameraPosition = Mat4.GetPosition(cameraMatrix);

        this._renderStates = [];
        this._plistRenderers.forEach(({ plistRenderer, materialRenderer, transform }) => {
            this._renderStates.push(new RenderState({
                shader: this._shader,
                materialRenderer: materialRenderer,
                modelMatrix: (new Mat4(transform)).mult(this._worldMatrix),
                viewMatrix: this._viewMatrix,
                projectionMatrix: this._projMatrix,
                polyListRenderer: plistRenderer
            }))
        });
    }

    display() {
        const { state } = this.renderer;
        state.clear();

        this._renderStates.forEach(rs => rs.draw());
    }

    destroy() {
        this._plistRenderers.forEach(plRenderer => plRenderer.destroy());
        this._plistRenderers = [];
        this._shader.destroy();
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
