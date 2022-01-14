
import Texture from "./Texture";
import MaterialModifier from "./MaterialModifier";
import { Vector2, Vector3, Vector4, Color } from "../math/Vector";
import MaterialFlag from "./MaterialFlag";
import Resource from "../utils/Resource";

function loadTexture(context,image,url) {
    return Texture.FromImage(context,image,url);
}

function channelVector(channel) {
    return new Vector4(
        channel==0 ? 1:0,
        channel==1 ? 1:0,
        channel==2 ? 1:0,
        channel==3 ? 1:0
    );
}

function readVector(data) {
    if (!data) return null;
    switch (data.length) {
    case 2:
        return new Vector2(data[0],data[1]);
    case 3:
        return new Vector3(data[0],data[1],data[2]);
    case 4:
        return new Vector4(data[0],data[1],data[2],data[3]);
    }
    return null;
}

export default class Material {
    // Create and initialize a material from the json material definition
    static FromMaterialDefinition(context,def,basePath="") {
        return new Promise((resolve,reject) => {
            let mat = new Material();

            mat.diffuse = readVector(def.diffuse) || Color.White();
            mat.specular = readVector(def.specular) || Color.White();
            mat.shininess = def.shininess || 0;
            mat.shininessMaskChannel = def.shininessMaskChannel || 0;
            mat.shininessMaskInvert = def.shininessMaskInvert || false;
            mat.lightEmission = def.lightEmission || 0;
            mat.lightEmissionMaskChannel = def.lightEmissionMaskChannel || 0;
            mat.lightEmissionMaskInvert = def.lightEmissionMaskInvert || false;
            mat.refractionAmount = def.refractionAmount || 0;
            mat.reflectionAmount = def.reflectionAmount || 0;
            mat.reflectionMaskChannel = def.reflectionMaskChannel || 0;
            mat.reflectionMaskInvert = def.reflectionMaskInvert || false;
            mat.textureOffset = readVector(def.textureOffset) || new Vector2(0,0);
            mat.textureScale = readVector(def.textureScale) || new Vector2(1,1);
            mat.normalMapOffset = readVector(def.normalMapOffset) || new Vector2(0,0);
            mat.normalMapScale = readVector(def.normalMapScale) || new Vector2(1,1);
            mat.cullFace = def.cullFace===undefined ? true : def.cullFace;
            mat.castShadows = def.castShadows===undefined ? true : def.castShadows;
            mat.receiveShadows = def.receiveShadows===undefined ? true : def.receiveShadows;
            mat.alphaCutoff = def.alphaCutoff===undefined ? 0.5 : def.alphaCutoff;
            mat.name = def.name;
            mat.description = def.description;
            mat.roughness = def.roughness || 0;
            mat.roughnessMaskChannel = def.roughnessMaskChannel || 0;
            mat.roughnessMaskInvert = def.roughnessMaskInvert || false;
            mat.unlit = def.unlit || false;

            let texPromises = [];
            texPromises.push(readTexture(context,basePath,def.shininessMask,mat,"shininessMask"));
            texPromises.push(readTexture(context,basePath,def.lightEmissionMask,mat,"lightEmissionMask"));
            texPromises.push(readTexture(context,basePath,def.reflectionMask,mat,"reflectionMask"));
            texPromises.push(readTexture(context,basePath,def.texture,mat,"texture"));
            texPromises.push(readTexture(context,basePath,def.normalMap,mat,"normalMap"));
            texPromises.push(readTexture(context,basePath,def.roughnessMask,mat,"roughnessMask"));

            Promise.all(texPromises)
                .then(() => {
                    resolve(mat);
                });
        });
    }

    constructor() {
        this._diffuse = Color.White();
        this._specular = Color.White();
        this._shininess = 0;
        this._lightEmission = 0;
        this._refractionAmount = 0;
        this._reflectionAmount = 0;
        this._texture = null;
        this._lightmap = null;
        this._normalMap = null;
        this._textureOffset = new Vector2();
        this._textureScale = new Vector2(1);
        this._lightmapOffset = new Vector2();
        this._lightmapScale = new Vector2(1);
        this._normalMapOffset = new Vector2();
        this._normalMapScale = new Vector2(1);
        this._castShadows = true;
        this._receiveShadows = true;
        this._alphaCutoff = 0.5;
        this._shininessMask = null;
        this._shininessMaskChannel = 0;
        this._shininessMaskInvert = false;
        this._lightEmissionMask = null;
        this._lightEmissionMaskChannel = 0;
        this._lightEmissionMaskInvert = false;
        this._reflectionMask = null;
        this._reflectionMaskChannel = 0;
        this._reflectionMaskInvert = false;
        this._cullFace = true;
        this._roughness = 0;
        this._roughnessMask = null;
        this._roughnessMaskChannel = 0;
        this._roughnessMaskInvert = false;
        this._unlit = false;
        
        this._selectMode = false;
    }
    
