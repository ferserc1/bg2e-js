
import Vec from '../math/Vec';
import Color from './Color';
import Texture, { TextureDataType, TextureFilter, TextureWrap } from './Texture';
import Canvas from '../app/Canvas';
import TextureCache from '../tools/TextureCache';
import { NumericArray } from '../math/constants';

export enum MaterialType {
    PBR = "pbr"
}

interface TypeLoader {
    serialize: (attName: string, obj: any) => any;
    deserialize: (attName: string, obj: any, relativePath?: string, canvas?: Canvas | null) => any;
}

export const textureTypeLoader: TypeLoader = {
    serialize: (attName: string, obj: any) => {
        if (!obj) {
            return null;
        }
        if (obj instanceof Texture) {
            return obj.fileName;
        }
        else {
            throw new Error(`Invalid parameter found in material serialization. The required parameter type is Texture`);
        }
    },

    deserialize: (attName: string, obj: any, relativePath: string = "", canvas: Canvas | null = null) => {
        if (!obj) {
            return null;
        }
        else if (attName === "ambientOcclussion" && typeof(obj) === "number") {
            // Compatibility with v1.4 where ambient occlussion could be a float value
            return null;
        }
        else if (typeof(obj) === "string") {
            const texturePath = relativePath + obj;
            const textureCache = TextureCache.Get(canvas);
            if (textureCache.findTexture(texturePath)) {
                console.debug(`Texture '${ texturePath }' already loaded. Reusing texture.`);
                return textureCache.getTexture(texturePath);
            }
            else {
                console.log(`Texture not found in cache. Loading texture '${ texturePath }'`);
                const tex = new Texture(canvas);
                tex.fileName = relativePath + obj;
                tex.dataType = TextureDataType.IMAGE;
                tex.minFilter = TextureFilter.LINEAR_MIPMAP_LINEAR;
                tex.magFilter = TextureFilter.LINEAR;
                tex.wrapModeX = TextureWrap.REPEAT;
                tex.wrapModeY = TextureWrap.REPEAT;
                textureCache.registerTexture(tex);
                return tex;
            }
        }
        else {
            throw new Error(`Invalid parameter found in material deserialization. The required parameter type is string (file path)`);
        }
    }
}

export const colorTypeLoader: TypeLoader = {
    serialize: (attName: string, obj: any) => {
        if (!obj) {
            return null;
        }

        if (obj instanceof Color) {
            return obj;
        }
        else  {
            throw new Error(`Invalid parameter found in material serialization. The required parameter type is Color`);
        }
    },

    deserialize: (attName: string, obj: any) => {
        if (!obj) {
            return null;
        }
        else if ((Array.isArray(obj) || obj instanceof NumericArray) &&
            (obj.length === 3 || obj.length === 4)
        ) {
            if (obj.length === 3) {
                return new Color([obj[0], obj[1], obj[2], 1]);
            }
            else if (obj.length === 4) {
                return new Color([obj[0], obj[1], obj[2], obj[3]]);
            }
        }
        else {
            throw new Error(`Invalid parameter found in material deserialization. The required parameter type is array with 3 or 4 elements`);
        }
    }
}

export const vectorTypeLoader: TypeLoader = {
    serialize: (attName: string, obj: any) => {
        if (!obj) {
            return null;
        }

        if (obj instanceof Vec) {
            return obj;
        }
        else {
            throw new Error(`Invalid parameter found in material serialization. The required parameter type is Vec`);
        }
    },

    deserialize: (attName: string, obj: any) => {
        if (!obj) {
            return null;
        }
        else if (obj.length >= 2 && obj.length <= 4) {
            return new Vec(obj);
        }
        // Retrocompatibility with v1.4
        else if (obj._v && obj._v.length >= 2 && obj._v.length <= 4) {
            return new Vec(obj._v);
        }
        else {
            throw new Error(`Invalid parameter found in material deserialization. The required parameter type is array with 2, 3 or 4 elements`);
        }
    }
}

