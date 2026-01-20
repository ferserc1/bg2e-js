import Renderer, { EngineFeatures } from "../Renderer";
import State from "./State";
import PolyListRenderer from "../PolyListRenderer";
import TextureRenderer from "../TextureRenderer";
import RenderBuffer from "../RenderBuffer";
import SkySphere from "../SkySphere";
import SkyCube from "../SkyCube";
import FrameBuffer from "../FrameBuffer";
import Pipeline from "../Pipeline";
import MaterialRenderer from "../MaterialRenderer";
import Shader from "../Shader";

import WebGLMaterialRenderer from "./MaterialRenderer";
import WebGLPolyListRenderer from "./PolyListRenderer";
import WebGLTextureRenderer from "./TextureRenderer";
import WebGLRenderBuffer from "./RenderBuffer";
import WebGLSkySphere from "./SkySphere";
import WebGLSkyCube from "./SkyCube";
import WebGLFrameBuffer from "./FrameBuffer";
import WebGLPipeline from "./Pipeline";
import WebGLSceneRenderer from "./SceneRenderer";
import Vec from "../../math/Vec";
import VertexBuffer, { BufferTarget } from "./VertexBuffer";
import ShadowRenderer from "./ShadowRenderer";
import type Canvas from "../../app/Canvas";
import type PolyList from "../../base/PolyList";
import type Material from "../../base/Material";
import type Texture from "../../base/Texture";

function enableExtensions(gl: WebGLRenderingContext): void {
    // Enable all available extensions
    gl.getSupportedExtensions()?.forEach(ext => {
        gl.getExtension(ext);
    });
}

let g_uuidLast = 0;
export default class WebGLRenderer extends Renderer {
    protected _uuid: number;
    protected _gl!: WebGLRenderingContext;
    protected _debugMode: boolean = false;
    protected _state!: State;

    constructor() {
        super("webgl");
        this._uuid = g_uuidLast++;
    }

    get uniqueId(): string {
        return this._uuid.toString();
    }

    get typeId(): string {
        return "WebGL";
    }

    get frameBuffer(): FrameBuffer {
        if (!this._frameBuffer) {
            this._frameBuffer = new WebGLFrameBuffer(this);
        }
        return this._frameBuffer;
    }

    set viewport(vp: Vec) {
        this.state.viewport = vp;
    }

    get viewport(): Vec {
        return new Vec(this.gl.getParameter(this.gl.VIEWPORT));
    }

    get debugMode(): boolean {
        return this._debugMode || false;
    }

    async init(canvas: Canvas): Promise<void> {
        await super.init(canvas);
        this._canvas = canvas;

        this._gl = canvas.domElement.getContext("webgl", { preserveDrawingBuffer: true }) as WebGLRenderingContext;
        (this._gl as any)._bg2e_object = this;
        const requestDebug = new URLSearchParams(location.search).get("debug") == "true";
        this._debugMode = requestDebug;
        if ((window as any).WebGLDebugUtils && requestDebug) {
            const gl = this._gl;
            console.warn("Using WebGLDebugUtils: this must cause an impact in performance");
            function throwOnError(err: number, funcName: string, args: any[]): void {
                throw (window as any).WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
            }

            const printBufferSize = (id: number | undefined, arrayBufferType: string): void => {
                const size = gl.getBufferParameter((gl as any)[arrayBufferType], gl.BUFFER_SIZE);
                console.log(`   ${arrayBufferType} id: ${id}, size: ${size}`);
            }

            function logGLCall(functionName: string, args: any[]): void {
                console.log("gl." + functionName + "(" + 
                   (window as any).WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
                if (/drawElements/.test(functionName)) {
                    const elementBuffer = VertexBuffer.CurrentBuffer(gl, BufferTarget.ELEMENT_ARRAY_BUFFER);
                    const arrayBuffer = VertexBuffer.CurrentBuffer(gl, BufferTarget.ARRAY_BUFFER);
                    printBufferSize(elementBuffer?.id, "ELEMENT_ARRAY_BUFFER");
                    printBufferSize(arrayBuffer?.id, "ARRAY_BUFFER");
                }
                else if (/bindBuffer/.test(functionName) && args[0] === gl.ELEMENT_ARRAY_BUFFER) {
                    console.log(`   BufferID: ${(args[1] as any)._bg2e_id_}`);
                }
                else if (/bindBuffer/.test(functionName) && args[0] === gl.ARRAY_BUFFER) {
                    console.log(`   BufferID: ${(args[1] as any)._bg2e_id_}`);
                }

            } 

            this._gl = (window as any).WebGLDebugUtils.makeDebugContext(this._gl, throwOnError, logGLCall);
        }

        this._state = new State(this);

        enableExtensions.apply(this, [this.gl]);

        await this.initPresentTextureShader();

        await WebGLMaterialRenderer.InitResources(this);
    }

    get gl(): WebGLRenderingContext { return this._gl; }

    get canvas(): Canvas { return this._canvas; }

    get state(): State {
        return this._state;
    }

    postReshape(width: number, height: number): void {

    }

    postRedisplay(): void {
        
    }

    polyListFactory(plist: PolyList): PolyListRenderer {
        if ((plist as any).renderer) {
            return (plist as any).renderer;
        }
        else{
            const plistRenderer = new WebGLPolyListRenderer(this, plist);
            plistRenderer.init();
            plistRenderer.refresh();
            return plistRenderer;
        }
    }

    materialFactory(material: Material): MaterialRenderer {
        if ((material as any).renderer) {
            return (material as any).renderer;
        }
        else {
            return new WebGLMaterialRenderer(this, material);
        }
    }

    textureFactory(texture: Texture): TextureRenderer {
        if ((texture as any).renderer) {
            return (texture as any).renderer;
        }
        else {
            return new WebGLTextureRenderer(this, texture);
        }
    }

    renderBufferFactory(): RenderBuffer {
        return new WebGLRenderBuffer(this);
    }

    skySphereFactory(): SkySphere {
        return new WebGLSkySphere(this);
    }

    skyCubeFactory(): SkyCube {
        return new WebGLSkyCube(this);
    }

    pipelineFactory(): Pipeline {
        return new WebGLPipeline(this);
    }

    sceneRendererFactory(): WebGLSceneRenderer {
        return new WebGLSceneRenderer(this);
    }

    shadowRendererFactory(): ShadowRenderer {
        return new ShadowRenderer(this);
    }

    get clearColor(): Vec {
        return this.state.clearColor;
    }

    set clearColor(c: Vec | number[]) {
        this.state.clearColor = c;
    }
    
    presentTexture(texture: Texture | null, { clearBuffers = true, shader = null, viewport = null }: { clearBuffers?: boolean; shader?: Shader | null; viewport?: Vec | number[] | null } = {}): void {
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

        this.presentTextureMaterialRenderer.material.albedoTexture = texture;
        this.presentTextureSurfaceRenderer.bindBuffers();
        shader.setup(this.presentTextureSurfaceRenderer,this.presentTextureMaterialRenderer);
        this.presentTextureSurfaceRenderer.draw();

        this.state.viewport = prevViewport;
    }

     // Compatibility function
     supportsFeatures(features: EngineFeatures): boolean {
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

    getMaximumRenderTargets(): number {
        const ext = this.gl.getExtension("WEBGL_draw_buffers");
        if (ext) {
            return this.gl.getParameter(ext.MAX_DRAW_BUFFERS_WEBGL);
        }
        else {
            return 1;
        }
    }
}
