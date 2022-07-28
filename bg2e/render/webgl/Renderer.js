import Renderer, { EngineFeatures } from "../Renderer";
import State from "./State";
import PolyListRenderer from "./PolyListRenderer";
import TextureRenderer from "./TextureRenderer";
import RenderBuffer from "./RenderBuffer";

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
        if (plist.renderer) {
            return plist.renderer;
        }
        else{
            const plistRenderer = new PolyListRenderer(this, plist);
            plistRenderer.init();
            plistRenderer.refresh();
            return plistRenderer;
        }
    }

    textureFactory(texture) {
        if (texture.renderer) {
            return texture.renderer;
        }
        else {
            return new TextureRenderer(this, texture);
        }
    }

    renderBufferFactory() {
        return new RenderBuffer(this);
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

     // Compatibility function
     supportsFeatures(features) {
        if (features & EngineFeatures.RENDER_TARGET_TEXTURES) {
            if (!this.gl.getExtension("WEBGL_draw_buffers")) {
                return false;
            }
        }

        if (features & EngineFeatures.RENDER_TARGET_FLOAT) {
            if (!this.gl.getExtension("WEBGL_color_buffer_float")) {
                return false;
            }
        }

        if (features & EngineFeatures.RENDER_TARGET_DEPTH) {
            if (!this.gl.getExtension("WEBGL_depth_texture") || !this.gl.getExtension("WEBGL_draw_buffers")) {
                return false;
            }
        }

        return true;
    }

    getMaximumRenderTargets() {
        const ext = this.gl.getExtension("WEBGL_draw_buffers");
        if (ext) {
            return this.gl.getParameter(ext.MAX_DRAW_BUFFERS_WEBGL);
        }
        else {
            return 1;
        }
    }
}