export const primitiveTypeLoader: TypeLoader = {
    serialize: (attName: string, obj: any) => {
        if (!obj) {
            return null;
        }

        return obj;
    },

    deserialize: (attName: string, obj: any) => {
        return obj;
    }
}

interface MaterialAttribute {
    loader: TypeLoader;
}

export const MaterialAttributeNames: { [key: string]: MaterialAttribute } = {
    type: { loader: primitiveTypeLoader },
    alphaCutoff: { loader: primitiveTypeLoader },
    isTransparent: { loader: primitiveTypeLoader },
    albedo: { loader: colorTypeLoader },
    albedoTexture: { loader: textureTypeLoader },
    albedoScale: { loader: vectorTypeLoader },
    albedoUV: { loader: primitiveTypeLoader },
    normalTexture: { loader: textureTypeLoader },
    normalScale: { loader: vectorTypeLoader },
    normalUV: { loader: primitiveTypeLoader },
    metalness: { loader: primitiveTypeLoader },
    metalnessTexture: { loader: textureTypeLoader },
    metalnessChannel: { loader: primitiveTypeLoader },
    metalnessScale: { loader: vectorTypeLoader },
    metalnessUV: { loader: primitiveTypeLoader },
    roughness: { loader: primitiveTypeLoader },
    roughnessTexture: { loader: textureTypeLoader },
    roughnessChannel: { loader: primitiveTypeLoader },
    roughnessScale: { loader: vectorTypeLoader },
    roughnessUV: { loader: primitiveTypeLoader },
    fresnelTint: { loader: colorTypeLoader },
    sheenIntensity: { loader: primitiveTypeLoader },
    sheenColor: { loader: colorTypeLoader },
    lightEmission: { loader: colorTypeLoader },
    lightEmissionTexture: { loader: textureTypeLoader },
    lightEmissionChannel: { loader: primitiveTypeLoader },
    lightEmissionScale: { loader: vectorTypeLoader },
    lightEmissionUV: { loader: primitiveTypeLoader },
    ambientOcclussion: { loader: textureTypeLoader },
    ambientOcclussionChannel: { loader: primitiveTypeLoader },
    ambientOcclussionUV: { loader: primitiveTypeLoader },
    heightTexture: { loader: textureTypeLoader },
    heightChannel: { loader: primitiveTypeLoader },
    heightScale: { loader: vectorTypeLoader },
    heightUV: { loader: primitiveTypeLoader },
    heightIntensity: { loader: primitiveTypeLoader },
    castShadows: { loader: primitiveTypeLoader },
    unlit: { loader: primitiveTypeLoader }
};

export const assertTexture = (v: any, name: string): void => {
    if (!(v instanceof Texture)) {
        throw new Error(`Invalid parameter setting '${ name }' material attribute. The required parameter type is Texture`);
    }
}

export const assertColor = (v: any, name: string): void => {
    if (!(v instanceof Color)) {
        throw new Error(`Invalid parameter setting '${ name }' material attribute. The required parameter type is Color`);
    }
}

export const assertScale = (v: any, name: string): void => {
    if (!(v instanceof Vec) || v.length != 2) {
        throw new Error(`Invalid parameter setting '${ name }' material attribute. The required parameter type is Vec with two elements.`);
    }
}

// Clone the `obj` parameter if it is
//  - Vec
//  - Color
//  - Texture
// Returns the same parameter if not
export const cloneObject = (obj: any): any => {
    if (obj instanceof Color) {
        return new Color(obj);
    }
    else if (obj instanceof Vec) {
        return new Vec(obj);
    }
    else if (obj instanceof Texture) {
        return obj.clone();
    }
    else {
        return obj;
    }
}

export default class Material {
    static async Deserialize(sceneData: any, relativePath: string = "", canvas: Canvas | null = null): Promise<Material> {
        const result = new Material(canvas);
        await result.deserialize(sceneData, relativePath, canvas);
        return result;
    }

