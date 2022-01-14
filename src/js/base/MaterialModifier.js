
import { Vector2, Color } from "../math/Vector";
import MaterialFlag from "./MaterialFlag";

export default class MaterialModifier {
    constructor(jsonData) {
        this._modifierFlags = 0;

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
        this._roughness = true;
        this._roughnessMask = null;
        this._roughnessMaskChannel = 0;
        this._roughnessMaskInvert = false;
        this._unlit = false;

        if (jsonData) {
            if (jsonData.diffuseR!==undefined && jsonData.diffuseG!==undefined && jsonData.diffuseB!==undefined) {
                this.diffuse = new Color(jsonData.diffuseR,
                                              jsonData.diffuseG,
                                              jsonData.diffuseB,
                                              jsonData.diffuseA ? jsonData.diffuseA : 1.0);
            }
            if (jsonData.specularR!==undefined && jsonData.specularG!==undefined && jsonData.specularB!==undefined) {
                this.specular = new Color(jsonData.specularR,
                                               jsonData.specularG,
                                               jsonData.specularB,
                                               jsonData.specularA ? jsonData.specularA : 1.0);
            }

            if (jsonData.shininess!==undefined) {
                this.shininess = jsonData.shininess;
            }

            if (jsonData.lightEmission!==undefined) {
                this.lightEmission = jsonData.lightEmission;
            }

            if (jsonData.refractionAmount!==undefined) {
                this.refractionAmount = jsonData.refractionAmount;
            }

            if (jsonData.reflectionAmount!==undefined) {
                this.reflectionAmount = jsonData.reflectionAmount;
            }

            if (jsonData.texture!==undefined) {
                this.texture = jsonData.texture;
            }

            if (jsonData.lightmap!==undefined) {
                this.lightmap = jsonData.lightmap;
            }


            if (jsonData.normalMap!==undefined) {
                this.normalMap = jsonData.normalMap;
            }
        
            if (jsonData.textureOffsetX!==undefined && jsonData.textureOffsetY!==undefined) {
                this.textureOffset = new Vector2(jsonData.textureOffsetX,
                                                    jsonData.textureOffsetY);
            }

            if (jsonData.textureScaleX!==undefined && jsonData.textureScaleY!==undefined) {
                this.textureScale = new Vector2(jsonData.textureScaleX,
                                                    jsonData.textureScaleY);
            }

            if (jsonData.lightmapOffsetX!==undefined && jsonData.lightmapOffsetY!==undefined) {
                this.lightmapOffset = new Vector2(jsonData.lightmapOffsetX,
                                                     jsonData.lightmapOffsetY);
            }

            if (jsonData.lightmapScaleX!==undefined && jsonData.lightmapScaleY!==undefined) {
                this.lightmapScale = new Vector2(jsonData.lightmapScaleX,
                                                     jsonData.lightmapScaleY);
            }

            if (jsonData.normalMapScaleX!==undefined && jsonData.normalMapScaleY!==undefined) {
                this.normalMapScale = new Vector2(jsonData.normalMapScaleX,
                                                     jsonData.normalMapScaleY);
            }

            if (jsonData.normalMapOffsetX!==undefined && jsonData.normalMapOffsetY!==undefined) {
                this.normalMapOffset = new Vector2(jsonData.normalMapOffsetX,
                                                     jsonData.normalMapOffsetY);
            }

            if (jsonData.castShadows!==undefined) {
                this.castShadows = jsonData.castShadows;
            }
            if (jsonData.receiveShadows!==undefined) {
                this.receiveShadows = jsonData.receiveShadows;
            }
            
            if (jsonData.alphaCutoff!==undefined) {
                this.alphaCutoff = jsonData.alphaCutoff;
            }

            if (jsonData.shininessMask!==undefined) {
                this.shininessMask = jsonData.shininessMask;
            }
            if (jsonData.shininessMaskChannel!==undefined) {
                this.shininessMaskChannel = jsonData.shininessMaskChannel;
            }
            if (jsonData.invertShininessMask!==undefined) {
                this.shininessMaskInvert = jsonData.invertShininessMask;
            }

            if (jsonData.lightEmissionMask!==undefined) {
                this.lightEmissionMask = jsonData.lightEmissionMask;
            }
            if (jsonData.lightEmissionMaskChannel!==undefined) {
                this.lightEmissionMaskChannel = jsonData.lightEmissionMaskChannel;
            }
            if (jsonData.invertLightEmissionMask!==undefined) {
                this.lightEmissionMaskInvert = jsonData.invertLightEmissionMask;
            }
            
            if (jsonData.reflectionMask!==undefined) {
                this.reflectionMask = jsonData.reflectionMask;
            }
            if (jsonData.reflectionMaskChannel!==undefined) {
                this.reflectionMaskChannel = jsonData.reflectionMaskChannel;
            }
            if (jsonData.invertReflectionMask!==undefined) {
                this.reflectionMaskInvert = jsonData.reflectionMaskInvert;
            }

            if (jsonData.roughness!==undefined) {
                this.roughness = jsonData.roughness;
            }
            if (jsonData.roughnessMask!==undefined) {
                this.roughnessMask = jsonData.roughnessMask;
            }
            if (jsonData.roughnessMaskChannel!==undefined) {
                this.roughnessMaskChannel = jsonData.roughnessMaskChannel;
            }
            if (jsonData.invertRoughnessMask!==undefined) {
                this.roughnessMaskInvert = jsonData.roughnessMaskInvert;
            }

            if (jsonData.unlit!==undefined) {
                this.unlit = jsonData.unlit;
            }
        }
    }
    