    clone() {
        let copy = new Material();
        copy.assign(this);
        return copy;
    }
    
    assign(other) {
        this._diffuse = new Color(other.diffuse);
        this._specular = new Color(other.specular);
        this._shininess = other.shininess;
        this._lightEmission = other.lightEmission;
        this._refractionAmount = other.refractionAmount;
        this._reflectionAmount = other.reflectionAmount;
        this._texture = other.texture;
        this._lightmap = other.lightmap;
        this._normalMap = other.normalMap;
        this._textureOffset = new Vector2(other.textureOffset);
        this._textureScale = new Vector2(other.textureScale);
        this._lightmapOffset = new Vector2(other.ligthmapOffset);
        this._lightmapScale = new Vector2(other.lightmapScale);
        this._normalMapOffset = new Vector2(other.normalMapOffset);
        this._normalMapScale = new Vector2(other.normalMapScale);
        this._castShadows = other.castShadows;
        this._receiveShadows = other.receiveShadows;
        this._alphaCutoff = other.alphaCutoff;
        this._shininessMask = other.shininessMask;
        this._shininessMaskChannel = other.shininessMaskChannel;
        this._shininessMaskInvert = other.shininessMaskInvert;
        this._lightEmissionMask = other.lightEmissionMask;
        this._lightEmissionMaskChannel = other.lightEmissionMaskChannel;
        this._lightEmissionMaskInvert = other.lightEmissionMaskInvert;
        this._reflectionMask = other.reflectionMask;
        this._reflectionMaskChannel = other.reflectionMaskChannel;
        this._reflectionMaskInvert = other.reflectionMaskInvert;
        this._cullFace = other.cullFace;
        this._roughness = other.roughness;
        this._roughnessMask = other.roughnessMask;
        this._roughnessMaskChannel = other.roughnessMaskChannel;
        this._roughnessMaskInvert = other.roughnessMaskInvert;
        this._unlit = other.unlit;
    }
    
    get isTransparent() {
        return this._diffuse.a<1;
    }
    
