

export default class Environment {
    constructor() {
        this._renderer = null;

        this._equirectangularTexture = null;
        this._irradianceIntensity = 1;
        this._showSkybox = true;
        this._cubemapSize = 512;
        this._irradianceMapSize = 32;
        this._specularMapSize = 32;
        this._specularMapL2Size = 32;

        this._dirty = true;
    }

    get equirectangularTexture() { return this._equirectangularTexture; }
    set equirectangularTexture(t) { this._equirectangularTexture = t; this._dirty = true; }
    get irradianceIntensity() { return this._irradianceIntensity; }
    set irradianceIntensity(value) { this._irradianceIntensity = value; this._dirty = true}
    get showSkybox() { return this._showSkybox; }
    set showSkybox(value) { this._showSkybox = value; this._dirty = true}
    get cubemapSize() { return this._cubemapSize; }
    set cubemapSize(value) { this._cubemapSize = value; this._dirty = true}
    get irradianceMapSize() { return this._irradianceMapSize; }
    set irradianceMapSize(value) { this._irradianceMapSize = value; this._dirty = true}
    get specularMapSize() { return this._specularMapSize; }
    set specularMapSize(value) { this._specularMapSize = value; this._dirty = true}
    get specularMapL2Size() { return this._specularMapL2Size; }
    set specularMapL2Size(value) { this._specularMapL2Size = value; this._dirty = true}

    get renderer() {
        return this._renderer;
    }

    destroy() {
        if (this.renderer) {
            this.renderer.destroy();
        }
    }
    
    clone() {
        const result = new SkyCube();
        result.assign(this);
        return result;
    }

    assign(other) {
        this.equirectangularTexture = other.equirectangularTexture;
        this.irradianceIntensity = other.irradianceIntensity;
        this.showSkybox = other.showSkybox;
        this.cubemapSize = other.cubemapSize;
        this.irradianceMapSize = other.irradianceMapSize;
        this.specularMapSize = other.specularMapSize;
        this.specularMapL2Size = other.specularMapL2Size;
    }

    async deserialize(sceneData) {
        this.equirectangularTexture = sceneData.equirectangularTexture || this.equirectangularTexture;
        this.irradianceIntensity = sceneData.irradianceIntensity || this.irradianceIntensity;
        this.showSkybox = sceneData.showSkybox || this.showSkybox;
        this.cubemapSize = sceneData.cubemapSize || this.cubemapSize;
        this.irradianceMapSize = sceneData.irradianceMapSize || this.irradianceMapSize;
        this.specularMapSize = sceneData.specularMapSize || this.specularMapSize;
        this.specularMapL2Size = sceneData.specularMapL2Size || this.specularMapL2Size;
    }

    async serialize(sceneData) {
        sceneData.equirectangularTexture = this.equirectangularTexture;
        sceneData.irradianceIntensity = this.irradianceIntensity;
        sceneData.showSkybox = this.showSkybox;
        sceneData.cubemapSize = this.cubemapSize;
        sceneData.irradianceMapSize = this.irradianceMapSize;
        sceneData.specularMapSize = this.specularMapSize;
        sceneData.specularMapL2Size = this.specularMapL2Size;
    } 
}