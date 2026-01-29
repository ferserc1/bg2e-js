import AppController from "bg2e-js/ts/app/AppController.ts";
import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Material from "bg2e-js/ts/base/Material.ts";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import { createCube } from "bg2e-js/ts/primitives/index.ts";
import RenderState from "bg2e-js/ts/render/RenderState.ts";
import Renderer from "bg2e-js/ts/render/Renderer.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import BasicDiffuseColorShader from "bg2e-js/ts/shaders/BasicDiffuseColorShader.ts";

class MyAppController extends AppController {
    [key: string]: any;
    async init() {
        if (!(this.renderer instanceof WebGLRenderer)) {
            throw new Error("This example works only with WebGL Renderer");
        }

        this.renderer.state.depthTestEnabled = true;

        this._viewMatrix = Mat4.MakeIdentity();
        this._projectionMatrix = Mat4.MakePerspective(50, this.canvas.viewport.aspectRatio,0.1,100.0);

        this._skySphere = this.renderer.factory.skySphere();
        await this._skySphere.load('../resources/country_field_sun.jpg');

        this._shader = new BasicDiffuseColorShader(this.renderer);
        await this._shader.load();
        this._cube = this.renderer.factory.polyList(createCube(1,1,1));
        this._material = this.renderer.factory.material(await Material.Deserialize({
            diffuse: [0.4,0.33,0.1,1]
        }));
    }

    reshape(width: number,height: number) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
        this._projectionMatrix = Mat4.MakePerspective(50, this.canvas.viewport.aspectRatio,0.1,100.0);
        this.renderer.canvas.updateViewportSize();
    }


    async frame(delta: number) {
        this._alpha = this._alpha || 0;
        this._alpha += delta * 0.001;
        this._viewMatrix.identity()
            .rotate(this._alpha, 0, 1, 0)
            .translate(0, -0.5, -4);

        this._skySphere.updateRenderState({ 
            viewMatrix: this._viewMatrix,
            projectionMatrix: this._projectionMatrix
        });

        this._renderStates = [
            new RenderState({
                polyListRenderer: this._cube,
                materialRenderer: this._material,
                shader: this._shader,
                modelMatrix: Mat4.MakeIdentity(),
                viewMatrix: this._viewMatrix,
                projectionMatrix: this._projectionMatrix

            })
        ];
    }

    display() {
        const { state } = this.renderer;
        state.clear();

        this._skySphere.draw();
        this._renderStates.forEach((rs: RenderState) => rs.draw());
    }

    destroy() {
        this._skySphere.destroy();
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
