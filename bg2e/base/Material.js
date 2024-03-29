
import Vec from '../math/Vec';
import Color from './Color';
import Texture, { TextureDataType, TextureFilter, TextureWrap } from './Texture';
import Canvas from '../app/Canvas';
import TextureCache from '../tools/TextureCache';


export const MaterialType = Object.freeze({
    PBR: "pbr"
});

export const MaterialAttributeNames = [
    "type",
    "class",    // Alias of "type"
    "diffuse",
    "diffuseScale",
    "diffuseUV",
    "alphaCutoff",
    "isTransparent",
    "metallic",
    "metallicChannel",
    "metallicScale",
    "metallicUV",
    "roughness",
    "roughnessChannel",
    "roughnessScale",
    "roughnessUV",
    "fresnel",
    "lightEmission",
    "lightEmissionChannel",
    "lightEmissionScale",
    "lightEmissionUV",
    "ambientOcclussion",
    "ambientOcclussionChannel",
    "ambientOcclussionUV",
    "normal",
    "normalScale",
    "normalUV",
    "height",
    "heightChannel",
    "heightScale",
    "heightUV",
    "heightIntensity",
    "castShadows",
    "unlit"
];

export const ColorTextureAttributes = [
    "diffuse",
    "normal"
];

export const ValueTextureAttributes = [
    "metallic",
    "roughness",
    "lightEmission",
    "ambientOcclussion",
    "height"
];

export const VectorAttribures = [
    "diffuseScale",
    "metallicScale",
    "roughnessScale",
    "lightEmissionScale",
    "normalScale",
    "heightScale"
];

export const ColorAttributes = [
    "fresnel"
];

export const PrimitiveTypeAttributes = [
    "type",
    "class",    // alias off type
    "alphaCutoff",
    "isTransparent",
    "diffuseUV",
    "metallicChannel",
    "metallicUV",
    "roughnessChannel",
    "roughnessUV",
    "lightEmissionChannel",
    "lightEmissionUV",
    "ambientOcclussionChannel",
    "ambientOcclussionUV",
    "normalUV",
    "heightChannel",
    "heightUV",
    "heightIntensity",
    "castShadows",
    "unlit"
];