    private _canvas: Canvas | null;
    private _type: string;
    private _renderer: any;
    private _alphaCutoff: number;
    private _isTransparent: boolean;
    private _albedo: Color;
    private _albedoTexture: Texture | null;
    private _albedoScale: Vec;
    private _albedoUV: number;
    private _normalTexture: Texture | null;
    private _normalScale: Vec;
    private _normalUV: number;
    private _normalChannel: number;
    private _metalness: number;
    private _metalnessTexture: Texture | null;
    private _metalnessChannel: number;
    private _metalnessScale: Vec;
    private _metalnessUV: number;
    private _roughness: number;
    private _roughnessTexture: Texture | null;
    private _roughnessChannel: number;
    private _roughnessScale: Vec;
    private _roughnessUV: number;
    private _fresnelTint: Color;
    private _sheenIntensity: number;
    private _sheenColor: Color;
    private _lightEmission: Color | number;
    private _lightEmissionTexture: Texture | null;
    private _lightEmissionChannel: number;
    private _lightEmissionScale: Vec;
    private _lightEmissionUV: number;
    private _ambientOcclussion: Texture | null;
    private _ambientOcclussionChannel: number;
    private _ambientOcclussionUV: number;
    private _heightTexture: Texture | null;
    private _heightChannel: number;
    private _heightScale: Vec;
    private _heightUV: number;
    private _heightIntensity: number;
    private _castShadows: boolean;
    private _unlit: boolean;
    private _dirty: boolean;

    constructor(canvas: Canvas | null = null) {
        this._canvas = canvas || Canvas.FirstCanvas();
        this._type = MaterialType.PBR;
        this._renderer = null;

        this._alphaCutoff = 0.5;
        this._isTransparent = false;
        this._albedo = Color.White();
        this._albedoTexture = null;
        this._albedoScale = new Vec(1, 1);
        this._albedoUV = 0;
        this._normalTexture = null;
        this._normalScale = new Vec(1, 1);
        this._normalUV = 0;
        this._normalChannel = 0;
        this._metalness = 0;
        this._metalnessTexture = null;
        this._metalnessChannel = 0;
        this._metalnessScale = new Vec(1, 1);
        this._metalnessUV = 0;
        this._roughness = 1;
        this._roughnessTexture = null;
        this._roughnessChannel = 0;
        this._roughnessScale = new Vec(1, 1);
        this._roughnessUV = 0;
        this._fresnelTint = Color.White();
        this._sheenIntensity = 0.0;
        this._sheenColor = Color.White();
        this._lightEmission = 0;
        this._lightEmissionTexture = null;
        this._lightEmissionChannel = 0;
        this._lightEmissionScale = new Vec(1, 1);
        this._lightEmissionUV = 0;
        this._ambientOcclussion = null;
        this._ambientOcclussionChannel = 0;
        this._ambientOcclussionUV = 1;
        this._heightTexture = null;
        this._heightChannel = 0;
        this._heightScale = new Vec(1, 1);
        this._heightUV = 0;
        this._heightIntensity = 1.0;
        this._castShadows = true;
        this._unlit = false;

        this._dirty = true;
    }

    get canvas(): Canvas | null {
        return this._canvas;
    }

    get renderer(): any {
        return this._renderer;
    }

    get dirty(): boolean {
        return this._dirty;
    }

    set dirty(d: boolean) {
        this._dirty = d;
    }

    clone(): Material {
        const result = new Material();
        result.assign(this);
        return result;
    }

