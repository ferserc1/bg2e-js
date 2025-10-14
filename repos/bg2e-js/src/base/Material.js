
import Vec from '../math/Vec';
import Color from './Color';
import Texture, { TextureDataType, TextureFilter, TextureWrap } from './Texture';
import Canvas from '../app/Canvas';
import TextureCache from '../tools/TextureCache';


export const MaterialType = Object.freeze({
    PBR: "pbr"
});

const textureTypeLoader = {
    serialize: (attName, obj) => {
        if (obj instanceof Texture) {
            return obj.fileName;
        }
        else {
            throw new Error(`Invalid parameter found in material serialization. The required parameter type is Texture`);
        }
    },

    deserialize: (attName, obj, relativePath = "", canvas = null) => {
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

const colorTypeLoader = {
    serialize: (attName, obj) => {
        if (obj instanceof Color) {
            return obj;
        }
        else  {
            throw new Error(`Invalid parameter found in material serialization. The required parameter type is Color`);
        }
    },

    deserialize: (attName, obj) => {
        if (!obj) {
            return null;
        }
        else if (Array.isArray(obj) && (obj.length === 3 || obj.length === 4)) {
            if (obj.length === 3) {
                return new Color(obj[0], obj[1], obj[2], 1);
            }
            else if (obj.length === 4) {
                return new Color(obj[0], obj[1], obj[2], obj[3]);
            }
        }
        else {
            throw new Error(`Invalid parameter found in material deserialization. The required parameter type is array with 3 or 4 elements`);
        }
    }
}

const vectorTypeLoader = {
    serialize: (attName, obj) => {
        if (obj instanceof Vec) {
            return obj;
        }
        else {
            throw new Error(`Invalid parameter found in material serialization. The required parameter type is Vec`);
        }
    },

    deserialize: (attName, obj) => {
        if (!obj) {
            return null;
        }
        else if (obj.length >= 2 && obj.length <= 4) {
            return new Vec(obj);
        }
        else {
            throw new Error(`Invalid parameter found in material deserialization. The required parameter type is array with 2, 3 or 4 elements`);
        }
    }
}

const primitiveTypeLoader = {
    serialize: (attName, obj) => {
        return obj;
    },

    deserialize: (attName, obj) => {
        return obj;
    }
}

export const MaterialAttributeNames = {
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

export const assertTexture = (v, name) => {
    if (!v instanceof Texture) {
        throw new Error(`Invalid parameter setting '${ name }' material attribute. The required parameter type is Texture`);
    }
}

export const assertColor = (v, name) => {
    if (!v instanceof Color) {
        throw new Error(`Invalid parameter setting '${ name }' material attribute. The required parameter type is Color`);
    }
}

export const assertScale = (v, name) => {
    if (!v instanceof Vec || v.length != 2) {
        throw new Error(`Invalid parameter setting '${ name }' material attribute. The required parameter type is Vec with two elements.`);
    }
}

// Clone the `obj` parameter if it is
//  - Vec
//  - Color
//  - Texture
// Returns the same parameter if not
export const cloneObject = (obj) => {
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
    static async Deserialize(sceneData,relativePath = "",canvas = null) {
        const result = new Material(canvas);
        await result.deserialize(sceneData,relativePath,canvas);
        return result;
    }

    constructor(canvas = null) {
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
        this._ambientOcclussion = 1;
        this._ambientOcclussionChannel = 0;
        this._ambientOcclussionUV = 1;
        this._heightTexture = 0;
        this._heightChannel = 0;
        this._heightScale = new Vec(1, 1);
        this._heightUV = 0;
        this._heightIntensity = 1.0;
        this._castShadows = true;
        this._unlit = false;

        this._dirty = true;
    }

    get canvas() {
        return this._canvas;
    }

    get renderer() {
        return this._renderer;
    }

    get dirty() {
        return this._dirty;
    }

    set dirty(d) {
        this._dirty = d;
    }

    clone() {
        const result = new Material();
        result.assign(this);
        return result;
    }

    assign(other) {
        this._type = other._type;
        this._alphaCutoff = other._alphaCutoff;;
        this._isTransparent = other._isTransparent;
        this._albedo = cloneObject(other._albedo);
        this._albedoTexture = cloneObject(other._albedoTexture);
        this._albedoScale = cloneObject(other._albedoScale);
        this._albedoUV = other._albedoUV;
        this._normalTexture = this.cloneObject(other._normalTexture);
        this._normalScale = cloneObject(other._normalScale);
        this._normalUV = other._normalUV;
        this._metalness = other._metalness;
        this._metalnessTexture = this.cloneObject(other._metalnessTexture);
        this._metalnessChannel = other._metalnessChannel;
        this._metalnessScale = cloneObject(other._metalnessScale);
        this._metalnessUV = other._metalnessUV;
        this._roughness = other._roughness;
        this._roughnessTexture = this.cloneObject(other._roughnessTexture);
        this._roughnessChannel = other._roughnessChannel;
        this._roughnessScale = cloneObject(other._roughnessScale);
        this._roughnessUV = other._roughnessUV;
        this._fresnelTint = cloneObject(other._fresnelTint);
        this._sheenIntensity = other._sheenIntensity;
        this._sheenColor = cloneObject(other._sheenColor);
        this._lightEmission = other._lightEmission;
        this._lightEmissionTexture = this.cloneObject(other._lightEmissionTexture);
        this._lightEmissionChannel = other._lightEmissionChannel;
        this._lightEmissionScale = cloneObject(other._lightEmissionScale);
        this._lightEmissionUV = other._lightEmissionUV;
        this._ambientOcclussion = other._ambientOcclussion;
        this._ambientOcclussionChannel = other._ambientOcclussionChannel;
        this._ambientOcclussionUV = other._ambientOcclussionUV;
        this._heightTexture = this.cloneObject(other._heightTexture);
        this._heightChannel = other._heightChannel;
        this._heightScale = cloneObject(other._heightScale);
        this._heightUV = other._heightUV;
        this._heightIntensity = other._heightIntensity;
        this._castShadows = other._castShadows;
        this._unlit = other._unlit;

        this._dirty = true;
    }

    get type() { return this._type; }
    set type(v) {
        // Compatibility with v1.4
        if (v === "PBRMaterial") {
            v = "pbr";
        }
        this._type = v;
        this._dirty = true;
    }

    get albedo() { return this._albedo; }
    set albedo(v) {
        this._albedo = v;
        this._dirty = true;
    }
    get albedoTexture() { return this._albedoTexture; }
    set albedoTexture(v) {
        assertTexture(v, "albedoTexture");
        if (this._albedoTexture instanceof Texture) {
            this._albedoTexture.decReferences();
        }
        this._albedoTexture = v;
        if (this._albedoTexture instanceof Texture) {
            this._albedoTexture.incReferences();
        }
        this._dirty = true;
    }

    get albedoScale() { return this._albedoScale; }
    set albedoScale(v) { assertScale(v, "albedoScale"); this._albedoScale = new Vec(v); this._dirty = true; }
    get albedoUV() { return this._albedoUV; }
    set albedoUV(v) { this._albedoUV = v; this._dirty = true; }
    get alphaCutoff() { return this._alphaCutoff; }
    set alphaCutoff(v) { this._alphaCutoff = v; this._dirty = true; }
    get isTransparent() { return this._isTransparent; }
    set isTransparent(v) { this._isTransparent = v; this._dirty = true; }

    get normalTexture() { return this._normalTexture; }
    set normalTexture(v) {
        assertTexture(v, "normalTexture");
        if (this._normalTexture instanceof Texture) {
            this._normalTexture.decReferences();
        }
        this._normalTexture = v;
        if (this._normalTexture instanceof Texture) {
            this._normalTexture.incReferences();
        }
        this._dirty = true;
    }

    get normalChannel() { return this._normalChannel; }
    set normalChannel(v) { this._normalChannel = v; this._dirty = true; }
    get normalScale() { return this._normalScale; }
    set normalScale(v) { assertScale(v, "normalScale"); this._normalScale = new Vec(v); this._dirty = true; }
    get normalUv() { return this._normalUv; }
    set normalUv(v) { this._normalUv = v; this._dirty = true; }
    get normalScale() { return this._normalScale; }
    set normalScale(v) { assertScale(v, "normalScale"); this._normalScale = new Vec(v); this._dirty = true; }
    get normalUv() { return this._normalUv; }
    set normalUv(v) { this._normalUv = v; this._dirty = true; }
    
    get metalness() { return this._metalness; }
    set metalness(v) {
        this._metalness = v;
        this._dirty = true;
    }

    get metalnessTexture() { return this._metalnessTexture; }
    set metalnessTexture(v) {
        assertTexture(v, "metalness");
        if (this._metalnessTexture instanceof Texture) {
            this._metalnessTexture.decReferences();
        }
        this._metalnessTexture = v;
        if (this._metalnessTexture instanceof Texture) {
            this._metalnessTexture.incReferences();
        }
        this._dirty = true;
    }
    
    get metalnessChannel() { return this._metalnessChannel; }
    set metalnessChannel(v) { this._metalnessChannel = v; this._dirty = true; }
    get metalnessScale() { return this._metalnessScale; }
    set metalnessScale(v) { assertScale(v, "metalnessScale"); this._metalnessScale = new Vec(v); this._dirty = true; }
    get metalnessUV() { return this._metalnessUV; }
    set metalnessUV(v) { this._metalnessUV = v; this._dirty = true; }

    get roughness() { return this._roughness; }
    set roughness(v) {
        this._roughness = v;
        this._dirty = true;
    }
    
    get roughnessTexture() { return this._roughnessTexture; }
    set roughnessTexture (v) {
        assertTexture(v, "roughness");
        if (this._roughnessTexture instanceof Texture) {
            this._roughnessTexture.decReferences();
        }
        this._roughnessTexture = v;
        if (this._roughnessTexture instanceof Texture) {
            this._roughnessTexture.incReferences();
        }
        this._dirty = true;
    }
    
    get roughnessChannel() { return this._roughnessChannel; }
    set roughnessChannel(v) { this._roughnessChannel = v; this._dirty = true; }
    get roughnessScale() { return this._roughnessScale; }
    set roughnessScale(v) { assertScale(v, "roughnessScale"); this._roughnessScale = new Vec(v); this._dirty = true; }
    get roughnessUV() { return this._roughnessUV; }
    set roughnessUV(v) { this._roughnessUV = v; this._dirty = true; }

    get fresnelTint() { return this._fresnelTint; }
    set fresnelTint(v) { assertColor(v, "fresnelTint"); this._fresnelTint = v; this._dirty = true; }
    get sheenIntensity() { return this._sheenIntensity; }
    set sheenIntensity(v) { this._sheenIntensity = v; this._dirty = true; }
    get sheenColor() { return this._sheenColor; }
    set sheenColor(v) { assertColor(v, "sheenColor"); this._sheenColor = v; this._dirty = true; }

    get lightEmission() { return this._lightEmission; }
    set lightEmission(v) { assertColor(v, "lightEmission"); this._lightEmission = v; this._dirty = true; }
    get lightEmissionTexture() { return this._lightEmissionTexture; }
    set lightEmissionTexture(v) {
        assertTexture(v, 'lightEmissionTexture');
        if (this._lightEmissionTexture instanceof Texture) {
            this._lightEmissionTexture.decReferences();
        }
        this._lightEmissionTexture = v;
        if (this._lightEmissionTexture instanceof Texture) {
            this._lightEmissionTexture.incReferences();
        }
        this._dirty = true;
    }
    
    get lightEmissionChannel() { return this._lightEmissionChannel; }
    set lightEmissionChannel(v) { this._lightEmissionChannel = v; this._dirty = true; }
    get lightEmissionScale() { return this._lightEmissionScale; }
    set lightEmissionScale(v) { assertScale(v, "lightEmissionScale"); this._lightEmissionScale = new Vec(v); this._dirty = true; }
    get lightEmissionUV() { return this._lightEmissionUV; }
    set lightEmissionUV(v) { this._lightEmissionUV = v; this._dirty = true; }

    get ambientOcclussion() { return this._ambientOcclussion; }
    set ambientOcclussion(v) {
        assertTexture(v, "ambientOcclussion");
        if (this._ambientOcclussion instanceof Texture) {
            this._ambientOcclussion.decReferences();
        }
        this._ambientOcclussion = v;
        if (this._ambientOcclussion instanceof Texture) {
            this._ambientOcclussion.incReferences();
        }
        this._dirty = true;
    }

    get ambientOcclussionChannel() { return this._ambientOcclussionChannel; }
    set ambientOcclussionChannel(v) { this._ambientOcclussionChannel = v; this._dirty = true; }
    get ambientOcclussionUV() { return this._ambientOcclussionUV; }
    set ambientOcclussionUV(v) { this._ambientOcclussionUV = v; this._dirty = true; }

    
    
    get heightTexture() { return this._heightTexture; }
    set heightTexture(v) { assertTexture(v, "heightTexture"); this._heightTexture = v; this._dirty = true; }
    get heightChannel() { return this._heightChannel; }
    set heightChannel(v) { this._heightChannel = v; this._dirty = true; }
    get heightScale() { return this._heightScale; }
    set heightScale(v) { assertScale(v, "heightScale"); this._heightScale = new Vec(v); this._dirty = true; }
    get heightUV() { return this._heightUV; }
    set heightUV(v) { this._heightUV = v; this._dirty = true; }
    get heightIntensity() { return this._heightIntensity; }
    set heightIntensity(v) { this._heightIntensity = v; this._dirty = true; }
    get castShadows() { return this._castShadows; }
    set castShadows(v) { this._castShadows = v; this._dirty = true; }
    get unlit() { return this._unlit; }
    set unlit(v) { this._unlit = v; this._dirty = true; }

    async serialize(sceneData) {
        MaterialAttributeNames.forEach(att => {
            const value = serializeAttribute(att, this);
            sceneData[att] = value;
        });
    }

    async deserialize(sceneData, relativePath) {
        const P = [];
        
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
                    this[attName] = value;
                }
            }
        }
        return await Promise.all(P);
    }

    destroy() {
        const decReferences = (attrib) => {
            if (this[attrib] instanceof Texture) {
                this[attrib].decReferences();
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