    get modifierFlags() { return this._modifierFlags; }
    set modifierFlags(f) { this._modifierFlags = f; }
    setEnabled(flag) { this._modifierFlags = this._modifierFlags | flag; }
    isEnabled(flag) { return (this._modifierFlags & flag)!=0; }
    
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

    set diffuse(newVal) { this._diffuse = newVal; this.setEnabled(MaterialFlag.DIFFUSE); }
    set specular(newVal) { this._specular = newVal; this.setEnabled(MaterialFlag.SPECULAR); }
    set shininess(newVal) { if (!isNaN(newVal)) { this._shininess = newVal; this.setEnabled(MaterialFlag.SHININESS); } }
    set lightEmission(newVal) { if (!isNaN(newVal)) { this._lightEmission = newVal; this.setEnabled(MaterialFlag.LIGHT_EMISSION); } }
    set refractionAmount(newVal) { if (!isNaN(newVal)) { this._refractionAmount = newVal; this.setEnabled(MaterialFlag.REFRACTION_AMOUNT); } }
    set reflectionAmount(newVal) { if (!isNaN(newVal)) { this._reflectionAmount = newVal; this.setEnabled(MaterialFlag.REFLECTION_AMOUNT); } }
    set texture(newVal) { this._texture = newVal; this.setEnabled(MaterialFlag.TEXTURE); }
    set lightmap(newVal) { this._lightmap = newVal; this.setEnabled(MaterialFlag.LIGHT_MAP); }
    set normalMap(newVal) { this._normalMap = newVal; this.setEnabled(MaterialFlag.NORMAL_MAP); }
    set textureOffset(newVal) { this._textureOffset = newVal; this.setEnabled(MaterialFlag.TEXTURE_OFFSET); }
    set textureScale(newVal) { this._textureScale = newVal; this.setEnabled(MaterialFlag.TEXTURE_SCALE); }
    set lightmapOffset(newVal) { this._lightmapOffset = newVal; this.setEnabled(MaterialFlag.LIGHT_MAP_OFFSET); }
    set lightmapScale(newVal) { this._lightmapScale = newVal; this.setEnabled(MaterialFlag.LIGHT_MAP_SCALE); }
    set normalMapOffset(newVal) { this._normalMapOffset = newVal; this.setEnabled(MaterialFlag.NORMAL_MAP_OFFSET); }
    set normalMapScale(newVal) { this._normalMapScale = newVal; this.setEnabled(MaterialFlag.NORMAL_MAP_SCALE); }
    set castShadows(newVal) { this._castShadows = newVal; this.setEnabled(MaterialFlag.CAST_SHADOWS); }
    set receiveShadows(newVal) { this._receiveShadows = newVal; this.setEnabled(MaterialFlag.RECEIVE_SHADOWS); }
    set alphaCutoff(newVal) { if (!isNaN(newVal)) { this._alphaCutoff = newVal; this.setEnabled(MaterialFlag.ALPHA_CUTOFF); } }
    set shininessMask(newVal) { this._shininessMask = newVal; this.setEnabled(MaterialFlag.SHININESS_MASK); }
    set shininessMaskChannel(newVal) { this._shininessMaskChannel = newVal; this.setEnabled(MaterialFlag.SHININESS_MASK_CHANNEL); }
    set shininessMaskInvert(newVal) { this._shininessMaskInvert = newVal; this.setEnabled(MaterialFlag.SHININESS_MASK_INVERT); }
    set lightEmissionMask(newVal) { this._lightEmissionMask = newVal; this.setEnabled(MaterialFlag.LIGHT_EMISSION_MASK); }
    set lightEmissionMaskChannel(newVal) { this._lightEmissionMaskChannel = newVal; this.setEnabled(MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL); }
    set lightEmissionMaskInvert(newVal) { this._lightEmissionMaskInvert = newVal; this.setEnabled(MaterialFlag.LIGHT_EMISSION_MASK_INVERT); }
    set reflectionMask(newVal) { this._reflectionMask = newVal; this.setEnabled(MaterialFlag.REFLECTION_MASK); }
    set reflectionMaskChannel(newVal) { this._reflectionMaskChannel = newVal; this.setEnabled(MaterialFlag.REFLECTION_MASK_CHANNEL); }
    set reflectionMaskInvert(newVal) { this._reflectionMaskInvert = newVal; this.setEnabled(MaterialFlag.REFLECTION_MASK_INVERT); }
    set cullFace(newVal) { this._cullFace = newVal; this.setEnabled(MaterialFlag.CULL_FACE); }
    set roughness(newVal) { this._roughness = newVal; this.setEnabled(MaterialFlag.ROUGHNESS); }
    set roughnessMask(newVal) { this._roughnessMask = newVal; this.setEnabled(MaterialFlag.ROUGHNESS); }
    set roughnessMaskChannel(newVal) { this._roughnessMaskChannel = newVal; this.setEnabled(MaterialFlag.ROUGHNESS); }
    set roughnessMaskInvert(newVal) { this._roughnessMaskInvert = newVal; this.setEnabled(MaterialFlag.ROUGHNESS); }
    set unlit(newVal) { this._unlit = newVal; this.setEnabled(MaterialFlag.UNLIT); }

