import {
    textureTypeLoader,
    colorTypeLoader,
    vectorTypeLoader,
    primitiveTypeLoader
} from "../base/Material";
import Material from "../base/Material";
import Texture from "../base/Texture";
import Vec from "../math/Vec";
import Color from "../base/Color";

const checkImageData = (texture: Texture | Color | number | null): Promise<void> => {
    return texture instanceof Texture ? texture.loadImageData() : Promise.resolve();
}

interface MaterialModifierData {
    class?: string;
    alphaCutoff?: number;
    castShadows?: boolean;
    diffuse?: any;
    diffuseScale?: any;
    fresnel?: any;
    isTransparent?: boolean;
    lightEmission?: any;
    lightEmissionChannel?: number;
    lightEmissionScale?: any;
    metallic?: any;
    metallicChannel?: number;
    metallicScale?: any;
    normal?: any;
    normalScale?: any;
    roughness?: any;
    roughnessChannel?: number;
    roughnessScale?: any;
    unlit?: boolean;
}

// TODO: Update all material properties (difuse -> albedo, etc)
export default class MaterialModifier {
    private _alphaCutoff?: number;
    private _castShadows?: boolean;
    private _diffuse?: any;
    private _diffuseScale?: any;
    private _fresnel?: any;
    private _isTransparent?: boolean;
    private _lightEmission?: any;
    private _lightEmissionChannel?: number;
    private _lightEmissionScale?: any;
    private _metallic?: any;
    private _metallicChannel?: number;
    private _metallicScale?: any;
    private _normal?: any;
    private _normalScale?: any;
    private _roughness?: any;
    private _roughnessChannel?: number;
    private _roughnessScale?: any;
    private _unlit?: boolean;

    constructor(jsonData: MaterialModifierData | null = null) {
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

    get alphaCutoff(): number | undefined { return this._alphaCutoff; }
    set alphaCutoff(v: number | undefined) { this._alphaCutoff = v; }

    get castShadows(): boolean | undefined { return this._castShadows; }
    set castShadows(v: boolean | undefined) { this._castShadows = v; }

    get diffuse(): any { return this._diffuse; }
    set diffuse(v: any) { this._diffuse = v; }

    get diffuseScale(): any { return this._diffuseScale; }
    set diffuseScale(v: any) { this._diffuseScale = v; }

    get fresnel(): any { return this._fresnel; }
    set fresnel(v: any) { this._fresnel = v; }

    get isTransparent(): boolean | undefined { return this._isTransparent; }
    set isTransparent(v: boolean | undefined) { this._isTransparent = v; }

    get lightEmission(): any { return this._lightEmission; }
    set lightEmission(v: any) { this._lightEmission = v; }

    get lightEmissionChannel(): number | undefined { return this._lightEmissionChannel; }
    set lightEmissionChannel(v: number | undefined) { this._lightEmissionChannel = v; }

    get lightEmissionScale(): any { return this._lightEmissionScale; }
    set lightEmissionScale(v: any) { this._lightEmissionScale = v; }

    get metallic(): any { return this._metallic; }
    set metallic(v: any) { this._metallic = v; }

    get metallicChannel(): number | undefined { return this._metallicChannel; }
    set metallicChannel(v: number | undefined) { this._metallicChannel = v; }

    get metallicScale(): any { return this._metallicScale; }
    set metallicScale(v: any) { this._metallicScale = v; }

    get normal(): any { return this._normal; }
    set normal(v: any) { this._normal = v; }

    get normalScale(): any { return this._normalScale; }
    set normalScale(v: any) { this._normalScale = v; }

    get roughness(): any { return this._roughness; }
    set roughness(v: any) { this._roughness = v; }

    get roughnessChannel(): number | undefined { return this._roughnessChannel; }
    set roughnessChannel(v: number | undefined) { this._roughnessChannel = v; }

    get roughnessScale(): any { return this._roughnessScale; }
    set roughnessScale(v: any) { this._roughnessScale = v; }

    get unlit(): boolean | undefined { return this._unlit; }
    set unlit(v: boolean | undefined) { this._unlit = v; }

    async applyModifier(material: Material, relativePath: string = ""): Promise<void> {
        const promises: Promise<void>[] = [];
        if (this.alphaCutoff !== undefined) {
            material.alphaCutoff = this.alphaCutoff;
        }

        if (this.castShadows !== undefined) {
            material.castShadows = this.castShadows;
        }

        // TODO: diffuse -> albedo or albedoTexture
        if (this.diffuse !== undefined) {
            //(material as any).diffuse =  deserializeColorTexture(this.diffuse, relativePath);
            //promises.push(checkImageData((material as any).diffuse));
        }

        // TODO: diffuseScale -> albedoScale
        if (this.diffuseScale !== undefined) {
            //(material as any).diffuseScale = deserializeVector(this.diffuseScale);
        }

        if (this.fresnel !== undefined) {
            //(material as any).fresnel = deserializeVector(this.fresnel);
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
            //(material as any).metallic = deserializeValueTexture(this.metallic, relativePath);
            //promises.push(checkImageData((material as any).metallic));
        }

        if (this.metallicChannel !== undefined) {
            (material as any).metallicChannel = this.metallicChannel;
        }

        if (this.metallicScale !== undefined) {
            //(material as any).metallicScale = deserializeVector(this.metallicScale);
        }

        if (this.normal !== undefined) {
            //(material as any).normal = deserializeColorTexture(this.normal, relativePath);
            //promises.push(checkImageData((material as any).normal));
        }

        if (this.normalScale !== undefined) {
            //material.normalScale = deserializeVector(this.normalScale);
        }

        if (this.roughness !== undefined) {
            //(material as any).roughness = deserializeValueTexture(this.roughness, relativePath);
            //promises.push(checkImageData((material as any).roughness));
        }

        if (this.roughnessChannel !== undefined) {
            material.roughnessChannel = this.roughnessChannel;
        }

        if (this.roughnessScale !== undefined) {
            //material.roughnessScale = deserializeVector(this.roughnessScale);
        }

        if (this.unlit !== undefined) {
            material.unlit = this.unlit;
        }
        await Promise.allSettled(promises);
    }

}
