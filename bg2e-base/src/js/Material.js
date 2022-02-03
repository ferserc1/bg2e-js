
import { Vec } from 'bg2e-math';
import Color from './Color.js';
import Texture, { TextureDataType } from './Texture.js';

export const MaterialType = {
    PBR: "pbr"
};

export const MaterialAttributeNames = [
    "type",
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
    "cullFace",
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
    "cullFace",
    "unlit"
];


const assertColorTexture = (v, name) => {
    if (!v instanceof Color && !v instanceof Texture) {
        throw new Error(`Invalid parameter setting '${ name }' material attribute. The required parameter type is Color or Texture`);
    }
}

const assertColor = (v, name) => {
    if (!v instanceof Color) {
        throw new Error(`Invalid parameter setting '${ name }' material attribute. The required parameter type is Color`);
    }
}

const assertScale = (v, name) => {
    if (!v instanceof Vec || v.length != 2) {
        throw new Error(`Invalid parameter setting '${ name }' material attribute. The required parameter type is Vec with two elements.`);
    }
}

const assertValueTexture = (v, name) => {
    if (!v instanceof Texture && typeof(v) !== "number") {
        throw new Error(`Invalid parameter setting '${ name }' material attribute. The required parameter type is Texture or numeric value.`);
    }
}

// Clone the `obj` parameter if it is
//  - Vec
//  - Color
//  - Texture
// Returns the same parameter if not
const cloneObject = (obj) => {
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

const serializeColorTexture = (obj) => {
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

const deserializeColorTexture = (obj) => {
    if (!obj) {
        return null;
    }
    else if (typeof(obj) === "string") {
        // bg2e v1 texture compatibility
        const tex = new Texture();
        tex.fileName = obj;
        tex.dataType = TextureDataType.IMAGE;
        return tex;
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
        const tex = new Texture();
        tex.deserialize(obj.data);
        return tex;
    }
    else {
        throw new Error(`Invalid parameter found in material deserialization`);
    }
}

const deserializeVector = (obj) => {
    if (!obj) {
        return null;
    }
    else if (obj.length === 2) {
        return new Vec(obj);
    }
    else {
        throw new Error(`Invalid parameter found in material serialization`);
    }
}

const serializeValueTexture = (obj) => {
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

const deserializeValueTexture = (obj) => {
    if (!obj) {
        return null;
    }
    else if (typeof(obj) === "string") {
        const tex = new Texture();
        tex.fileName = obj;
        tex.dataType = TextureDataType.IMAGE;
        return tex;
    }
    else if (typeof(obj) === "number") {
        return obj;
    }
    else if (obj.type === "Texture") {
        const tex = new Texture();
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

const serializeAttribute = (att,mat) => {
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

const deserializeAttribute = (att,obj) => {
    if (ColorTextureAttributes.indexOf(att) !== -1) {
        return deserializeColorTexture(obj[att]);
    }
    else if (ValueTextureAttributes.indexOf(att) !== -1) {
        return deserializeValueTexture(obj[att]);
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

    constructor() {
        this._type = MaterialType.PBR;

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
        this._cullFace = true;
        this._unlit = false;
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
        this.cullFace = other._cullFace;
        this.unlit = other._unlit;
    }

    get type() { return this._type; }
    set type(v) { this._type = v; }


    get diffuse() { return this._diffuse; }
    set diffuse(v) { assertColorTexture(v, "diffuse"); this._diffuse = v; }
    get diffuseScale() { return this._diffuseScale; }
    set diffuseScale(v) { assertScale(v, "diffuseScale"); this._diffuseScale = new Vec(v); }
    get diffuseUV() { return this._diffuseUV; }
    set diffuseUV(v) { this._diffuseUV = v; }
    get alphaCutoff() { return this._alphaCutoff; }
    set alphaCutoff(v) { this._alphaCutoff = v; }
    get isTransparent() { return this._isTransparent; }
    set isTransparent(v) { this._isTransparent = v; }
    get metallic() { return this._metallic; }
    set metallic(v) { assertValueTexture(v, "metallic"); this._metallic = v; }
    get metallicChannel() { return this._metallicChannel; }
    set metallicChannel(v) { this._metallicChannel = v; }
    get metallicScale() { return this._metallicScale; }
    set metallicScale(v) { assertScale(v, "metallicScale"); this._metallicScale = new Vec(v); }
    get metallicUV() { return this._metallicUV; }
    set metallicUV(v) { this._metallicUV = v; }
    get roughness() { return this._roughness; }
    set roughness(v) { assertValueTexture(v, "roughness"); this._roughness = v; }
    get roughnessChannel() { return this._roughnessChannel; }
    set roughnessChannel(v) { this._roughnessChannel = v; }
    get roughnessScale() { return this._roughnessScale; }
    set roughnessScale(v) { assertScale(v, "roughnessScale"); this._roughnessScale = new Vec(v); }
    get roughnessUV() { return this._roughnessUV; }
    set roughnessUV(v) { this._roughnessUV = v; }
    get fresnel() { return this._fresnel; }
    set fresnel(v) { assertColor(v, "fresnel"); this._fresnel = v; }
    get lightEmission() { return this._lightEmission; }
    set lightEmission(v) { assertColorTexture(v, 'lightEmission'); this._lightEmission = v; }
    get lightEmissionChannel() { return this._lightEmissionChannel; }
    set lightEmissionChannel(v) { this._lightEmissionChannel = v; }
    get lightEmissionScale() { return this._lightEmissionScale; }
    set lightEmissionScale(v) { assertScale(v, "lightEmissionScale"); this._lightEmissionScale = new Vec(v); }
    get lightEmissionUV() { return this._lightEmissionUV; }
    set lightEmissionUV(v) { this._lightEmissionUV = v; }
    get ambientOcclussion() { return this._ambientOcclussion; }
    set ambientOcclussion(v) { assertColorTexture(v, "ambientOcclussion"); this._ambientOcclussion = v; }
    get ambientOcclussionChannel() { return this._ambientOcclussionChannel; }
    set ambientOcclussionChannel(v) { this._ambientOcclussionChannel = v; }
    get ambientOcclussionUV() { return this._ambientOcclussionUV; }
    set ambientOcclussionUV(v) { this._ambientOcclussionUV = v; }
    get normal() { return this._normal; }
    set normal(v) { assertColorTexture(v, "normal"); this._normal = v; }
    get normalScale() { return this._normalScale; }
    set normalScale(v) { assertScale(v, "normalScale"); this._normalScale = new Vec(v); }
    get normalUV() { return this._normalUV; }
    set normalUV(v) { this._normalUV = v; }
    get height() { return this._height; }
    set height(v) { assertValueTexture(v, "height"); this._height = v; }
    get heightChannel() { return this._heightChannel; }
    set heightChannel(v) { this._heightChannel = v; }
    get heightScale() { return this._heightScale; }
    set heightScale(v) { assertScale(v, "heightScale"); this._heightScale = new Vec(v); }
    get heightUV() { return this._heightUV; }
    set heightUV(v) { this._heightUV = v; }
    get heightIntensity() { return this._heightIntensity; }
    set heightIntensity(v) { this._heightIntensity = v; }
    get castShadows() { return this._castShadows; }
    set castShadows(v) { this._castShadows = v; }
    get cullFace() { return this._cullFace; }
    set cullFace(v) { this._cullFace = v; }
    get unlit() { return this._unlit; }
    set unlit(v) { this._unlit = v; }

    serialize(sceneData) {
        MaterialAttributeNames.forEach(att => {
            const value = serializeAttribute(att, this);
            sceneData[att] = value;
        });
    }

    deserialize(sceneData) {
        MaterialAttributeNames.forEach(att => {
            const value = deserializeAttribute(att, sceneData);
            if (value) {
                this[att] = value;
            }
        })
    }
}
