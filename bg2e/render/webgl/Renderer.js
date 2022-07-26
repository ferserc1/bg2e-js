import Renderer from "../Renderer";
import State from "./State";
import PolyListRenderer from "./PolyListRenderer";
import TextureRenderer from "./TextureRenderer";
export default class WebGLRenderer extends Renderer {
    constructor() {
        super("webgl");
    }

    async init(canvas) {
        await super.init(canvas);
        this._canvas = canvas;

        this._gl = canvas.domElement.getContext("webgl", { preserveDrawingBuffer: true });

        this._state = new State(this);
    }

    get gl() { return this._gl; }

    get canvas() { return this._canvas; }

    get state() {
        return this._state;
    }

    postReshape(width, height) {

    }

    postRedisplay() {
        
    }

    polyListFactory(plist) {
        return super.polyListFactory(new PolyListRenderer(this, plist));
    }

    textureFactory(texture) {
        return new TextureRenderer(this, texture);
    }

    presentTexture(texture, { clearBuffers = true, shader = null } = {}) {
        // https://webglfundamentals.org/webgl/lessons/webgl-render-to-texture.html
        
        if (clearBuffers) {
            this.state.clear();
        }

        if (!shader) {
            shader = this.presentTextureShader;
        }

        this.presentTextureMaterialRenderer.material.diffuse = texture;
        this.presentTextureSurfaceRenderer.bindBuffers();
        shader.setup(this.presentTextureSurfaceRenderer,this.presentTextureMaterialRenderer);
        this.presentTextureSurfaceRenderer.draw();
    }
}
