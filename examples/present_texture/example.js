import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import Canvas from "bg2e/app/Canvas";
import AppController from "bg2e/app/AppController";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Texture from "bg2e/base/Texture";


class MyAppController extends AppController {
    async init() {
        if (!this.renderer instanceof WebGLRenderer) {
            throw new Error("This example works only with WebGL Renderer");
        }

        this._texture = new Texture();
        this._texture.fileName = '../resources/country_field_sun.jpg';
        await this._texture.loadImageData();
    }

    reshape(width,height) {

    }

    frame(delta) {
        
    }

    display() {
        this.renderer.presentTexture(this._texture);
    }

    destroy() {
        
    }

    keyUp(evt) {
        
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
