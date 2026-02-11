import {
    textureTypeLoader,
    colorTypeLoader,
    vectorTypeLoader,
    primitiveTypeLoader
} from "../base/Material";
import Material from "../base/Material";
import Texture from "../base/Texture";
import Vec from "../math/Vec";
import Color from "../base/Color";
import Drawable from "../scene/Drawable";
import Canvas from "../app/Canvas";
import TextureCache from "./TextureCache";

const checkImageData = (texture: Texture | Color | number | null): Promise<void> => {
    return texture instanceof Texture ? texture.loadImageData() : Promise.resolve();
}

const loadTexture = async (canvas: Canvas, fileName: string, relativePath: string): Promise<Texture> => {
    const texture = new Texture(canvas);
    texture.fileName = relativePath + fileName;
    await texture.loadImageData();
    return texture;
}

export interface MaterialModifierData {
    class?: string;
    alphaCutoff?: number;
    castShadows?: boolean;
    albedo?: [number, number, number, number];
    albedoTexture?: string;
    albedoScale?: [number, number];
    normalTexture?: string;
    normalScale?: [number, number];
    metalness?: number;
    metalnessTexture?: string;
    metalnessChannel?: number;
    metalnessScale?: [number, number];
    roughness?: number;
    roughnessTexture?: string;
    roughnessChannel?: number;
    roughnessScale?: [number, number];
    fresnelTint?: [number, number, number, number];
    sheenIntensity?: number;
    sheenColor?: [number, number, number, number];
    lightEmission?: number;
    lightEmissionTexture?: string;
    lightEmissionChannel?: number;
    lightEmissionScale?: [number, number];
    isTransparent?: boolean;
    unlit?: boolean;

    // Deprecated properties
    diffuse?: string | [number, number, number, number];
    diffuseScale?: [number, number];
    normal?: string;
    fresnel?: [number, number, number, number];
    metallic?: string | number;
    metallicChannel?: number;
    metallicScale?: [number, number];
}

// TODO: Update all material properties (difuse -> albedo, etc)
export default class MaterialModifier {
    private _alphaCutoff?: number;
    private _castShadows?: boolean;
    private _albedo?: [number, number, number, number];
    private _albedoTexture?: string;
    private _albedoScale?: [number, number];
    private _normalTexture?: string;
    private _normalScale?: [number, number];
    private _metalness?: number;
    private _metalnessTexture?: string;
    private _metalnessChannel?: number;
    private _metalnessScale?: [number, number];
    private _roughness?: number;
    private _roughnessTexture?: string;
    private _roughnessChannel?: number;
    private _roughnessScale?: [number, number];
    private _fresnelTint?: [number, number, number, number];
    private _sheenIntensity?: number;
    private _sheenColor?: [number, number, number, number];
    private _lightEmission?: [number, number, number, number];
    private _lightEmissionTexture?: string;
    private _lightEmissionChannel?: number;
    private _lightEmissionScale?: [number, number];
    private _isTransparent?: boolean;
    private _unlit?: boolean;

    private _texturesPath: string = "";