    clone() {
        let copy = new MaterialModifier();
        copy.assign(this);
        return copy;
    }
    
    assign(mod) {
        this._modifierFlags = mod._modifierFlags;

        this._diffuse = mod._diffuse;
        this._specular = mod._specular;
        this._shininess = mod._shininess;
        this._lightEmission = mod._lightEmission;
        this._refractionAmount = mod._refractionAmount;
        this._reflectionAmount = mod._reflectionAmount;
        this._texture = mod._texture;
        this._lightmap = mod._lightmap;
        this._normalMap = mod._normalMap;
        this._textureOffset = mod._textureOffset;
        this._textureScale = mod._textureScale;
        this._lightmapOffset = mod._lightmapOffset;
        this._lightmapScale = mod._lightmapScale;
        this._normalMapOffset = mod._normalMapOffset;
        this._normalMapScale = mod._normalMapScale;
        this._castShadows = mod._castShadows;
        this._receiveShadows = mod._receiveShadows;
        this._alphaCutoff = mod._alphaCutoff;
        this._shininessMask = mod._shininessMask;
        this._shininessMaskChannel = mod._shininessMaskChannel;
        this._shininessMaskInvert = mod._shininessMaskInvert;
        this._lightEmissionMask = mod._lightEmissionMask;
        this._lightEmissionMaskChannel = mod._lightEmissionMaskChannel;
        this._lightEmissionMaskInvert = mod._lightEmissionMaskInvert;
        this._reflectionMask = mod._reflectionMask;
        this._reflectionMaskChannel = mod._reflectionMaskChannel;
        this._reflectionMaskInvert = mod._reflectionMaskInvert;
        this._cullFace = mod._cullFace;
        this._roughness = mod._roughness;
        this._roughnessMask = mod._roughnessMask;
        this._roughnessMaskChannel = mod._roughnessMaskChannel;
        this._roughnessMaskInvert = mod._roughnessMaskInvert;
        this._unlit = mod._unlit;
    }