    get diffuse() { return this._diffuse; }
    get specular() { return this._specular; }
    get shininess() { return this._shininess; }
    get lightEmission() { return this._lightEmission; }
    get refractionAmount() { return this._refractionAmount; }
    get reflectionAmount() { return this._reflectionAmount; }
    get texture() { return this._texture; }
    get lightmap() { return this._lightmap; }
    get normalMap() { return this._normalMap; }
    get textureOffset() { return this._textureOffset; }
    get textureScale() { return this._textureScale; }
    get lightmapOffset() { return this._lightmapOffset; }
    get lightmapScale() { return this._lightmapScale; }
    get normalMapOffset() { return this._normalMapOffset; }
    get normalMapScale() { return this._normalMapScale; }
    get castShadows() { return this._castShadows; }
    get receiveShadows() { return this._receiveShadows; }
    get alphaCutoff() { return this._alphaCutoff; }
    get shininessMask() { return this._shininessMask; }
    get shininessMaskChannel() { return this._shininessMaskChannel; }
    get shininessMaskInvert() { return this._shininessMaskInvert; }
    get lightEmissionMask() { return this._lightEmissionMask; }
    get lightEmissionMaskChannel() { return this._lightEmissionMaskChannel; }
    get lightEmissionMaskInvert() { return this._lightEmissionMaskInvert; }
    get reflectionMask() { return this._reflectionMask; }
    get reflectionMaskChannel() { return this._reflectionMaskChannel; }
    get reflectionMaskInvert() { return this._reflectionMaskInvert; }
    get cullFace() { return this._cullFace; }
    get roughness() { return this._roughness; }
    get roughnessMask() { return this._roughnessMask; }
    get roughnessMaskChannel() { return this._roughnessMaskChannel; }
    get roughnessMaskInvert() { return this._roughnessMaskInvert; }
    get unlit() { return this._unlit; }

    
    set diffuse(newVal) { this._diffuse = newVal; }
    set specular(newVal) { this._specular = newVal; }
    set shininess(newVal) { if (!isNaN(newVal)) this._shininess = newVal; }
    set lightEmission(newVal) { if (!isNaN(newVal)) this._lightEmission = newVal; }
    set refractionAmount(newVal) { this._refractionAmount = newVal; }
    set reflectionAmount(newVal) { this._reflectionAmount = newVal; }
    set texture(newVal) { this._texture = newVal; }
    set lightmap(newVal) { this._lightmap = newVal; }
    set normalMap(newVal) { this._normalMap = newVal; }
    set textureOffset(newVal) { this._textureOffset = newVal; }
    set textureScale(newVal) { this._textureScale = newVal; }
    set lightmapOffset(newVal) { this._lightmapOffset = newVal; }
    set lightmapScale(newVal) { this._lightmapScale = newVal; }
    set normalMapOffset(newVal) { this._normalMapOffset = newVal; }
    set normalMapScale(newVal) { this._normalMapScale = newVal; }
    set castShadows(newVal) { this._castShadows = newVal; }
    set receiveShadows(newVal) { this._receiveShadows = newVal; }
    set alphaCutoff(newVal) { if (!isNaN(newVal)) this._alphaCutoff = newVal; }
    set shininessMask(newVal) { this._shininessMask = newVal; }
    set shininessMaskChannel(newVal) { this._shininessMaskChannel = newVal; }
    set shininessMaskInvert(newVal) { this._shininessMaskInvert = newVal; }
    set lightEmissionMask(newVal) { this._lightEmissionMask = newVal; }
    set lightEmissionMaskChannel(newVal) { this._lightEmissionMaskChannel = newVal; }
    set lightEmissionMaskInvert(newVal) { this._lightEmissionMaskInvert = newVal; }
    set reflectionMask(newVal) { this._reflectionMask = newVal; }
    set reflectionMaskChannel(newVal) { this._reflectionMaskChannel = newVal; }
    set reflectionMaskInvert(newVal) { this._reflectionMaskInvert = newVal; }
    set cullFace(newVal) { this._cullFace = newVal; }
    set roughness(newVal) { this._roughness = newVal; }
    set roughnessMask(newVal) { this._roughnessMask = newVal; }
    set roughnessMaskChannel(newVal) { this._roughnessMaskChannel = newVal; }
    set roughnessMaskInvert(newVal) { this._roughnessMaskInvert = newVal; }
    
    get unlit() { return this._unlit; }
    set unlit(u) { this._unlit = u; }

    get selectMode() { return this._selectMode; }
    set selectMode(s) { this._selectMode = s; }

    // Mask channel vectors: used to pass the mask channel to a shader
    get lightEmissionMaskChannelVector() {
        return channelVector(this.lightEmissionMaskChannel)
    }
    
    get shininessMaskChannelVector() {
        return channelVector(this.shininessMaskChannel);
    }
    
    get reflectionMaskChannelVector() {
        return channelVector(this.reflectionMaskChannel);
    }

    get roughnessMaskChannelVector() {
        return channelVector(this.roughnessMaskChannel);
    }
    
    // Returns an array of the external resources used by this material, for example,
    // the paths to the textures. If the "resources" parameter (array) is passed, the resources
    // will be added to this array, and the parameter will be modified to include the new
    // resources. If a resource exists in the "resources" parameter, it will not be added
    getExternalResources(resources=[]) {
        function tryadd(texture) {
            if (texture && texture.fileName && texture.fileName!="" && resources.indexOf(texture.fileName)==-1) {
                resources.push(texture.fileName);
            }
        }
        tryadd(this.texture);
        tryadd(this.lightmap);
        tryadd(this.normalMap);
        tryadd(this.shininessMask);
        tryadd(this.lightEmissionMask);
        tryadd(this.reflectionMask);
        tryadd(this.roughnessMask);
        return resources;
    }
    