    constructor(jsonData: MaterialModifierData | null = null, texturesPath: string = "") {
        this._texturesPath = texturesPath;
        if (jsonData) {
            if (jsonData['class'] && jsonData['class'] !== "PBRMaterial") {
                console.warn(`Could not apply material modifier because of class "${jsonData['class']}". Check the valid material types in bg2 engine v2`);
                return;
            }
            if (jsonData.alphaCutoff !== undefined) {
                this.alphaCutoff = jsonData.alphaCutoff;
            }

            if (jsonData.castShadows !== undefined) {
                this.castShadows = jsonData.castShadows;
            }

            if (jsonData.diffuse !== undefined && typeof jsonData.diffuse === "string") {
                this.albedoTexture = jsonData.diffuse;
            }
            else if (jsonData.diffuse !== undefined && Array.isArray(jsonData.diffuse)) {
                this.albedo = jsonData.diffuse;
            }

            if (jsonData.albedoTexture !== undefined) {
                this.albedoTexture = jsonData.albedoTexture;
            }

            if (jsonData.albedoScale !== undefined) {
                this.albedoScale = jsonData.albedoScale;
            }

            if (jsonData.albedo !== undefined) {
                this.albedo = jsonData.albedo;
            }

            if (jsonData.diffuseScale !== undefined) {
                this.albedoScale = jsonData.diffuseScale;
            }

            if (jsonData.normal !== undefined) {
                this.normalTexture = jsonData.normal;
            }

            if (jsonData.normalTexture !== undefined) {
                this.normalTexture = jsonData.normalTexture;
            }

            if (jsonData.normalScale !== undefined) {
                this.normalScale = jsonData.normalScale;
            }

            if (jsonData.normalScale !== undefined) {
                this.normalScale = jsonData.normalScale;
            }

            if (jsonData.metallic !== undefined && typeof jsonData.metallic === "string") {
                this.metalnessTexture
                 = jsonData.metallic;
            }

            if (jsonData.metallic !== undefined && typeof jsonData.metallic === "number") {
                this.metalness = jsonData.metallic;
            }

            if (jsonData.metallicChannel !== undefined) {
                this.metalnessChannel = jsonData.metallicChannel;
            }

            if (jsonData.metallicScale !== undefined) {
                this.metalnessScale = jsonData.metallicScale;
            }

            if (jsonData.metalnessTexture !== undefined) {
                this.metalnessTexture = jsonData.metalnessTexture;
            }

            if (jsonData.metalness !== undefined) {
                this.metalness = jsonData.metalness;
            }

            if (jsonData.metalnessScale !== undefined) {
                this.metalnessScale = jsonData.metalnessScale;
            }

            if (jsonData.metalnessChannel !== undefined) {
                this.metalnessChannel = jsonData.metalnessChannel;
            }

            if (jsonData.roughness !== undefined && typeof jsonData.roughness === "string") {
                this.roughnessTexture = jsonData.roughness;
            }
            else if (jsonData.roughness !== undefined && typeof jsonData.roughness === "number") {
                this.roughness = jsonData.roughness;
            }

            if (jsonData.roughnessTexture !== undefined) {
                this.roughnessTexture = jsonData.roughnessTexture;
            }

            if (jsonData.roughnessChannel !== undefined) {
                this.roughnessChannel = jsonData.roughnessChannel;
            }

            if (jsonData.roughnessScale !== undefined) {
                this.roughnessScale = jsonData.roughnessScale;
            }


            if (jsonData.fresnel !== undefined) {
                this.fresnelTint = jsonData.fresnel;
            }

            if (jsonData.fresnelTint !== undefined) {
                this.fresnelTint = jsonData.fresnelTint;
            }

            if (jsonData.sheenIntensity !== undefined) {
                this.sheenIntensity = jsonData.sheenIntensity;
            }

            if (jsonData.sheenColor !== undefined) {
                this.sheenColor = jsonData.sheenColor;
            }

            if (jsonData.lightEmission !== undefined) {
                this.lightEmission = jsonData.lightEmission;
            }

            if (jsonData.lightEmissionTexture !== undefined) {
                this.lightEmissionTexture = jsonData.lightEmissionTexture;
            }
            
            if (jsonData.lightEmissionChannel !== undefined) {
                this.lightEmissionChannel = jsonData.lightEmissionChannel;
            }
            
            if (jsonData.lightEmissionScale !== undefined) {
                this.lightEmissionScale = jsonData.lightEmissionScale;
            }
            
            if (jsonData.isTransparent !== undefined) {
                this.isTransparent = jsonData.isTransparent;
            }

            if (jsonData.unlit !== undefined) {
                this.unlit = jsonData.unlit;
            }

        }
    }

    get alphaCutoff(): number | undefined { return this._alphaCutoff; }
    set alphaCutoff(v: number | undefined) { this._alphaCutoff = v; }

    get castShadows(): boolean | undefined { return this._castShadows; }
    set castShadows(v: boolean | undefined) { this._castShadows = v; }

    get albedo(): [number, number, number, number] | undefined { return this._albedo; }
    set albedo(v: [number, number, number, number] | undefined) { this._albedo = v; }

    get albedoTexture(): string | undefined { return this._albedoTexture; }
    set albedoTexture(v: string | undefined) { this._albedoTexture = v; }

    get albedoScale(): [number, number] | undefined { return this._albedoScale; }
    set albedoScale(v: [number, number] | undefined) { this._albedoScale = v; }

    get normalTexture(): string | undefined { return this._normalTexture; }
    set normalTexture(v: string | undefined) { this._normalTexture = v; }

    get normalScale(): [number, number] | undefined { return this._normalScale; }
    set normalScale(v: [number, number] | undefined) { this._normalScale = v; }

    get metalness(): number | undefined { return this._metalness; }
    set metalness(v: number | undefined) { this._metalness = v; }

    get metalnessTexture(): string | undefined { return this._metalnessTexture; }
    set metalnessTexture(v: string | undefined) { this._metalnessTexture = v; }

    get metalnessChannel(): number | undefined { return this._metalnessChannel; }
    set metalnessChannel(v: number | undefined) { this._metalnessChannel = v; }

    get metalnessScale(): [number, number] | undefined { return this._metalnessScale; }
    set metalnessScale(v: [number, number] | undefined) { this._metalnessScale = v; }

    get roughness(): number | undefined { return this._roughness; }
    set roughness(v: number | undefined) { this._roughness = v; }

    get roughnessTexture(): string | undefined { return this._roughnessTexture; }
    set roughnessTexture(v: string | undefined) { this._roughnessTexture = v; }

    get roughnessChannel(): number | undefined { return this._roughnessChannel; }
    set roughnessChannel(v: number | undefined) { this._roughnessChannel = v; }

    get roughnessScale(): [number, number] | undefined { return this._roughnessScale; }
    set roughnessScale(v: [number, number] | undefined) { this._roughnessScale = v; }

    get fresnelTint(): [number, number, number, number] | undefined { return this._fresnelTint; }
    set fresnelTint(v: [number, number, number, number] | undefined) { this._fresnelTint = v; }

    get sheenIntensity(): number | undefined { return this._sheenIntensity; }
    set sheenIntensity(v: number | undefined) { this._sheenIntensity = v; }

