import Renderer, { EngineFeatures } from "../Renderer";
import MaterialRenderer from "./MaterialRenderer";
import State from "./State";
import PolyListRenderer from "./PolyListRenderer";
import TextureRenderer from "./TextureRenderer";
import RenderBuffer from "./RenderBuffer";
import SkySphere from "./SkySphere";
import SkyCube from "./SkyCube";
import FrameBuffer from "./FrameBuffer";
import Pipeline from "./Pipeline";
import WebGLSceneRenderer from "./SceneRenderer";
import Vec from "../../math/Vec";

function enableExtensions(gl) {
    // Enable all available extensions
    gl.getSupportedExtensions().forEach(ext => {
        gl.getExtension(ext);
    });
}

let g_uuidLast = 0;
export default class WebGLRenderer extends Renderer {
    constructor() {
        super("webgl");
        this._uuid = g_uuidLast++;
    }

    get uniqueId() {
        return this._uuid;
    }

    get frameBuffer() {
        if (!this._frameBuffer) {
            this._frameBuffer = new FrameBuffer(this);
        }
        return this._frameBuffer;
    }

    set viewport(vp) {
        this.state.viewport = vp;
    }

    get viewport() {
        return new Vec(this.gl.getParameter(this.gl.VIEWPORT));
    }

    async init(canvas) {
        await super.init(canvas);
        this._canvas = canvas;

        this._gl = canvas.domElement.getContext("webgl", { preserveDrawingBuffer: true });

        this._state = new State(this);

        enableExtensions.apply(this, [this.gl]);

        await this.initPresentTextureShader();

        await MaterialRenderer.InitResources(this);
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

    materialFactory(material) {
        if (material.renderer) {
            return material.renderer;
        }
        else {
            return new MaterialRenderer(this, material);
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

    skySphereFactory() {
        return new SkySphere(this);
    }

    skyCubeFactory() {
        return new SkyCube(this);
    }

    pipelineFactory() {
        return new Pipeline(this);
    }

    sceneRendererFactory() {
        return new WebGLSceneRenderer(this);
    }
    
    presentTexture(texture, { clearBuffers = true, shader = null, viewport = null } = {}) {
        if (clearBuffers) {
            this.state.clear();
        }

        if (!shader) {
            shader = this.presentTextureShader;
        }

        const prevViewport = this.state.viewport;
        if (viewport) {
            this.state.viewport = viewport;
        }

        this.presentTextureMaterialRenderer.material.diffuse = texture;
        this.presentTextureSurfaceRenderer.bindBuffers();
        shader.setup(this.presentTextureSurfaceRenderer,this.presentTextureMaterialRenderer);
        this.presentTextureSurfaceRenderer.draw();

        this.state.viewport = prevViewport;
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
