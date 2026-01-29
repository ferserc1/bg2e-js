import { app, base, render, math } from "bg2e-js/ts";

const {
    MainLoop,
    FrameUpdate,
    Canvas,
    AppController
} = app;
const {
    WebGLRenderer
} = render;
const {
    Color
} = base;
const {
    Vec
} = math;

import Texture from "bg2e-js/ts/base/Texture.ts";

class MyAppController extends AppController {
    private _texture: Texture | null = null;

    async init() {
        if (!(this.renderer instanceof WebGLRenderer)) {
            throw new Error("This example works only with WebGL Renderer");
        }

        this._texture = new Texture();
        this._texture.fileName = '../resources/country_field_sun.jpg';
        await this._texture.loadImageData();

        this.renderer.state.clearColor = Color.Green();
    }

    reshape(width: number, height: number) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
        this.renderer.canvas.updateViewportSize();
    }


    display() {
        this.renderer.presentTexture(this._texture);
    }

    destroy() {
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
