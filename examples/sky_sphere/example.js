import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import Canvas from "bg2e/app/Canvas";
import AppController from "bg2e/app/AppController";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Vec from "bg2e/math/Vec";
import Mat4 from "bg2e/math/Mat4";

class MyAppController extends AppController {
    async init() {
        if (!this.renderer instanceof WebGLRenderer) {
            throw new Error("This example works only with WebGL Renderer");
        }

        this.renderer.state.depthTestEnabled = true;

        this._viewMatrix = Mat4.MakeIdentity();
        this._viewMatrix.translate(0, 0, -5);
        this._projectionMatrix = Mat4.MakePerspective(50, this.renderer.state.viewport.aspectRatio,0.1,100.0);

        this._skySphere = this.renderer.factory.skySphere();
        await this._skySphere.load('../resources/country_field_sun.jpg');
    }

    reshape(width,height) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
        this._projectionMatrix = Mat4.MakePerspective(50, this.renderer.state.viewport.aspectRatio,0.1,100.0);
        this.renderer.canvas.updateViewportSize();
    }


    frame(delta) {
        //this._viewMatrix.rotate(delta, 0, 1, 0);

        this._renderStates = [
            this._skySphere.getRenderState({ 
                viewMatrix: this._viewMatrix,
                projectionMatrix: this._projectionMatrix
            })
        ];
        //const renderState = this._skySphere.getRenderState({ viewMatrix, projectionMatrix });
    }

    display() {
        const { state } = this.renderer;
        state.clear();

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
