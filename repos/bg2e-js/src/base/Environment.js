/**
 * Serializable data for {@link Environment}.
 *
 * Note: properties are optional because deserialization commonly receives partial objects.
 *
 * @typedef {Object} EnvironmentSceneData
 * @property {import('./Texture').default | null} [equirectangularTexture]
 * @property {number} [irradianceIntensity]
 * @property {boolean} [showSkybox]
 * @property {number} [cubemapSize]
 * @property {number} [irradianceMapSize]
 * @property {number} [specularMapSize]
 * @property {number} [specularMapL2Size]
 */

export default class Environment {
    constructor() {
        /** @type {import('../render/Renderer').default | null} */
        this._renderer = null;

        /** @type {import('./Texture').default | null} */
        this._equirectangularTexture = null;
        /** @type {number} */
        this._irradianceIntensity = 1;
        /** @type {boolean} */
        this._showSkybox = true;
        /** @type {number} */
        this._cubemapSize = 512;
        /** @type {number} */
        this._irradianceMapSize = 32;
        /** @type {number} */
        this._specularMapSize = 32;
        /** @type {number} */
        this._specularMapL2Size = 32;

        /** @type {boolean} */
        this._dirty = true;
    }

    /** @returns {import('./Texture').default | null} */
    get equirectangularTexture() { return this._equirectangularTexture; }
    /** @param {import('./Texture').default | null} t */
    set equirectangularTexture(t) { this._equirectangularTexture = t; this._dirty = true; }
    /** @returns {number} */
    get irradianceIntensity() { return this._irradianceIntensity; }
    /** @param {number} value */
    set irradianceIntensity(value) { this._irradianceIntensity = value; this._dirty = true}
    /** @returns {boolean} */
    get showSkybox() { return this._showSkybox; }
    /** @param {boolean} value */
    set showSkybox(value) { this._showSkybox = value; this._dirty = true}
    /** @returns {number} */
    get cubemapSize() { return this._cubemapSize; }
    /** @param {number} value */
    set cubemapSize(value) { this._cubemapSize = value; this._dirty = true}
    /** @returns {number} */
    get irradianceMapSize() { return this._irradianceMapSize; }
    /** @param {number} value */
    set irradianceMapSize(value) { this._irradianceMapSize = value; this._dirty = true}
    /** @returns {number} */
    get specularMapSize() { return this._specularMapSize; }
    /** @param {number} value */
    set specularMapSize(value) { this._specularMapSize = value; this._dirty = true}
    /** @returns {number} */
    get specularMapL2Size() { return this._specularMapL2Size; }
    /** @param {number} value */
    set specularMapL2Size(value) { this._specularMapL2Size = value; this._dirty = true}

    /** @returns {import('../render/Renderer').default | null} */
    get renderer() {
        return this._renderer;
    }

    /** @returns {void} */
    destroy() {
        if (this.renderer) {
            this.renderer.destroy();
        }
    }
    
    /** @returns {Environment} */
    clone() {
        const result = new Environment();
        result.assign(this);
        return result;
    }

    /** @param {Environment} other */
    assign(other) {
        this.equirectangularTexture = other.equirectangularTexture;
        this.irradianceIntensity = other.irradianceIntensity;
        this.showSkybox = other.showSkybox;
        this.cubemapSize = other.cubemapSize;
        this.irradianceMapSize = other.irradianceMapSize;
        this.specularMapSize = other.specularMapSize;
        this.specularMapL2Size = other.specularMapL2Size;
    }

    /**
     * @param {EnvironmentSceneData} sceneData
     * @returns {Promise<void>}
     */
    async deserialize(sceneData) {
        this.equirectangularTexture = sceneData.equirectangularTexture || this.equirectangularTexture;
        this.irradianceIntensity = sceneData.irradianceIntensity || this.irradianceIntensity;
        this.showSkybox = sceneData.showSkybox || this.showSkybox;
        this.cubemapSize = sceneData.cubemapSize || this.cubemapSize;
        this.irradianceMapSize = sceneData.irradianceMapSize || this.irradianceMapSize;
        this.specularMapSize = sceneData.specularMapSize || this.specularMapSize;
        this.specularMapL2Size = sceneData.specularMapL2Size || this.specularMapL2Size;
    }

    /**
     * @param {EnvironmentSceneData} sceneData
     * @returns {Promise<void>}
     */
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