    assign(other: Material): void {
        this._type = other._type;
        this._alphaCutoff = other._alphaCutoff;;
        this._isTransparent = other._isTransparent;
        this._albedo = cloneObject(other._albedo);
        this._albedoTexture = cloneObject(other._albedoTexture);
        this._albedoScale = cloneObject(other._albedoScale);
        this._albedoUV = other._albedoUV;
        this._normalTexture = cloneObject(other._normalTexture);
        this._normalScale = cloneObject(other._normalScale);
        this._normalUV = other._normalUV;
        this._metalness = other._metalness;
        this._metalnessTexture = cloneObject(other._metalnessTexture);
        this._metalnessChannel = other._metalnessChannel;
        this._metalnessScale = cloneObject(other._metalnessScale);
        this._metalnessUV = other._metalnessUV;
        this._roughness = other._roughness;
        this._roughnessTexture = cloneObject(other._roughnessTexture);
        this._roughnessChannel = other._roughnessChannel;
        this._roughnessScale = cloneObject(other._roughnessScale);
        this._roughnessUV = other._roughnessUV;
        this._fresnelTint = cloneObject(other._fresnelTint);
        this._sheenIntensity = other._sheenIntensity;
        this._sheenColor = cloneObject(other._sheenColor);
        this._lightEmission = other._lightEmission;
        this._lightEmissionTexture = cloneObject(other._lightEmissionTexture);
        this._lightEmissionChannel = other._lightEmissionChannel;
        this._lightEmissionScale = cloneObject(other._lightEmissionScale);
        this._lightEmissionUV = other._lightEmissionUV;
        this._ambientOcclussion = other._ambientOcclussion;
        this._ambientOcclussionChannel = other._ambientOcclussionChannel;
        this._ambientOcclussionUV = other._ambientOcclussionUV;
        this._heightTexture = cloneObject(other._heightTexture);
        this._heightChannel = other._heightChannel;
        this._heightScale = cloneObject(other._heightScale);
        this._heightUV = other._heightUV;
        this._heightIntensity = other._heightIntensity;
        this._castShadows = other._castShadows;
        this._unlit = other._unlit;

        this._dirty = true;
    }

    get type(): string { return this._type; }
    set type(v: string) {
        // Compatibility with v1.4
        if (v === "PBRMaterial") {
            v = "pbr";
        }
        this._type = v;
        this._dirty = true;
    }

    get albedo(): Color { return this._albedo; }
    set albedo(v: Color) {
        this._albedo = v;
        this._dirty = true;
    }
    get albedoTexture(): Texture | null { return this._albedoTexture; }
    set albedoTexture(v: Texture | null) {
        v && assertTexture(v, "albedoTexture");
        if (this._albedoTexture instanceof Texture) {
            this._albedoTexture.decReferences();
        }
        this._albedoTexture = v;
        if (this._albedoTexture instanceof Texture) {
            this._albedoTexture.incReferences();
        }
        this._dirty = true;
    }

    get albedoScale(): Vec { return this._albedoScale; }
    set albedoScale(v: Vec) { assertScale(v, "albedoScale"); this._albedoScale = new Vec(v); this._dirty = true; }
    get albedoUV(): number { return this._albedoUV; }
    set albedoUV(v: number) { this._albedoUV = v; this._dirty = true; }
    get alphaCutoff(): number { return this._alphaCutoff; }
    set alphaCutoff(v: number) { this._alphaCutoff = v; this._dirty = true; }
    get isTransparent(): boolean { return this._isTransparent; }
    set isTransparent(v: boolean) { this._isTransparent = v; this._dirty = true; }

    get normalTexture(): Texture | null { return this._normalTexture; }
    set normalTexture(v: Texture | null) {
        v && assertTexture(v, "normalTexture");
        if (this._normalTexture instanceof Texture) {
            this._normalTexture.decReferences();
        }
        this._normalTexture = v;
        if (this._normalTexture instanceof Texture) {
            this._normalTexture.incReferences();
        }
        this._dirty = true;
    }

    get normalChannel(): number { return this._normalChannel; }
    set normalChannel(v: number) { this._normalChannel = v; this._dirty = true; }
    get normalScale(): Vec { return this._normalScale; }
    set normalScale(v: Vec) { assertScale(v, "normalScale"); this._normalScale = new Vec(v); this._dirty = true; }
    get normalUV(): number { return this._normalUV; }
    set normalUV(v: number) { this._normalUV = v; this._dirty = true; }
    
