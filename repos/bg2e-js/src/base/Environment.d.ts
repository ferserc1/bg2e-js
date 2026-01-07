import Texture from './Texture';
import Renderer from '../render/Renderer';

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
    constructor();

    /**
     * The renderer instance associated with this environment
     */
    get renderer(): Renderer | null;

    /**
     * Equirectangular texture used for environment mapping
     */
    get equirectangularTexture(): Texture | null;
    set equirectangularTexture(value: Texture | null);

    /**
     * Intensity multiplier for irradiance calculations
     */
    get irradianceIntensity(): number;
    set irradianceIntensity(value: number);

    /**
     * Whether to display the skybox
     */
    get showSkybox(): boolean;
    set showSkybox(value: boolean);

    /**
     * Resolution of the environment cubemap
     */
    get cubemapSize(): number;
    set cubemapSize(value: number);

    /**
     * Resolution of the irradiance map
     */
    get irradianceMapSize(): number;
    set irradianceMapSize(value: number);

    /**
     * Resolution of the specular map
     */
    get specularMapSize(): number;
    set specularMapSize(value: number);

    /**
     * Resolution of the second level specular map
     */
    get specularMapL2Size(): number;
    set specularMapL2Size(value: number);

    /**
     * Destroys the renderer resources
     */
    destroy(): void;

    /**
     * Creates a deep copy of this environment
     */
    clone(): Environment;

    /**
     * Copies properties from another environment instance
     * @param other - The environment to copy from
     */
    assign(other: Environment): void;

    /**
     * Deserializes environment data from a scene data object
     * @param sceneData - The serialized environment data
     */
    deserialize(sceneData: EnvironmentSceneData): Promise<void>;

    /**
     * Serializes environment data to a scene data object
     * @param sceneData - The object to populate with serialized data
     */
    serialize(sceneData: EnvironmentSceneData): Promise<void>;
}