    copyMaterialSettings(mat,mask) {
        if ( mask & MaterialFlag.DIFFUSE) {
            mat.diffuse = this.diffuse;
        }
        if ( mask & MaterialFlag.SPECULAR) {
            mat.specular = this.specular;
        }
        if ( mask & MaterialFlag.SHININESS) {
            mat.shininess = this.shininess;
        }
        if ( mask & MaterialFlag.LIGHT_EMISSION) {
            mat.lightEmission = this.lightEmission;
        }
        if ( mask & MaterialFlag.REFRACTION_AMOUNT) {
            mat.refractionAmount = this.refractionAmount;
        }
        if ( mask & MaterialFlag.REFLECTION_AMOUNT) {
            mat.reflectionAmount = this.reflectionAmount;
        }
        if ( mask & MaterialFlag.TEXTURE) {
            mat.texture = this.texture;
        }
        if ( mask & MaterialFlag.LIGHT_MAP) {
            mat.lightmap = this.lightmap;
        }
        if ( mask & MaterialFlag.NORMAL_MAP) {
            mat.normalMap = this.normalMap;
        }
        if ( mask & MaterialFlag.TEXTURE_OFFSET) {
            mat.textureOffset = this.textureOffset;
        }
        if ( mask & MaterialFlag.TEXTURE_SCALE) {
            mat.textureScale = this.textureScale;
        }
        if ( mask & MaterialFlag.LIGHT_MAP_OFFSET) {
            mat.lightmapOffset = this.lightmapOffset;
        }
        if ( mask & MaterialFlag.LIGHT_MAP_SCALE) {
            mat.lightmapScale = this.lightmapScale;
        }
        if ( mask & MaterialFlag.NORMAL_MAP_OFFSET) {
            mat.normalMapOffset = this.normalMapOffset;
        }
        if ( mask & MaterialFlag.NORMAL_MAP_SCALE) {
            mat.normalMapScale = this.normalMapScale;
        }
        if ( mask & MaterialFlag.CAST_SHADOWS) {
            mat.castShadows = this.castShadows;
        }
        if ( mask & MaterialFlag.RECEIVE_SHADOWS) {
            mat.receiveShadows = this.receiveShadows;
        }
        if ( mask & MaterialFlag.ALPHA_CUTOFF) {
            mat.alphaCutoff = this.alphaCutoff;
        }
        if ( mask & MaterialFlag.SHININESS_MASK) {
            mat.shininessMask = this.shininessMask;
        }
        if ( mask & MaterialFlag.SHININESS_MASK_CHANNEL) {
            mat.shininessMaskChannel = this.shininessMaskChannel;
        }
        if ( mask & MaterialFlag.SHININESS_MASK_INVERT) {
            mat.shininessMaskInvert = this.shininessMaskInvert;
        }
        if ( mask & MaterialFlag.LIGHT_EMISSION_MASK) {
            mat.lightEmissionMask = this.lightEmissionMask;
        }
        if ( mask & MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL) {
            mat.lightEmissionMaskChannel = this.lightEmissionMaskChannel;
        }
        if ( mask & MaterialFlag.LIGHT_EMISSION_MASK_INVERT) {
            mat.lightEmissionMaskInvert = this.lightEmissionMaskInvert;
        }
        if ( mask & MaterialFlag.REFLECTION_MASK) {
            mat.reflectionMask = this.reflectionMask;
        }
        if ( mask & MaterialFlag.REFLECTION_MASK_CHANNEL) {
            mat.reflectionMaskChannel = this.reflectionMaskChannel;
        }
        if ( mask & MaterialFlag.REFLECTION_MASK_INVERT) {
            mat.reflectionMaskInvert = this.reflectionMaskInvert;
        }
        if ( mask & MaterialFlag.CULL_FACE) {
            mat.cullFace = this.cullFace;
        }

        // All the roughness attributes are copied together using this flag. In
        // the future, the *_MASK, *_MASK_CHANNEL and *_MASK_INVERT for shininess,
        // light emission and reflection, will be deprecated and will work in the
        // same way as ROUGHNESS here
        if ( mask & MaterialFlag.ROUGHNESS) {
            mat.reflectionAmount = this.reflectionAmount;
            mat.reflectionMask = this.reflectionMask;
            mat.reflectionMaskChannel = this.reflectionMaskChannel;
            mat.reflectionMaskInvert = this.reflectionMaskInvert;
        }

        if (mask & MaterialFlag.UNLIT) {
            mat.unlit = this.unlit;
        }
    }