    get metalness(): number { return this._metalness; }
    set metalness(v: number) {
        this._metalness = v;
        this._dirty = true;
    }

    get metalnessTexture(): Texture | null { return this._metalnessTexture; }
    set metalnessTexture(v: Texture | null) {
        v && assertTexture(v, "metalness");
        if (this._metalnessTexture instanceof Texture) {
            this._metalnessTexture.decReferences();
        }
        this._metalnessTexture = v;
        if (this._metalnessTexture instanceof Texture) {
            this._metalnessTexture.incReferences();
        }
        this._dirty = true;
    }
    
    get metalnessChannel(): number { return this._metalnessChannel; }
    set metalnessChannel(v: number) { this._metalnessChannel = v; this._dirty = true; }
    get metalnessScale(): Vec { return this._metalnessScale; }
    set metalnessScale(v: Vec) { assertScale(v, "metalnessScale"); this._metalnessScale = new Vec(v); this._dirty = true; }
    get metalnessUV(): number { return this._metalnessUV; }
    set metalnessUV(v: number) { this._metalnessUV = v; this._dirty = true; }

    get roughness(): number { return this._roughness; }
    set roughness(v: number) {
        this._roughness = v;
        this._dirty = true;
    }
    
    get roughnessTexture(): Texture | null { return this._roughnessTexture; }
    set roughnessTexture (v: Texture | null) {
        v && assertTexture(v, "roughness");
        if (this._roughnessTexture instanceof Texture) {
            this._roughnessTexture.decReferences();
        }
        this._roughnessTexture = v;
        if (this._roughnessTexture instanceof Texture) {
            this._roughnessTexture.incReferences();
        }
        this._dirty = true;
    }
    
    get roughnessChannel(): number { return this._roughnessChannel; }
    set roughnessChannel(v: number) { this._roughnessChannel = v; this._dirty = true; }
    get roughnessScale(): Vec { return this._roughnessScale; }
    set roughnessScale(v: Vec) { assertScale(v, "roughnessScale"); this._roughnessScale = new Vec(v); this._dirty = true; }
    get roughnessUV(): number { return this._roughnessUV; }
    set roughnessUV(v: number) { this._roughnessUV = v; this._dirty = true; }

    get fresnelTint(): Color { return this._fresnelTint; }
    set fresnelTint(v: Color) { assertColor(v, "fresnelTint"); this._fresnelTint = v; this._dirty = true; }
    get sheenIntensity(): number { return this._sheenIntensity; }
    set sheenIntensity(v: number) { this._sheenIntensity = v; this._dirty = true; }
    get sheenColor(): Color { return this._sheenColor; }
    set sheenColor(v: Color) { assertColor(v, "sheenColor"); this._sheenColor = v; this._dirty = true; }

    get lightEmission(): Color | number { return this._lightEmission; }
    set lightEmission(v: Color | number) {
        if (typeof v === "number") {
            v = new Color([v, v, v, 1]);
        }
        assertColor(v, "lightEmission"); this._lightEmission = v; this._dirty = true;
    }
    get lightEmissionTexture(): Texture | null { return this._lightEmissionTexture; }
    set lightEmissionTexture(v: Texture | null) {
        v && assertTexture(v, 'lightEmissionTexture');
        if (this._lightEmissionTexture instanceof Texture) {
            this._lightEmissionTexture.decReferences();
        }
        this._lightEmissionTexture = v;
        if (this._lightEmissionTexture instanceof Texture) {
            this._lightEmissionTexture.incReferences();
        }
        this._dirty = true;
    }
    
