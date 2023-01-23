import Component from "./Component";

export default class EnvironmentComponent extends Component {
    constructor() {
        super("Environment");

        this._equirectangularTexture = "";
        this._irradianceIntensity = 1;
        this._showSkybox = true;
        this._cubemapSize = 512;
        this._irradianceMapSize = 32;
        this._specularMapSize = 32;
        this._specularMapL2Size = 32;

        // Non-serializable attribute
        this._environment = null;
    }

    set equirectangularTexture(v) {
        this._equirectangularTexture = v;
    }

    get equirectangularTexture() {
        return this._equirectangularTexture;
    }

    set irradianceIntensity(v) {
        this._irradianceIntensity = v;
    }

    get irradianceIntensity() {
        return this._irradianceIntensity;
    }

    set showSkybox(v) {
        this._showSkybox = v;
    }

    get showSkybox() {
        return this._showSkybox;
    }

    set cubemapSize(v) {
        this._cubemapSize = v;
    }

    get cubemapSize() {
        return this._cubemapSize;
    }

    set irradianceMapSize(v) {
        this._irradianceMapSize = v;
    }

    get irradianceMapSize() {
        return this._irradianceMapSize;
    }

    set specularMapSize(v) {
        this._specularMapSize = v;
    }

    get specularMapSize() {
        return this._specularMapSize;
    }

    set specularMapL2Size(v) {
        this._specularMapL2Size = v;
    }

    get specularMapL2Size() {
        return this._specularMapL2Size;
    }

    get environment() {
        return this._environment;
    }

    clone() {
        const result = new EnvironmentComponent();
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

    async deserialize(sceneData,loader) {
        super.deserialize(sceneData,loader);
        this.equirectangularTexture = sceneData.equirectangularTexture || this.equirectangularTexture;
        this.irradianceIntensity = sceneData.irradianceIntensity || this.irradianceIntensity;
        this.showSkybox = sceneData.showSkybox || this.showSkybox;
        this.cubemapSize = sceneData.cubemapSize || this.cubemapSize;
        this.irradianceMapSize = sceneData.irradianceMapSize || this.irradianceMapSize;
        this.specularMapSize = sceneData.specularMapSize || this.specularMapSize;
        this.specularMapL2Size = sceneData.specularMapL2Size || this.specularMapL2Size;
    }

    async serialize(sceneData,writer) {
        await super.serialize(sceneData,writer);
        throw Error("EnvironmentComponent.serialize(): not implemented");
    }

    async init() {
        this._environment = this.renderer.factory.environment();
        await this._environment.load({
            textureUrl: this.equirectangularTexture,
            environmentMapSize: [ this.cubemapSize, this.cubemapSize ],
            specularMapSize: [ this.specularMapSize, this.specularMapSize ],
            irradianceMapSize: [ this.irradianceMapSize, this.irradianceMapSize ]
        });
    }
}