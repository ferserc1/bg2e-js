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

export const EngineFeatures: {
    RENDER_TARGET_TEXTURES: number;
    RENDER_TARGET_FLOAT: number;
    RENDER_TARGET_DEPTH: number;
};

interface PresentTextureOptions {
    clearBuffers?: boolean;
    shader?: any;
    viewport?: number[] | null;
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
    constructor(identifier: string);

    get uniqueId(): string;
    get typeId(): string;

    init(canvas: Canvas): Promise<void>;

    get canvas(): Canvas;
    get frameBuffer(): any;

    set viewport(vp: number[]);
    get viewport(): number[];

    get presentTextureSurfaceRenderer(): PolyListRenderer;

    initPresentTextureShader(): Promise<PresentTextureShader>;
    get presentTextureShader(): PresentTextureShader;
    get presentTextureMaterialRenderer(): MaterialRenderer;

    postReshape(width: number, height: number): void;
    postRedisplay(): void;

    polyListFactory(plist: PolyList): PolyListRenderer;
    materialFactory(material: Material): MaterialRenderer;
    textureFactory(texture: Texture): TextureRenderer;
    renderBufferFactory(): RenderBuffer;
    skySphereFactory(): any;
    skyCubeFactory(): any;
    environmentFactory(): Environment;
    textureMergerFactory(): TextureMergerRenderer;
    pipelineFactory(): any;
    sceneRendererFactory(): any;
    shadowRendererFactory(): any;

    get clearColor(): Color;
    set clearColor(c: Color);

    get factory(): RendererFactory;

    presentTexture(texture: Texture, options?: PresentTextureOptions): void;

    supportsFeatures(feature: number): boolean;
    getMaximumRenderTargets(): number;
}