    get sheenColor(): [number, number, number, number] | undefined { return this._sheenColor; }
    set sheenColor(v: [number, number, number, number] | undefined) { this._sheenColor = v; }
    
    get isTransparent(): boolean | undefined { return this._isTransparent; }
    set isTransparent(v: boolean | undefined) { this._isTransparent = v; }

    get lightEmission(): any { return this._lightEmission; }
    set lightEmission(v: any) { this._lightEmission = v; }

    get lightEmissionTexture(): string | undefined { return this._lightEmissionTexture; }
    set lightEmissionTexture(v: string | undefined) { this._lightEmissionTexture = v; }

    get lightEmissionChannel(): number | undefined { return this._lightEmissionChannel; }
    set lightEmissionChannel(v: number | undefined) { this._lightEmissionChannel = v; }

    get lightEmissionScale(): any { return this._lightEmissionScale; }
    set lightEmissionScale(v: any) { this._lightEmissionScale = v; }

    get unlit(): boolean | undefined { return this._unlit; }
    set unlit(v: boolean | undefined) { this._unlit = v; }

    get texturesPath(): string { return this._texturesPath; }
    set texturesPath(v: string) { this._texturesPath = v; }

    async applyDrawable(canvas: Canvas, drawable: Drawable, { groupName, groupRE } : { groupName?: string, groupRE?: RegExp } = {}): Promise<void> {
        drawable.items.forEach(item => {
            if ( (groupName && item.polyList.groupName === groupName) ||
                (groupRE && item.polyList.groupName && groupRE.test(item.polyList.groupName)) ||
                (!groupName && !groupRE))
            {
                this.apply(canvas, item.material);
            }
        })
    }

    async apply(canvas: Canvas, material: Material): Promise<void> {
        const relativePath = this._texturesPath;
        const promises: Promise<void>[] = [];

        if (this.alphaCutoff !== undefined) {
            material.alphaCutoff = this.alphaCutoff;
        }

        if (this.castShadows !== undefined) {
            material.castShadows = this.castShadows;
        }

        if (this.albedo !== undefined) {
            material.albedo = new Color(this.albedo);
        }

        if (this.albedoTexture !== undefined) {
            promises.push(new Promise<void>(async (resolve) => {
                material.albedoTexture = await loadTexture(canvas, this.albedoTexture!, relativePath);
                resolve();
            }));
        }

        if (this.albedoScale !== undefined) {
            material.albedoScale = new Vec(this.albedoScale);
        }

        if (this.normalTexture !== undefined) {
            promises.push(new Promise<void>(async (resolve) => {
                material.normalTexture = await loadTexture(canvas, this.normalTexture!, relativePath);
                resolve();
            }));
        }

        if (this.normalScale !== undefined) {
            material.normalScale = new Vec(this.normalScale);
        }

        if (this.metalness !== undefined) {
            material.metalness = this.metalness;
        }

        if (this.metalnessTexture !== undefined) {
            promises.push(new Promise<void>(async (resolve) => {
                material.metalnessTexture = await loadTexture(canvas, this.metalnessTexture!, relativePath);
                resolve();
            }));
        }

        if (this.metalnessChannel !== undefined) {
            material.metalnessChannel = this.metalnessChannel;
        }

        if (this.metalnessScale !== undefined) {
            material.metalnessScale = new Vec(this.metalnessScale);
        }

        if (this.roughness !== undefined) {
            material.roughness = this.roughness;
        }

        if (this.roughnessTexture !== undefined) {
            promises.push(new Promise<void>(async (resolve) => {
                material.roughnessTexture = await loadTexture(canvas, this.roughnessTexture!, relativePath);
                resolve();
            }));
        }

        if (this.roughnessChannel !== undefined) {
            material.roughnessChannel = this.roughnessChannel;
        }

        if (this.roughnessScale !== undefined) {
            material.roughnessScale = new Vec(this.roughnessScale);
        }

        if (this.fresnelTint !== undefined) {
            material.fresnelTint = new Color(this.fresnelTint);
        }

        if (this.sheenIntensity !== undefined) {
            material.sheenIntensity = this.sheenIntensity;
        }

        if (this.sheenColor !== undefined) {
            material.sheenColor = new Color(this.sheenColor);
        }

        if (this.isTransparent !== undefined) {
            material.isTransparent = this.isTransparent;
        }

        if (this.lightEmission !== undefined) {
            material.lightEmission = this.lightEmission;
        }

        if (this.lightEmissionTexture !== undefined) {
            promises.push(new Promise<void>(async (resolve) => {
                material.lightEmissionTexture = await loadTexture(canvas, this.lightEmissionTexture!, relativePath);
                resolve();
            }));
        }

        if (this.lightEmissionChannel !== undefined) {
            material.lightEmissionChannel = this.lightEmissionChannel;
        }

        if (this.lightEmissionScale !== undefined) {
            material.lightEmissionScale = this.lightEmissionScale;
        }

        if (this.unlit !== undefined) {
            material.unlit = this.unlit;
        }

        await Promise.allSettled(promises);
    }

}
