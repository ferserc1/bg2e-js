import Drawable from './Drawable';
import Text from '../base/Text';
import Material from '../base/Material';
import PolyList from '../base/PolyList';
import Texture, { TextureFilter, TextureWrap } from '../base/Texture';
import Mat4 from '../math/Mat4';
import type Loader from '../db/Loader';
import type { ResolvedTextFont } from './TextResources';
import type { TextRasterization } from '../base/TextFont';
export default class TextComponent extends Drawable {
    readonly text = new Text();
    readonly material = new Material();
    private mask = new Texture();
    private quad = new PolyList();
    private manualSize: [number, number] = [2, 1];
    private _preserveAspect = true;
    private _pivot: [number, number] = [.5, .5];
    private realization = '';
    private geometry = '';
    private resolved?: ResolvedTextFont;
    private coverage = false;
    private materialVisible = true;
    private _rasterization?: TextRasterization;
    constructor() {
        super('', 'Text');
        this.material.alphaCutoff = .1;
        this.mask.minFilter = this.mask.magFilter = TextureFilter.LINEAR;
        this.mask.wrapModeX = this.mask.wrapModeY = TextureWrap.CLAMP;
        this.mask.linearData = true;
        this.material.albedoTexture = this.mask;
        this.quad.enableCullFace = false;
        this.quad.normal = [0,0,1, 0,0,1, 0,0,1, 0,0,1];
        this.quad.texCoord0 = this.quad.texCoord1 = [0,0, 1,0, 1,1, 0,1];
        this.quad.index = [0,2,1, 0,3,2];
        this.addPolyList(this.quad, this.material);
    }
    get rasterization(): TextRasterization | undefined { return this._rasterization; }
    get canRender(): boolean { return this.coverage; }
    get authoredSize(): [number, number] { return [...this.manualSize]; }
    get size(): [number, number] {
        const p = this.text.parameters.paragraphSize;
        let width = this.preserveAspect ? this.manualSize[1] * p.width / p.height : this.manualSize[0];
        let height = this.manualSize[1];
        const scale = Math.min(1, 1e6 / Math.max(width, height));
        return [width * scale, height * scale];
    }
    setSize(size: [number, number]): void { this.manualSize = size.map(v => Number.isFinite(v) && v > 0 ? Math.min(1e6, Math.max(.001, v)) : 1) as [number, number]; this._preserveAspect = false; }
    setHeight(height: number): void { this.manualSize[1] = Number.isFinite(height) && height > 0 ? Math.min(1e6, Math.max(.001, height)) : 1; }
    get preserveAspect(): boolean { return this._preserveAspect; }
    set preserveAspect(value: boolean) { this._preserveAspect = value; }
    get pivot(): [number, number] { return [...this._pivot]; }
    set pivot(value: [number, number]) { this._pivot = value.map(v => Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : .5) as [number, number]; }
    retryResources(): void { this.realization = ''; }
    prepareResources(font: ResolvedTextFont | undefined, version = 0): void {
        const key = `${this.text.revision}:${version}:${font?.faceIndex}`;
        const geometry = JSON.stringify([this.size, this.pivot]);
        let rebind = false;
        if (geometry !== this.geometry) {
            const [w,h] = this.size, [px,py] = this.pivot;
            this.quad.vertex = [-px*w,(1-py)*h,0, (1-px)*w,(1-py)*h,0, (1-px)*w,-py*h,0, -px*w,-py*h,0];
            if (this.quad.renderer) { this.quad.renderer.destroy(); this.quad.renderer.refresh(); }
            this.geometry = geometry; rebind = true;
        }
        if (key !== this.realization || font?.font !== this.resolved?.font) {
            this.realization = key; this.resolved = font; this.coverage = false; this._rasterization = undefined;
            try {
                if (font && !font.font.disposed) {
                    const raster = font.font.rasterize(this.text.parameters, font.faceIndex);
                    this._rasterization = raster;
                    if (raster.rgba.length === raster.width * raster.height * 4 && raster.width > 0 && raster.height > 0) {
                        this.mask.setByteImageData(raster.width, raster.height, raster.rgba);
                        this.coverage = raster.renderable && raster.rgba.some((v, i) => i % 4 === 3 && v > 0);
                    }
                }
            } catch (error) { console.warn('Text rasterization unavailable', error); }
        }
        this.quad.visible = this.quad.visibleToShadows = this.coverage;
        const renderer = this.renderer ?? this.node?.bindedRenderer;
        if (renderer && (rebind || !this.renderer)) super.bindRenderer(renderer);
    }
    draw(queue: any, modelMatrix: Mat4): void { if (this.coverage && this.materialVisible) super.draw(queue, modelMatrix); }
    clone(): TextComponent {
        const result = new TextComponent();
        result.text.setParameters(this.text.parameters);
        result.manualSize = this.authoredSize; result.preserveAspect = this.preserveAspect; result.pivot = this.pivot;
        result.material.assign(this.material); result.material.albedoTexture = result.mask;
        result.materialVisible = this.materialVisible; result.quad.enableCullFace = this.quad.enableCullFace;
        result.mask.magFilter = this.mask.magFilter; result.mask.minFilter = this.mask.minFilter;
        result.mask.wrapModeX = this.mask.wrapModeX; result.mask.wrapModeY = this.mask.wrapModeY;
        return result;
    }
    async deserialize(data: any, loader: Loader): Promise<void> {
        if (data.text) this.text.setParameters(data.text);
        if (Array.isArray(data.size) && data.size.length === 2) this.setSize(data.size);
        this.preserveAspect = typeof data.preserveAspect === 'boolean' ? data.preserveAspect : true;
        if (Array.isArray(data.pivot) && data.pivot.length === 2) this.pivot = data.pivot;
        if (data.material) {
            const { albedoTexture: _source, ...attributes } = data.material;
            await this.material.deserialize(attributes, loader.currentPath, loader.canvas);
            this.material.albedoTexture = this.mask;
            this.material.unlit = data.material.isUnlit ?? data.material.unlit ?? false;
            this.material.alphaCutoff = data.material.alphaCutoff ?? .1;
            this.materialVisible = data.material.visible ?? true;
            this.quad.enableCullFace = typeof data.material.doubleSided === 'boolean' ? !data.material.doubleSided : data.material.cullFace ?? false;
            const settings = data.material.albedoTextureSettings;
            if (settings) {
                if (settings.mag === 0 || settings.mag === 1) this.mask.magFilter = settings.mag ? TextureFilter.NEAREST : TextureFilter.LINEAR;
                if (settings.min === 0 || settings.min === 1) this.mask.minFilter = settings.min ? TextureFilter.NEAREST : TextureFilter.LINEAR;
                const modes = [TextureWrap.REPEAT, TextureWrap.MIRRORED_REPEAT, TextureWrap.CLAMP, TextureWrap.CLAMP];
                if (Number.isInteger(settings.u) && settings.u >= 0 && settings.u <= 3) this.mask.wrapModeX = modes[settings.u];
                if (Number.isInteger(settings.v) && settings.v >= 0 && settings.v <= 3) this.mask.wrapModeY = modes[settings.v];
            }
        }
    }
    async serialize(data: any): Promise<void> {
        data.type = 'Text'; data.text = this.text.parameters;
        data.size = this.authoredSize; data.preserveAspect = this.preserveAspect; data.pivot = this.pivot;
        data.material = {}; await this.material.serialize(data.material);
        delete data.material.albedoTexture;
        data.material.doubleSided = !this.quad.enableCullFace;
        data.material.isUnlit = this.material.unlit;
        data.material.alphaCutoff = this.material.alphaCutoff;
        data.material.isTransparent = this.material.isTransparent;
        data.material.visible = this.materialVisible;
        const mode = (wrap: TextureWrap) => wrap === TextureWrap.REPEAT ? 0 : wrap === TextureWrap.MIRRORED_REPEAT ? 1 : 2;
        data.material.albedoTextureSettings = {
            mag: this.mask.magFilter === TextureFilter.NEAREST ? 1 : 0,
            min: this.mask.minFilter === TextureFilter.NEAREST ? 1 : 0,
            u: mode(this.mask.wrapModeX), v: mode(this.mask.wrapModeY), w: 2, color: 0
        };
    }
    destroy(): void { this.quad.destroy(); this.material.destroy(); this.mask.destroy(); this.coverage = false; this.retryResources(); }
}
