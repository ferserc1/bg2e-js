import Canvas from "../app/Canvas";
import Material from "../base/Material";
import PolyList from "../base/PolyList";
import Texture from "../base/Texture";
import Color from "../base/Color";
import Environment from "./Environment";
import TextureMergerRenderer from "./TextureMergerRenderer";
import PolyListRenderer from "./PolyListRenderer";
import MaterialRenderer from "./MaterialRenderer";
import TextureRenderer from "./TextureRenderer";
import RenderBuffer from "./RenderBuffer";
import PresentTextureShader from "../shaders/PresentTextureShader";
import Vec from "../math/Vec";

export enum EngineFeatures {
    RENDER_TARGET_TEXTURES = 0x1 << 0,
    RENDER_TARGET_FLOAT = 0x1 << 1,
    RENDER_TARGET_DEPTH = 0x1 << 2
}


interface RendererFactory {
    polyList(plist: PolyList): PolyListRenderer;
    material(material: Material): MaterialRenderer;
    texture(texture: Texture): TextureRenderer;
    renderBuffer(): RenderBuffer;
    skySphere(): any;
    skyCube(): any;
    environment(): Environment;
    textureMerger(): TextureMergerRenderer;
    pipeline(): any;
    scene(): any;
    shadowRenderer(): any;
}

export default class Renderer {
    protected _identifier: string;
    protected _frameBuffer: any;
    protected _canvas!: Canvas;
    protected _presentTextureSurface?: PolyListRenderer;
    protected _presentTextureShader?: PresentTextureShader;
    protected _presentTextureMaterial?: MaterialRenderer;

    constructor(identifier: string) {
        this._identifier = identifier;
        this._frameBuffer = null;
    }

    get uniqueId(): string {
        throw new Error("Calling Renderer.uniqueId base implementation.");
    }

    get typeId(): string {
        throw new Error("Calling Renderer.typeId base implementation");
    }

    async init(canvas: Canvas): Promise<void> {
        this._canvas = canvas;
    }

    get canvas(): Canvas {
        return this._canvas;
    }

    get frameBuffer(): any {
        throw new Error("Calling Renderer.frameBuffer base implementation.");
    }

    set viewport(vp: Vec) {
        throw new Error("Calling Renderer.viewport setter base implementation.");
    }

    get viewport(): Vec {
        throw new Error("Calling Renderer.viewport getter base implementation.");
    }

    get presentTextureSurfaceRenderer(): PolyListRenderer {
        if (!this._presentTextureSurface) {
            const plist = new PolyList();
            plist.vertex = [
                -1, -1, 0,
                 1, -1, 0,
                 1,  1, 0,
                -1,  1, 0
            ];
            plist.texCoord0 = [
                0, 0,
                1, 0,
                1, 1,
                0, 1
            ];
            plist.index = [
                0, 1, 2,
                2, 3, 0
            ];
            this._presentTextureSurface = this.factory.polyList(plist);
        }
        return this._presentTextureSurface;
    }

    async initPresentTextureShader(): Promise<PresentTextureShader> {
        if (!this._presentTextureShader) {
            this._presentTextureShader = new PresentTextureShader(this);
            this._presentTextureShader.load();
        }
        return this._presentTextureShader;
    }

    get presentTextureShader(): PresentTextureShader {
        return this._presentTextureShader!;
    }

    get presentTextureMaterialRenderer(): MaterialRenderer {
        if (!this._presentTextureMaterial) {
            this._presentTextureMaterial = this.factory.material(new Material());
        }
        return this._presentTextureMaterial;
    }

    postReshape(width: number, height: number): void {

    }

    postRedisplay(): void {

    }

    polyListFactory(plist: PolyList): PolyListRenderer {
        throw new Error("Calling base implementation of Renderer.polyListFactory()");
    }

    materialFactory(material: Material): MaterialRenderer {
        throw new Error("Calling base implementation of Renderer.materialFactory()");
    }

    textureFactory(texture: Texture): TextureRenderer {
        throw new Error("Calling base implementation of Renderer.textureFactory()");
    }

    renderBufferFactory(): RenderBuffer {
        throw new Error("Calling base implementation of Renderer.renderBufferFactory()");
    }

    skySphereFactory(): any {
        throw new Error("Calling base implementation of Renderer.skySphereFactory()");
    }
    
    skyCubeFactory(): any {
        throw new Error("Calling base implementation of Renderer.skyCubeFactory()");
    }

    environmentFactory(): Environment {
        return new Environment(this);
    }

    textureMergerFactory(): TextureMergerRenderer {
        return new TextureMergerRenderer(this);
    }

    pipelineFactory(): any {
        throw new Error("Calling base implementation of Renderer.pipelineFactory()");
    }

    sceneRendererFactory(): any {
        throw new Error("Calling base implementation of Renderer.sceneRendererFactory()");
    }

    shadowRendererFactory(): any {
        throw new Error("Calling base implementation of Renderer.shadowRendererFactory()");
    }

    get clearColor(): Color {
        throw new Error("Calling base implementation of Renderer.clearColor getter.");
    }

    set clearColor(c: Color) {
        throw new Error("Calling base implementation of Renderer.clearColor setter.");
    }

    get factory(): RendererFactory {
        const renderer = this;
        return {
            polyList(plist: PolyList): PolyListRenderer {
                return renderer.polyListFactory(plist);
            },
            material(material: Material): MaterialRenderer {
                return renderer.materialFactory(material);
            },
            texture(texture: Texture): TextureRenderer {
                return renderer.textureFactory(texture);
            },
            renderBuffer(): RenderBuffer {
                return renderer.renderBufferFactory();
            },
            skySphere(): any {
                return renderer.skySphereFactory();
            },
            skyCube(): any {
                return renderer.skyCubeFactory();
            },
            environment(): Environment {
                return renderer.environmentFactory();
            },
            textureMerger(): TextureMergerRenderer {
                return renderer.textureMergerFactory();
            },
            pipeline(): any {
                return renderer.pipelineFactory();
            },
            scene(): any {
                return renderer.sceneRendererFactory();
            },
            shadowRenderer(): any {
                return renderer.shadowRendererFactory();
            }
        }
    }

    presentTexture(texture: Texture | null, {
        clearBuffers = true,
        shader = null,
        viewport = null
    }: {
        clearBuffers?: boolean;
        shader?: any;
        viewport?: number[] | null;
    } = {}): void {
        
    }

    // Compatibility function
    supportsFeatures(feature: number): boolean {
        return false;
    }

    getMaximumRenderTargets(): number {
        return 1;
    }
}
