import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import Canvas from "bg2e/app/Canvas";
import AppController from "bg2e/app/AppController";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Vec from "bg2e/math/Vec";
import Mat4 from "bg2e/math/Mat4";
import { createCube } from "bg2e/primitives";
import Material from "bg2e/base/Material";
import RenderState from "bg2e/render/RenderState";
import BasicDiffuseColorShader from "bg2e/shaders/BasicDiffuseColorShader";

class MyAppController extends AppController {
    async init() {
        if (!this.renderer instanceof WebGLRenderer) {
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

    reshape(width,height) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
        this._projectionMatrix = Mat4.MakePerspective(50, this.canvas.viewport.aspectRatio,0.1,100.0);
        this.renderer.canvas.updateViewportSize();
    }


    frame(delta) {
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
        this._renderStates.forEach(rs => rs.draw());
    }

    destroy() {
        this._skySphere.destroy();
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
