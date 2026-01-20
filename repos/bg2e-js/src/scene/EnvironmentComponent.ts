import { jointUrl } from "../tools/Resource";
import Component from "./Component";
import EnvironmentRenderer from "../render/Environment";

export default class EnvironmentComponent extends Component {
    private _equirectangularTexture: string;
    private _irradianceIntensity: number;
    private _showSkybox: boolean;
    private _cubemapSize: number;
    private _irradianceMapSize: number;
    private _specularMapSize: number;
    private _specularMapL2Size: number;
    private _environment: EnvironmentRenderer | null;

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

    set equirectangularTexture(v: string) {
        this._equirectangularTexture = v;
    }

    get equirectangularTexture(): string {
        return this._equirectangularTexture;
    }

    set irradianceIntensity(v: number) {
        this._irradianceIntensity = v;
    }

    get irradianceIntensity(): number {
        return this._irradianceIntensity;
    }

    set showSkybox(v: boolean) {
        this._showSkybox = v;
    }

    get showSkybox(): boolean {
        return this._showSkybox;
    }

    set cubemapSize(v: number) {
        this._cubemapSize = v;
    }

    get cubemapSize(): number {
        return this._cubemapSize;
    }

    set irradianceMapSize(v: number) {
        this._irradianceMapSize = v;
    }

    get irradianceMapSize(): number {
        return this._irradianceMapSize;
    }

    set specularMapSize(v: number) {
        this._specularMapSize = v;
    }

    get specularMapSize(): number {
        return this._specularMapSize;
    }

    set specularMapL2Size(v: number) {
        this._specularMapL2Size = v;
    }

    get specularMapL2Size(): number {
        return this._specularMapL2Size;
    }

    get environment(): any {
        return this._environment;
    }

    clone(): EnvironmentComponent {
        const result = new EnvironmentComponent();
        result.assign(this);
        return result;
    }

    assign(other: EnvironmentComponent): void {
        this.equirectangularTexture = other.equirectangularTexture;
        this.irradianceIntensity = other.irradianceIntensity;
        this.showSkybox = other.showSkybox;
        this.cubemapSize = other.cubemapSize;
        this.irradianceMapSize = other.irradianceMapSize;
        this.specularMapSize = other.specularMapSize;
        this.specularMapL2Size = other.specularMapL2Size;
    }

    async deserialize(sceneData: any, loader: any): Promise<void> {
        super.deserialize(sceneData, loader);
        if (loader.currentPath && sceneData.equirectangularTexture) {
            this.equirectangularTexture = jointUrl(loader.currentPath, sceneData.equirectangularTexture);
        }
        this.irradianceIntensity = sceneData.irradianceIntensity || this.irradianceIntensity;
        this.showSkybox = sceneData.showSkybox ?? this.showSkybox;
        this.cubemapSize = sceneData.cubemapSize || this.cubemapSize;
        this.irradianceMapSize = sceneData.irradianceMapSize || this.irradianceMapSize;
        this.specularMapSize = sceneData.specularMapSize || this.specularMapSize;
        this.specularMapL2Size = sceneData.specularMapL2Size || this.specularMapL2Size;
    }

    async serialize(sceneData: any, writer: any): Promise<void> {
        await super.serialize(sceneData, writer);
        throw Error("EnvironmentComponent.serialize(): not implemented");
    }

    async init(): Promise<void> {
        this._environment = this.renderer?.factory.environment()!;
        if (!this._environment) {
            throw new Error("EnvironmentComponent.init(): unexpected error. Unable to create environment object from renderer factory");
        }

        if (!this.equirectangularTexture) {
            return;
        }

        await this._environment.load({
            // @ts-ignore TODO: convert render/Environment.js to TS
            textureUrl: this.equirectangularTexture,
            environmentMapSize: [ this.cubemapSize, this.cubemapSize ],
            specularMapSize: [ this.specularMapSize, this.specularMapSize ],
            irradianceMapSize: [ this.irradianceMapSize, this.irradianceMapSize ]
        });
    }
}