    applyModifier(context, mod, resourcePath) {
        if (mod.isEnabled(MaterialFlag.DIFFUSE)) {
            this.diffuse = mod.diffuse;
        }
        if (mod.isEnabled(MaterialFlag.SPECULAR)) {
            this.specular = mod.specular;
        }
        if (mod.isEnabled(MaterialFlag.SHININESS)) {
            this.shininess = mod.shininess;
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_EMISSION)) {
            this.lightEmission = mod.lightEmission;
        }
        if (mod.isEnabled(MaterialFlag.REFRACTION_AMOUNT)) {
            this.refractionAmount = mod.refractionAmount;
        }
        if (mod.isEnabled(MaterialFlag.REFLECTION_AMOUNT)) {
            this.reflectionAmount = mod.reflectionAmount;
        }
        if (mod.isEnabled(MaterialFlag.TEXTURE)) {
            this.texture = getTexture(context,mod.texture,resourcePath);
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_MAP)) {
            this.lightmap = getTexture(context,mod.lightmap,resourcePath);
        }
        if (mod.isEnabled(MaterialFlag.NORMAL_MAP)) {
            this.normalMap = getTexture(context,mod.normalMap,resourcePath);
        }
        if (mod.isEnabled(MaterialFlag.TEXTURE_OFFSET)) {
            this.textureOffset = mod.textureOffset;
        }
        if (mod.isEnabled(MaterialFlag.TEXTURE_SCALE)) {
            this.textureScale = mod.textureScale;
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_MAP_OFFSET)) {
            this.lightmapOffset = mod.lightmapOffset;
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_MAP_SCALE)) {
            this.lightmapScale = mod.lightmapScale;
        }
        if (mod.isEnabled(MaterialFlag.NORMAL_MAP_OFFSET)) {
            this.normalMapOffset = mod.normalMapOffset;
        }
        if (mod.isEnabled(MaterialFlag.NORMAL_MAP_SCALE)) {
            this.normalMapScale = mod.normalMapScale;
        }
        if (mod.isEnabled(MaterialFlag.CAST_SHADOWS)) {
            this.castShadows = mod.castShadows;
        }
        if (mod.isEnabled(MaterialFlag.RECEIVE_SHADOWS)) {
            this.receiveShadows = mod.receiveShadows;
        }
        if (mod.isEnabled(MaterialFlag.ALPHA_CUTOFF)) {
            this.alphaCutoff = mod.alphaCutoff;
        }
        if (mod.isEnabled(MaterialFlag.SHININESS_MASK)) {
            this.shininessMask = getTexture(context,mod.shininessMask,resourcePath);
        }
        if (mod.isEnabled(MaterialFlag.SHININESS_MASK_CHANNEL)) {
            this.shininessMaskChannel = mod.shininessMaskChannel;
        }
        if (mod.isEnabled(MaterialFlag.SHININESS_MASK_INVERT)) {
            this.shininessMaskInvert = mod.shininessMaskInvert;
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_EMISSION_MASK)) {
            this.lightEmissionMask = getTexture(context,mod.lightEmissionMask,resourcePath);
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL)) {
            this.lightEmissionMaskChannel = mod.lightEmissionMaskChannel;
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_EMISSION_MASK_INVERT)) {
            this.lightEmissionMaskInvert = mod.lightEmissionMaskInvert;
        }
        if (mod.isEnabled(MaterialFlag.REFLECTION_MASK)) {
            this.reflectionMask = getTexture(context,mod.reflectionMask,resourcePath);
        }
        if (mod.isEnabled(MaterialFlag.REFLECTION_MASK_CHANNEL)) {
            this.reflectionMaskChannel = mod.reflectionMaskChannel;
        }
        if (mod.isEnabled(MaterialFlag.REFLECTION_MASK_INVERT)) {
            this.reflectionMaskInvert = mod.reflectionMaskInvert;
        }
        if (mod.isEnabled(MaterialFlag.CULL_FACE)) {
            this.cullFace = mod.cullFace;
        }

        // See above note for ROUGHNESS flags
        if (mod.isEnabled(MaterialFlag.ROUGHNESS)) {
            this.roughness = mod.roughness;
            this.roughnessMask = getTexture(context,mod.roughnessMask,resourcePath);
            this.roughnessMaskChannel = mod.roughnessMaskChannel;
            this.roughnessMaskInvert = mod.roughnessMaskInvert;
        }

        if (mod.isEnabled(MaterialFlag.UNLIT)) {
            this.unlit = mod.unlit;
        }
    }
    
    getModifierWithMask(modifierMask) {
        var mod = new MaterialModifier();

        mod.modifierFlags = modifierMask;
        
        if (mod.isEnabled(MaterialFlag.DIFFUSE)) {
            mod.diffuse = this.diffuse;
        }
        if (mod.isEnabled(MaterialFlag.SPECULAR)) {
            mod.specular = this.specular;
        }
        if (mod.isEnabled(MaterialFlag.SHININESS)) {
            mod.shininess = this.shininess;
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_EMISSION)) {
            mod.lightEmission = this.lightEmission;
        }
        if (mod.isEnabled(MaterialFlag.REFRACTION_AMOUNT)) {
            mod.refractionAmount = this.refractionAmount;
        }
        if (mod.isEnabled(MaterialFlag.REFLECTION_AMOUNT)) {
            mod.reflectionAmount = this.reflectionAmount;
        }
        if (mod.isEnabled(MaterialFlag.TEXTURE)) {
            mod.texture = getPath(this.texture);
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_MAP)) {
            mod.lightmap = getPath(this.lightmap);
        }
        if (mod.isEnabled(MaterialFlag.NORMAL_MAP)) {
            mod.normalMap = getPath(this.normalMap);
        }
        if (mod.isEnabled(MaterialFlag.TEXTURE_OFFSET)) {
            mod.textureOffset = this.textureOffset;
        }
        if (mod.isEnabled(MaterialFlag.TEXTURE_SCALE)) {
            mod.textureScale = this.textureScale;
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_MAP_OFFSET)) {
            mod.lightmapOffset = this.lightmapOffset;
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_MAP_SCALE)) {
            mod.lightmapScale = this.lightmapScale;
        }
        if (mod.isEnabled(MaterialFlag.NORMAL_MAP_OFFSET)) {
            mod.normalMapOffset = this.normalMapOffset;
        }
        if (mod.isEnabled(MaterialFlag.NORMAL_MAP_SCALE)) {
            mod.normalMapScale = this.normalMapScale;
        }
        if (mod.isEnabled(MaterialFlag.CAST_SHADOWS)) {
            mod.castShadows = this.castShadows;
        }
        if (mod.isEnabled(MaterialFlag.RECEIVE_SHADOWS)) {
            mod.receiveShadows = this.receiveShadows;
        }
        if (mod.isEnabled(MaterialFlag.ALPHA_CUTOFF)) {
            mod.alphaCutoff = this.alphaCutoff;
        }
        if (mod.isEnabled(MaterialFlag.SHININESS_MASK)) {
            mod.shininessMask = getPath(this.shininessMask);
        }
        if (mod.isEnabled(MaterialFlag.SHININESS_MASK_CHANNEL)) {
            mod.shininessMaskChannel = this.shininessMaskChannel;
        }
        if (mod.isEnabled(MaterialFlag.SHININESS_MASK_INVERT)) {
            mod.shininessMaskInvert = this.shininessMaskInvert;
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_EMISSION_MASK)) {
            mod.lightEmissionMask = getPath(this.lightEmissionMask);
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL)) {
            mod.lightEmissionMaskChannel = this.lightEmissionMaskChannel;
        }
        if (mod.isEnabled(MaterialFlag.LIGHT_EMISSION_MASK_INVERT)) {
            mod.lightEmissionMaskInver = this.lightEmissionMaskInver;
        }
        if (mod.isEnabled(MaterialFlag.REFLECTION_MASK)) {
            mod.reflectionMask = getPath(this.reflectionMask);
        }
        if (mod.isEnabled(MaterialFlag.REFLECTION_MASK_CHANNEL)) {
            mod.reflectionMaskChannel = this.reflectionMaskChannel;
        }
        if (mod.isEnabled(MaterialFlag.REFLECTION_MASK_INVERT)) {
            mod.reflectionMaskInvert = this.reflectionMaskInvert;
        }
        if (mod.isEnabled(MaterialFlag.CULL_FACE)) {
            mod.cullFace = this.cullFace;
        }

        // See above note about ROUGHNESS flag
        if (mod.isEnabled(MaterialFlag.ROUGHNESS)) {
            mod.roughness = this.roughness;
            mod.roughnessMask = getPath(this.roughnessMask);
            mod.roughnessMaskChannel = this.roughnessMaskChannel;
            mod.roughnessMaskInvert = this.roughnessMaskInvert;
        }

        if (mod.isEnabled(MaterialFlag.UNLIT)) {
            mod.unlit = this.unlit;
        }

        return mod;
    }
    
    static GetMaterialWithJson(context,data,path) {
        let material = new Material();
        if (data.cullFace===undefined) {
            data.cullFace = true;
        }
        
        material.diffuse.set(data.diffuseR,data.diffuseG,data.diffuseB,data.diffuseA);
        material.specular.set(data.specularR,data.specularG,data.specularB,data.specularA);
        material.shininess = data.shininess;
        material.lightEmission = data.lightEmission;
        
        material.refractionAmount = data.refractionAmount;
        material.reflectionAmount = data.reflectionAmount;
        
        material.textureOffset.set(data.textureOffsetX,data.textureOffsetY);
        material.textureScale.set(data.textureScaleX,data.textureScaleY);
        
        material.lightmapOffset.set(data.lightmapOffsetX,data.lightmapOffsetY);
        material.lightmapScale.set(data.lightmapScaleX,data.lightmapScaleY);
        
        material.normalMapOffset.set(data.normalMapOffsetX,data.normalMapOffsetY);
        material.normalMapScale.set(data.normalMapScaleX,data.normalMapScaleY);
        
        material.alphaCutoff = data.alphaCutoff;
        material.castShadows = data.castShadows;
        material.receiveShadows = data.receiveShadows;
        
        material.shininessMaskChannel = data.shininessMaskChannel;
        material.shininessMaskInvert = data.invertShininessMask;
        
        material.lightEmissionMaskChannel = data.lightEmissionMaskChannel;
        material.lightEmissionMaskInvert = data.invertLightEmissionMask;
        
        material.reflectionMaskChannel = data.reflectionMaskChannel;
        material.reflectionMaskInvert = data.invertReflectionMask;

        material.roughness = data.roughness;
        material.roughnessMaskChannel = data.roughnessMaskChannel;
        material.roughnessMaskInvert = data.invertRoughnessMask;
        
        material.cullFace = data.cullFace;
        
        material.unlit = data.unlit;
        
        if (path && path[path.length-1]!='/') {
            path += '/';
        }
        
        function mergePath(path,file) {
            if (!file) return null;
            return path ? path + file:file;
        }

        data.texture = mergePath(path,data.texture);
        data.lightmap = mergePath(path,data.lightmap);
        data.normalMap = mergePath(path,data.normalMap);
        data.shininessMask = mergePath(path,data.shininessMask);
        data.lightEmissionMask = mergePath(path,data.lightEmissionMask);
        data.reflectionMask = mergePath(path,data.reflectionMask);
        data.roughnessMask = mergePath(path,data.roughnessMask);
        
        return new Promise((accept,reject) => {
            let textures = [];
            
            if (data.texture) {
                textures.push(data.texture);
            }
            if (data.lightmap && textures.indexOf(data.lightmap)==-1) {
                textures.push(data.lightmap);
            }
            if (data.normalMap && textures.indexOf(data.normalMap)==-1) {
                textures.push(data.normalMap);
            }
            if (data.shininessMask && textures.indexOf(data.shininessMask)==-1) {
                textures.push(data.shininessMask);
            }
            if (data.lightEmissionMask && textures.indexOf(data.lightEmissionMask)==-1) {
                textures.push(data.lightEmissionMask);
            }
            if (data.reflectionMask && textures.indexOf(data.reflectionMask)==-1) {
                textures.push(data.reflectionMask);
            }
            if (data.roughnessMask && textures.indexOf(data.roughnessMask)==-1) {
                textures.push(data.roughnessMask);
            }
            
            Resource.Load(textures)
                .then(function(images) {
                    material.texture = loadTexture(context,images[data.texture],data.texture);
                    material.lightmap = loadTexture(context,images[data.lightmap],data.lightmap);
                    material.normalMap = loadTexture(context,images[data.normalMap],data.normalMap);
                    material.shininessMask = loadTexture(context,images[data.shininessMask],data.shininessMask);
                    material.lightEmissionMask = loadTexture(context,images[data.lightEmissionMask],data.lightEmissionMask);
                    material.reflectionMask = loadTexture(context,images[data.reflectionMask],data.reflectionMask);
                    material.roughnessMask = loadTexture(context,images[data.roughnessMask],data.roughnessMask);
                    accept(material);
                });
        });
    }
}