export const assertColorTexture = (v, name) => {
    if (!v instanceof Color && !v instanceof Texture) {
        throw new Error(`Invalid parameter setting '${ name }' material attribute. The required parameter type is Color or Texture`);
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

export const assertValueTexture = (v, name) => {
    if (!v instanceof Texture && typeof(v) !== "number") {
        throw new Error(`Invalid parameter setting '${ name }' material attribute. The required parameter type is Texture or numeric value.`);
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

export const serializeColorTexture = (obj) => {
    const result = { type: "", data: {} };
    if (obj instanceof Color) {
        result.type = "Color";
        result.data = obj;
    }
    else if (obj instanceof Texture) {
        result.type = "Texture";
        obj.serialize(result.data);
    }
    else {
        throw new Error(`Invalid parameter found in material serialization`);
    }
    return result;
}


export const deserializeColorTexture = (obj,relativePath = "", canvas = null) => {
    if (obj === null || obj === undefined) {
        return null;
    }
    else if (typeof(obj) === "string") {
        // bg2e v1 texture compatibility
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
    else if (Array.isArray(obj) && (obj.length === 3 || obj.length === 4)) {
        // bg2e v1 color compatibility
        if (obj.length === 3) {
            return new Vec(obj[0], obj[1], obj[2], 1);
        }
        else if (obj.length === 4) {
            return new Vec(obj[0], obj[1], obj[2], obj[3]);
        }
    }
    else if (obj.type === "Color") {
        return new Color(obj.data);
    }
    else if (obj.type === "Texture") {
        const tex = new Texture(canvas);
        tex.deserialize(obj.data);
        return tex;
    }
    else {
        reject(new Error(`Invalid parameter found in material deserialization`));
    }
}

export const deserializeVector = (obj) => {
    if (!obj) {
        return null;
    }
    else if (obj.length >= 2 && obj.length <= 4) {
        return new Vec(obj);
    }
    else if (obj._v && obj._v.length >= 2 && obj._v.length <= 4) {
        return new Vec(obj._v);
    }
    else {
        throw new Error(`Invalid parameter found in material serialization`);
    }
}

export const serializeValueTexture = (obj) => {
    const result = { type: "", data: "" };
    if (obj instanceof Texture) {
        result.type = "Texture";
        obj.serialize(result.data);
    }
    else if (typeof(obj) === "number") {
        result.type = "number";
        result.data = obj;
    }
    else {
        throw new Error(`Invalid parameter found in material serialization`);
    }
    return result;
}

export const deserializeValueTexture = (obj,relativePath, canvas = null) => {
    if (obj === null || obj === undefined) {
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
            tex.wrapModeX = TextureWrap.REPEAT;
            tex.wrapModeY = TextureWrap.REPEAT;
            tex.minFilter = TextureFilter.LINEAR_MIPMAP_LINEAR;
            tex.magFilter = TextureFilter.LINEAR;
            textureCache.registerTexture(tex);
            return tex;
        }
    }
    else if (typeof(obj) === "number") {
        return obj;
    }
    else if (Array.isArray(obj)) {
        // Obsolete option. Return the mean array value
        return obj.reduce((a,b) => a + b) / obj.length;
    }
    else if (obj.type === "Texture") {
        const tex = new Texture(canvas);
        tex.deserialize(obj.data);
        return tex;
    }
    else if (obj.type === "number") {
        return obj.data;
    }
    else {
        throw new Error(`Invalid parameter found in material serialization`)
    }
}

export const serializeAttribute = (att,mat) => {
    if (ColorTextureAttributes.indexOf(att) !== -1) {
        return serializeColorTexture(mat[att]);
    }
    else if (ValueTextureAttributes.indexOf(att) !== -1) {
        return serializeValueTexture(mat[att]);
    }
    else if (VectorAttribures.indexOf(att) !== -1 ||
             ColorAttributes.indexOf(att) !== -1  ||
             PrimitiveTypeAttributes.indexOf(att) !== -1
    ) {
        return mat[att];
    }
    else {
        throw new Error(`Error in material attribute deserialization: invalid attribute '${ att }'`);
    }
}

export const deserializeAttribute = (att,obj,relativePath,canvas = null) => {
    if (ColorTextureAttributes.indexOf(att) !== -1) {
        return deserializeColorTexture(obj[att],relativePath,canvas);
    }
    else if (ValueTextureAttributes.indexOf(att) !== -1) {
        return deserializeValueTexture(obj[att],relativePath,canvas);
    }
    else if (VectorAttribures.indexOf(att) !== -1) {
        return deserializeVector(obj[att]);
    }
    else if (ColorAttributes.indexOf(att) !== -1) {
        return new Color(obj[att]);
    }
    else if (PrimitiveTypeAttributes.indexOf(att) !== -1) {
        return obj[att];
    }
    else {
        throw new Error(`Error in material attribute deserialization: invalid attribute '${ att }'`);
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

        this._diffuse = Color.White();
        this._diffuseScale = new Vec(1, 1);
        this._diffuseUV = 0;
        this._alphaCutoff = 0.5;
        this._isTransparent = false;
        this._metallic = 0;
        this._metallicChannel = 0;
        this._metallicScale = new Vec(1, 1);
        this._metallicUV = 0;
        this._roughness = 1;
        this._roughnessChannel = 0;
        this._roughnessScale = new Vec(1, 1);
        this._roughnessUV = 0;
        this._fresnel = Color.White();
        this._lightEmission = 0;
        this._lightEmissionChannel = 0;
        this._lightEmissionScale = new Vec(1, 1);
        this._lightEmissionUV = 0;
        this._ambientOcclussion = 1;
        this._ambientOcclussionChannel = 0;
        this._ambientOcclussionUV = 1;
        this._normal = new Color({ r: 0.5, g: 0.5, b: 1 });
        this._normalScale = new Vec(1, 1);
        this._normalUV = 0;
        this._height = 0;
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
        this.type = other._type;
        this.diffuse = cloneObject(other._diffuse);
        this.diffuseScale = cloneObject(other._diffuseScale);
        this.diffuseUV = other._diffuseUV;
        this.alphaCutoff = other._alphaCutoff;
        this.isTransparent = other._isTransparent;
        this.metallic = cloneObject(other._metallic);
        this.metallicChannel = other._metallicChannel;
        this.metallicScale = cloneObject(other._metallicScale);
        this.metallicUV = other._metallicUV;
        this.roughness = cloneObject(other._roughness);
        this.roughnessChannel = other._roughnessChannel;
        this.roughnessScale = cloneObject(other._roughnessScale);
        this.roughnessUV = other._roughnessUV;
        this.fresnel = cloneObject(other._fresnel);
        this.lightEmission = cloneObject(other._lightEmission);
        this.lightEmissionChannel = other._lightEmissionChannel;
        this.lightEmissionScale = cloneObject(other._lightEmissionScale);
        this.lightEmissionUV = other._lightEmissionUV;
        this.ambientOcclussion = cloneObject(other._ambientOcclussion);
        this.ambientOcclussionChannel = other._ambientOcclussionChannel;
        this.ambientOcclussionUV = other._ambientOcclussionUV;
        this.normal = cloneObject(other._normal);
        this.normalScale = cloneObject(other._normalScale);
        this.normalUV = other._normalUV;
        this.height = cloneObject(other._height);
        this.heightChannel = other._heightChannel;
        this.heightScale = cloneObject(other._heightScale);
        this.heightUV = other._heightUV;
        this.heightIntensity = other._heightIntensity;
        this.castShadows = other._castShadows;
        this.unlit = other._unlit;
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

    // Compatibility with v1.4
    set class(v) { this.type = v; this._dirty = true; }
    get class() { return this.type; }


    get diffuse() { return this._diffuse; }
    set diffuse(v) { 
        assertColorTexture(v, "diffuse");
        if (this._diffuse instanceof Texture) {
            this._diffuse.decReferences();
        }
        this._diffuse = v;
        if (this._diffuse instanceof Texture) {
            this._diffuse.incReferences();
        }
        this._dirty = true;
    }

    get diffuseScale() { return this._diffuseScale; }
    set diffuseScale(v) { assertScale(v, "diffuseScale"); this._diffuseScale = new Vec(v); this._dirty = true; }
    get diffuseUV() { return this._diffuseUV; }
    set diffuseUV(v) { this._diffuseUV = v; this._dirty = true; }
    get alphaCutoff() { return this._alphaCutoff; }
    set alphaCutoff(v) { this._alphaCutoff = v; this._dirty = true; }
    get isTransparent() { return this._isTransparent; }
    set isTransparent(v) { this._isTransparent = v; this._dirty = true; }
    
    get metallic() { return this._metallic; }
    set metallic(v) {
        assertValueTexture(v, "metallic");
        if (this._metallic instanceof Texture) {
            this._metallic.decReferences();
        }
        this._metallic = v;
        if (this._metallic instanceof Texture) {
            this._metallic.incReferences();
        }
        this._dirty = true;
    }
    
    get metallicChannel() { return this._metallicChannel; }
    set metallicChannel(v) { this._metallicChannel = v; this._dirty = true; }
    get metallicScale() { return this._metallicScale; }
    set metallicScale(v) { assertScale(v, "metallicScale"); this._metallicScale = new Vec(v); this._dirty = true; }
    get metallicUV() { return this._metallicUV; }
    set metallicUV(v) { this._metallicUV = v; this._dirty = true; }

    get roughness() { return this._roughness; }
    set roughness(v) {
        assertValueTexture(v, "roughness");
        if (this._roughness instanceof Texture) {
            this._roughness.decReferences();
        }
        this._roughness = v;
        if (this._roughness instanceof Texture) {
            this._roughness.incReferences();
        }
        this._dirty = true;
    }
    
    get roughnessChannel() { return this._roughnessChannel; }
    set roughnessChannel(v) { this._roughnessChannel = v; this._dirty = true; }
    get roughnessScale() { return this._roughnessScale; }
    set roughnessScale(v) { assertScale(v, "roughnessScale"); this._roughnessScale = new Vec(v); this._dirty = true; }
    get roughnessUV() { return this._roughnessUV; }
    set roughnessUV(v) { this._roughnessUV = v; this._dirty = true; }
    get fresnel() { return this._fresnel; }
    set fresnel(v) { assertColor(v, "fresnel"); this._fresnel = v; this._dirty = true; }
    
    get lightEmission() { return this._lightEmission; }
    set lightEmission(v) {
        assertValueTexture(v, 'lightEmission'); 
        if (this._lightEmission instanceof Texture) {
            this._lightEmission.decReferences();
        }
        this._lightEmission = v;
        if (this._lightEmission instanceof Texture) {
            this._lightEmission.incReferences();
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
        assertColorTexture(v, "ambientOcclussion");
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

    get normal() { return this._normal; }
    set normal(v) {
        assertColorTexture(v, "normal");
        if (this._normal instanceof Texture) {
            this._normal.decReferences();
        }
        this._normal = v;
        if (this._normal instanceof Texture) {
            this._normal.incReferences();
        }
        this._dirty = true;
    }
    
    get normalScale() { return this._normalScale; }
    set normalScale(v) { assertScale(v, "normalScale"); this._normalScale = new Vec(v); this._dirty = true; }
    get normalUV() { return this._normalUV; }
    set normalUV(v) { this._normalUV = v; this._dirty = true; }
    get height() { return this._height; }
    set height(v) { assertValueTexture(v, "height"); this._height = v; this._dirty = true; }
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
        for (const i in MaterialAttributeNames) {
            const att = MaterialAttributeNames[i];
            if (sceneData[att] !== undefined) {
                let value = null;
                if (att === "type") {
                    value = deserializeAttribute("class", sceneData, relativePath, this.canvas);
                }
                else {
                    value = deserializeAttribute(att, sceneData, relativePath, this.canvas);
                    if (value instanceof Texture) {
                        P.push(value.loadImageData());
                    }
                }

                if (value !== null) {
                    this[att] = value;
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

        ColorTextureAttributes.forEach(decReferences);
        ValueTextureAttributes.forEach(decReferences);

        if (this.renderer) {
            this.renderer.destroy();
        }
    }
}
