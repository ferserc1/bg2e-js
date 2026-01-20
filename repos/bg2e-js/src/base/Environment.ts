import Texture from './Texture';
import type Renderer from '../render/Renderer';

/**
 * Serializable data for Environment.
 * Properties are optional because deserialization commonly receives partial objects.
 */
export interface EnvironmentSceneData {
    equirectangularTexture?: Texture | null;
    irradianceIntensity?: number;
    showSkybox?: boolean;
    cubemapSize?: number;
    irradianceMapSize?: number;
    specularMapSize?: number;
    specularMapL2Size?: number;
}

/**
 * Environment configuration for image-based lighting and skybox rendering.
 */
export default class Environment {
    private _equirectangularTexture: Texture | null;
    private _irradianceIntensity: number;
    private _showSkybox: boolean;
    private _cubemapSize: number;
    private _irradianceMapSize: number;
    private _specularMapSize: number;
    private _specularMapL2Size: number;
    private _dirty: boolean;

    constructor() {
        this._equirectangularTexture = null;
        this._irradianceIntensity = 1;
        this._showSkybox = true;
        this._cubemapSize = 512;
        this._irradianceMapSize = 32;
        this._specularMapSize = 32;
        this._specularMapL2Size = 32;
        this._dirty = true;
    }

    /**
     * Equirectangular texture used for environment mapping
     */
    get equirectangularTexture(): Texture | null { 
        return this._equirectangularTexture; 
    }
    
    set equirectangularTexture(t: Texture | null) { 
        this._equirectangularTexture = t; 
        this._dirty = true; 
    }

    /**
     * Intensity multiplier for irradiance calculations
     */
    get irradianceIntensity(): number { 
        return this._irradianceIntensity; 
    }
    
    set irradianceIntensity(value: number) { 
        this._irradianceIntensity = value; 
        this._dirty = true;
    }

    /**
     * Whether to display the skybox
     */
    get showSkybox(): boolean { 
        return this._showSkybox; 
    }
    
    set showSkybox(value: boolean) { 
        this._showSkybox = value; 
        this._dirty = true;
    }

    /**
     * Resolution of the environment cubemap
     */
    get cubemapSize(): number { 
        return this._cubemapSize; 
    }
    
    set cubemapSize(value: number) { 
        this._cubemapSize = value; 
        this._dirty = true;
    }

    /**
     * Resolution of the irradiance map
     */
    get irradianceMapSize(): number { 
        return this._irradianceMapSize; 
    }
    
    set irradianceMapSize(value: number) { 
        this._irradianceMapSize = value; 
        this._dirty = true;
    }

    /**
     * Resolution of the specular map
     */
    get specularMapSize(): number { 
        return this._specularMapSize; 
    }
    
    set specularMapSize(value: number) { 
        this._specularMapSize = value; 
        this._dirty = true;
    }

    /**
     * Resolution of the second level specular map
     */
    get specularMapL2Size(): number { 
        return this._specularMapL2Size; 
    }
    
    set specularMapL2Size(value: number) { 
        this._specularMapL2Size = value; 
        this._dirty = true;
    }

    /**
     * Destroys the renderer resources
     */
    destroy(): void {
        
    }
    
    /**
     * Creates a deep copy of this environment
     */
    clone(): Environment {
        const result = new Environment();
        result.assign(this);
        return result;
    }

    /**
     * Copies properties from another environment instance
     * @param other - The environment to copy from
     */
    assign(other: Environment): void {
        this.equirectangularTexture = other.equirectangularTexture;
        this.irradianceIntensity = other.irradianceIntensity;
        this.showSkybox = other.showSkybox;
        this.cubemapSize = other.cubemapSize;
        this.irradianceMapSize = other.irradianceMapSize;
        this.specularMapSize = other.specularMapSize;
        this.specularMapL2Size = other.specularMapL2Size;
    }

    /**
     * Deserializes environment data from a scene data object
     * @param sceneData - The serialized environment data
     */
    async deserialize(sceneData: EnvironmentSceneData): Promise<void> {
        this.equirectangularTexture = sceneData.equirectangularTexture || this.equirectangularTexture;
        this.irradianceIntensity = sceneData.irradianceIntensity || this.irradianceIntensity;
        this.showSkybox = sceneData.showSkybox || this.showSkybox;
        this.cubemapSize = sceneData.cubemapSize || this.cubemapSize;
        this.irradianceMapSize = sceneData.irradianceMapSize || this.irradianceMapSize;
        this.specularMapSize = sceneData.specularMapSize || this.specularMapSize;
        this.specularMapL2Size = sceneData.specularMapL2Size || this.specularMapL2Size;
    }

    /**
     * Serializes environment data to a scene data object
     * @param sceneData - The object to populate with serialized data
     */
    async serialize(sceneData: EnvironmentSceneData): Promise<void> {
        sceneData.equirectangularTexture = this.equirectangularTexture;
        sceneData.irradianceIntensity = this.irradianceIntensity;
        sceneData.showSkybox = this.showSkybox;
        sceneData.cubemapSize = this.cubemapSize;
        sceneData.irradianceMapSize = this.irradianceMapSize;
        sceneData.specularMapSize = this.specularMapSize;
        sceneData.specularMapL2Size = this.specularMapL2Size;
    } 
}