    get lightEmissionChannel(): number { return this._lightEmissionChannel; }
    set lightEmissionChannel(v: number) { this._lightEmissionChannel = v; this._dirty = true; }
    get lightEmissionScale(): Vec { return this._lightEmissionScale; }
    set lightEmissionScale(v: Vec) { assertScale(v, "lightEmissionScale"); this._lightEmissionScale = new Vec(v); this._dirty = true; }
    get lightEmissionUV(): number { return this._lightEmissionUV; }
    set lightEmissionUV(v: number) { this._lightEmissionUV = v; this._dirty = true; }

    get ambientOcclussion(): Texture | null { return this._ambientOcclussion; }
    set ambientOcclussion(v: Texture | null) {
        v && assertTexture(v, "ambientOcclussion");
        if (this._ambientOcclussion instanceof Texture) {
            this._ambientOcclussion.decReferences();
        }
        this._ambientOcclussion = v;
        if (this._ambientOcclussion instanceof Texture) {
            this._ambientOcclussion.incReferences();
        }
        this._dirty = true;
    }

    get ambientOcclussionChannel(): number { return this._ambientOcclussionChannel; }
    set ambientOcclussionChannel(v: number) { this._ambientOcclussionChannel = v; this._dirty = true; }
    get ambientOcclussionUV(): number { return this._ambientOcclussionUV; }
    set ambientOcclussionUV(v: number) { this._ambientOcclussionUV = v; this._dirty = true; }

    
    
    get heightTexture(): Texture | null { return this._heightTexture; }
    set heightTexture(v: Texture | null) { assertTexture(v, "heightTexture"); this._heightTexture = v; this._dirty = true; }
    get heightChannel(): number { return this._heightChannel; }
    set heightChannel(v: number) { this._heightChannel = v; this._dirty = true; }
    get heightScale(): Vec { return this._heightScale; }
    set heightScale(v: Vec) { assertScale(v, "heightScale"); this._heightScale = new Vec(v); this._dirty = true; }
    get heightUV(): number { return this._heightUV; }
    set heightUV(v: number) { this._heightUV = v; this._dirty = true; }
    get heightIntensity(): number { return this._heightIntensity; }
    set heightIntensity(v: number) { this._heightIntensity = v; this._dirty = true; }
    get castShadows(): boolean { return this._castShadows; }
    set castShadows(v: boolean) { this._castShadows = v; this._dirty = true; }
    get unlit(): boolean { return this._unlit; }
    set unlit(v: boolean) { this._unlit = v; this._dirty = true; }

    async serialize(sceneData: any): Promise<void> {
        for (const att in MaterialAttributeNames) {
            const value = MaterialAttributeNames[att].loader.serialize(att, (this as any)[att]);
            if (value) {
                sceneData[att] = value;
            }
        }
    }

    async deserialize(sceneData: any, relativePath: string, canvas?: Canvas | null): Promise<void> {
        const P: Promise<any>[] = [];
        
        this.type = sceneData.type || MaterialType.PBR;
        this.alphaCutoff = sceneData.alphaCutoff || 0.5;
        this.isTransparent = sceneData.isTransparent || false;

        for (const attName in MaterialAttributeNames) {
            const loader = MaterialAttributeNames[attName]?.loader;
            if (loader) {
                const value = loader.deserialize(attName, sceneData[attName], relativePath, this.canvas);
                if (value instanceof Texture) {
                    P.push(value.loadImageData());
                }

                if (value !== null && value !== undefined) {
                    (this as any)[attName] = value;
                }
            }
        }
        await Promise.all(P);
    }

    destroy(): void {
        const decReferences = (attrib: string) => {
            if ((this as any)[attrib] instanceof Texture) {
                (this as any)[attrib].decReferences();
            }
        }

        decReferences("albedoTexture");
        decReferences("normalTexture");
        decReferences("metalnessTexture");
        decReferences("roughnessTexture");
        decReferences("lightEmissionTexture");
        decReferences("ambientOcclussion");
        decReferences("height");

        this._canvas = null;
        
        if (this.renderer) {
            this.renderer.destroy();
        }
    }
}