    serialize() {
        let result = {};
        let mask = this._modifierFlags;

        if ( mask & MaterialFlag.DIFFUSE) {
            result.diffuseR = this._diffuse.r;
            result.diffuseG = this._diffuse.g;
            result.diffuseB = this._diffuse.b;
            result.diffuseA = this._diffuse.a;
        }
        if ( mask & MaterialFlag.SPECULAR) {
            result.specularR = this._specular.r;
            result.specularG = this._specular.g;
            result.specularB = this._specular.b;
            result.specularA = this._specular.a;
        }
        if ( mask & MaterialFlag.SHININESS) {
            result.shininess = this._shininess;
        }
        if ( mask & MaterialFlag.SHININESS_MASK) {
            result.shininessMask = this._shininessMask;
        }
        if ( mask & MaterialFlag.SHININESS_MASK_CHANNEL) {
            result.shininessMaskChannel = this._shininessMaskChannel;
        }
        if ( mask & MaterialFlag.SHININESS_MASK_INVERT) {
            result.invertShininessMask = this._shininessMaskInvert;
        }
        if ( mask & MaterialFlag.LIGHT_EMISSION) {
            result.lightEmission = this._lightEmission;
        }
        if ( mask & MaterialFlag.LIGHT_EMISSION_MASK) {
            result.lightEmissionMask = this._lightEmissionMask;
        }
        if ( mask & MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL) {
            result.lightEmissionMaskChannel = this._lightEmissionMaskChannel;
        }
        if ( mask & MaterialFlag.LIGHT_EMISSION_MASK_INVERT) {
            result.invertLightEmissionMask = this._lightEmissionMaskInvert;
        }
        if ( mask & MaterialFlag.REFRACTION_AMOUNT) {
            result.reflectionAmount = this._refractionAmount;
        }
        if ( mask & MaterialFlag.REFLECTION_AMOUNT) {
            result.refractionAmount = this._reflectionAmount;
        }
        if ( mask & MaterialFlag.TEXTURE) {
            result.texture = this._texture;
        }
        if ( mask & MaterialFlag.LIGHT_MAP) {
            result.lightmap = this._lightmap;
        }
        if ( mask & MaterialFlag.NORMAL_MAP) {
            result.normalMap = this._normalMap;
        }
        if ( mask & MaterialFlag.TEXTURE_OFFSET) {
            result.textureScaleX = this._textureScale.x;
            result.textureScaleY = this._textureScale.y;
        }
        if ( mask & MaterialFlag.TEXTURE_SCALE) {
            result.textureScaleX = this._textureScale.x;
            result.textureScaleY = this._textureScale.y;
        }
        if ( mask & MaterialFlag.LIGHT_MAP_OFFSET) {
            result.lightmapOffsetX = this._lightmapOffset.x;
            result.lightmapOffsetY = this._lightmapOffset.y;
        }
        if ( mask & MaterialFlag.LIGHT_MAP_SCALE) {
            result.lightmapScaleX = this._lightmapScale.x;
            result.lightmapScaleY = this._lightmapScale.y;
        }
        if ( mask & MaterialFlag.NORMAL_MAP_OFFSET) {
            result.normalMapOffsetX = this._normalMapOffset.x;
            result.normalMapOffsetY = this._normalMapOffset.y;
        }
        if ( mask & MaterialFlag.NORMAL_MAP_SCALE) {
            result.normalMapScaleX = this._normalMapScale.x;
            result.normalMapScaleY = this._normalMapScale.y;
        }
        if ( mask & MaterialFlag.CAST_SHADOWS) {
            result.castShadows = this._castShadows;
        }
        if ( mask & MaterialFlag.RECEIVE_SHADOWS) {
            result.receiveShadows = this._receiveShadows;
        }
        if ( mask & MaterialFlag.ALPHA_CUTOFF) {
            result.alphaCutoff = this._alphaCutoff;
        }
        if ( mask & MaterialFlag.REFLECTION_MASK) {
            result.reflectionMask = this._reflectionMask;
        }
        if ( mask & MaterialFlag.REFLECTION_MASK_CHANNEL) {
            result.reflectionMaskChannel = this._reflectionMaskChannel;
        }
        if ( mask & MaterialFlag.REFLECTION_MASK_INVERT) {
            result.invertReflectionMask = this._reflectionMaskInvert;
        }
        if ( mask & MaterialFlag.CULL_FACE) {
            result.cullFace = this._cullFace;
        }
        if ( mask & MaterialFlag.ROUGHNESS) {
            result.roughness = this._roughness;
            result.roughnessMask = this._roughnessMask;
            result.roughnessMaskChannel = this._roughnessMaskChannel;
            result.invertRoughnessMask = this._roughnessMaskInvert;
        }
        if (mask & MaterialFlag.UNLIT) {
            result.unlit = this._unlit;
        }
        return result;
    }
}
