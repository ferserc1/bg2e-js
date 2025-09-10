
import { app, base, math, render } from "bg2e-js";

const  {
    MainLoop,
    FrameUpdate,
    Canvas,
    AppController,
    SpecialKey
} = app;
const {
    Texture, TextureChannel
} = base;
const {
    Vec
} = math;
const {
    WebGLRenderer,
    EngineFeatures
} = render;

class MyAppController extends AppController {
    async init() {
        if (!this.renderer instanceof WebGLRenderer) {
            throw new Error("This example works only with WebGL Renderer");
        }

        if (!this.renderer.supportsFeatures(EngineFeatures.RENDER_TARGET_TEXTURES)) {
            throw new Error("Unsupported features");
        }


        this._textureMerger = this.renderer.factory.textureMerger();

        this._textureR = new Texture();
        this._textureR.fileName = '../resources/r-texture.png';
        this._textureG = new Texture();
        this._textureG.fileName = '../resources/g-texture.png';
        this._textureB = new Texture();
        this._textureB.fileName = '../resources/b-texture.png';
        this._textureA = new Texture();
        this._textureA.fileName = '../resources/a-texture.png';
        await Promise.all([
            this._textureR.loadImageData(),
            this._textureG.loadImageData(),
            this._textureB.loadImageData(),
            this._textureA.loadImageData()
        ]);

        this._textureMerger.setTexture(this._textureR, TextureChannel.R, TextureChannel.R);
        this._textureMerger.setTexture(this._textureG, TextureChannel.G, TextureChannel.G);
        this._textureMerger.setTexture(this._textureB, TextureChannel.B, TextureChannel.B);
        this._textureMerger.setTexture(this._textureA, TextureChannel.A, TextureChannel.A);
    }

    reshape(width,height) {
        const { state } = this.renderer;
        const size = new Vec(width, height);
        state.viewport = size;
        this.renderer.canvas.updateViewportSize();
    }

    frame(delta) {
        this._textureMerger.update();
    }


    display() {
        this.renderer.presentTexture(this._textureMerger.mergedTexture);
    }

    destroy() {
        
    }

    keyUp(evt) {
        if (evt.key === SpecialKey.ESCAPE) {
            this.mainLoop.exit();
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
