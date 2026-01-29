
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Canvas from "bg2e-js/ts/app/Canvas.ts";
import AppController from "bg2e-js/ts/app/AppController.ts";
import Bg2KeyboardEvent, { SpecialKey } from "bg2e-js/ts/app/Bg2KeyboardEvent.ts";
import Texture, { TextureChannel } from "bg2e-js/ts/base/Texture.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import TextureMergerRenderer from "bg2e-js/ts/render/TextureMergerRenderer.ts";
import { EngineFeatures } from "bg2e-js/ts/render/Renderer.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";

class MyAppController extends AppController {
    private _textureMerger: TextureMergerRenderer | null = null;
    private _textureR: Texture | null = null;
    private _textureG: Texture | null = null;
    private _textureB: Texture | null = null;
    private _textureA: Texture | null = null;

    async init() {
        if (!(this.renderer instanceof WebGLRenderer)) {
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

    reshape(width: number, height: number) {
        const { state } = this.renderer;
        const size = new Vec(width, height);
        state.viewport = size;
        this.renderer.canvas.updateViewportSize();
    }

    async frame(delta: number) {
        this._textureMerger?.update();
    }


    display() {
        if (!this._textureMerger) {
            return;
        }
        this.renderer.presentTexture(this._textureMerger.mergedTexture);
    }

    destroy() {
        
    }

    keyUp(evt: Bg2KeyboardEvent) {
        if (evt.key === SpecialKey.ESCAPE) {
            this.mainLoop.exit();
        }
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
