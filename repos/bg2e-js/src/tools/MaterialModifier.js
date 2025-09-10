import {
    deserializeColorTexture,
    deserializeVector,
    deserializeValueTexture
} from "../base/Material";
import Texture from "../base/Texture";

const checkImageData = (texture) => {
    return texture instanceof Texture ? texture.loadImageData() : Promise.resolve();
}

export default class MaterialModifier {
    constructor(jsonData = null) {
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

            if (jsonData.diffuse !== undefined) {
                this.diffuse = jsonData.diffuse;
            }

            if (jsonData.diffuseScale !== undefined) {
                this.diffuseScale = jsonData.diffuseScale;
            }

            if (jsonData.fresnel !== undefined) {
                this.fresnel = jsonData.fresnel;
            }

            if (jsonData.isTransparent !== undefined) {
                this.isTransparent = jsonData.isTransparent;
            }

            if (jsonData.lightEmission !== undefined) {
                this.lightEmission = jsonData.lightEmission;
            }

            if (jsonData.lightEmissionChannel !== undefined) {
                this.lightEmissionChannel = jsonData.lightEmissionChannel;
            }

            if (jsonData.lightEmissionScale !== undefined) {
                this.lightEmissionScale = jsonData.lightEmissionScale;
            }

            if (jsonData.metallic !== undefined) {
                this.metallic = jsonData.metallic;
            }

            if (jsonData.metallicChannel !== undefined) {
                this.metallicChannel = jsonData.metallicChannel;
            }

            if (jsonData.metallicScale !== undefined) {
                this.metallicScale = jsonData.metallicScale;
            }

            if (jsonData.normal !== undefined) {
                this.normal = jsonData.normal;
            }

            if (jsonData.normalScale !== undefined) {
                this.normalScale = jsonData.normalScale;
            }

            if (jsonData.roughness !== undefined) {
                this.roughness = jsonData.roughness;
            }

            if (jsonData.roughnessChannel !== undefined) {
                this.roughnessChannel = jsonData.roughnessChannel;
            }

            if (jsonData.roughnessScale !== undefined) {
                this.roughnessScale = jsonData.roughnessScale;
            }

            if (jsonData.unlit !== undefined) {
                this.unlit = jsonData.unlit;
            }

        }
    }

    get alphaCutoff() { return this._alphaCutoff; }
    set alphaCutoff(v) { this._alphaCutoff = v; }

    get castShadows() { return this._castShadows; }
    set castShadows(v) { this._castShadows = v; }

    get diffuse() { return this._diffuse; }
    set diffuse(v) { this._diffuse = v; }

    get diffuseScale() { return this._diffuseScale; }
    set diffuseScale(v) { this._diffuseScale = v; }

    get fresnel() { return this._fresnel; }
    set fresnel(v) { this._fresnel = v; }

    get isTransparent() { return this._isTransparent; }
    set isTransparent(v) { this._isTransparent = v; }

    get lightEmission() { return this._lightEmission; }
    set lightEmission(v) { this._lightEmission = v; }

    get lightEmissionChannel() { return this._lightEmissionChannel; }
    set lightEmissionChannel(v) { this._lightEmissionChannel = v; }

    get lightEmissionScale() { return this._lightEmissionScale; }
    set lightEmissionScale(v) { this._lightEmissionScale = v; }

    get metallic() { return this._metallic; }
    set metallic(v) { this._metallic = v; }

    get metallicChannel() { return this._metallicChannel; }
    set metallicChannel(v) { this._metallicChannel = v; }

    get metallicScale() { return this._metallicScale; }
    set metallicScale(v) { this._metallicScale = v; }

    get normal() { return this._normal; }
    set normal(v) { this._normal = v; }

    get normalScale() { return this._normalScale; }
    set normalScale(v) { this._normalScale = v; }

    get roughness() { return this._roughness; }
    set roughness(v) { this._roughness = v; }

    get roughnessChannel() { return this._roughnessChannel; }
    set roughnessChannel(v) { this._roughnessChannel = v; }

    get roughnessScale() { return this._roughnessScale; }
    set roughnessScale(v) { this._roughnessScale = v; }

    get unlit() { return this._unlit; }
    set unlit(v) { this._unlit = v; }

    async applyModifier(material, relativePath = "") {
        const promises = [];
        if (this.alphaCutoff !== undefined) {
            material.alphaCutoff = this.alphaCutoff;
        }

        if (this.castShadows !== undefined) {
            material.castShadows = this.castShadows;
        }

        if (this.diffuse !== undefined) {
            material.diffuse = deserializeColorTexture(this.diffuse, relativePath);
            promises.push(checkImageData(material.diffuse));
        }

        if (this.diffuseScale !== undefined) {
            material.diffuseScale = deserializeVector(this.diffuseScale);
        }

        if (this.fresnel !== undefined) {
            material.fresnel = deserializeVector(this.fresnel);
        }

        if (this.isTransparent !== undefined) {
            material.isTransparent = this.isTransparent;
        }

        if (this.lightEmission !== undefined) {

        }

        if (this.lightEmissionChannel !== undefined) {

        }

        if (this.lightEmissionScale !== undefined) {

        }

        if (this.metallic !== undefined) {
            material.metallic = deserializeValueTexture(this.metallic, relativePath);
            promises.push(checkImageData(material.metallic));
        }

        if (this.metallicChannel !== undefined) {
            material.metallicChannel = this.metallicChannel;
        }

        if (this.metallicScale !== undefined) {
            material.metallicScale = deserializeVector(this.metallicScale);
        }

        if (this.normal !== undefined) {
            material.normal = deserializeColorTexture(this.normal, relativePath);
            promises.push(checkImageData(material.normal));
        }

        if (this.normalScale !== undefined) {
            material.normalScale = deserializeVector(this.normalScale);
        }

        if (this.roughness !== undefined) {
            material.roughness = deserializeValueTexture(this.roughness, relativePath);
            promises.push(checkImageData(material.roughness));
        }

        if (this.roughnessChannel !== undefined) {
            material.roughnessChannel = this.roughnessChannel;
        }

        if (this.roughnessScale !== undefined) {
            material.roughnessScale = deserializeVector(this.roughnessScale);
        }

        if (this.unlit !== undefined) {
            material.unlit = this.unlit;
        }
        await Promise.allSettled(promises);
    }

}