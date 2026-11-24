/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { resolveResourceUrl } from "../tools/Resource";
import Component from "./Component";
import { LightType } from '../base/Light';
import { evaluateSolarLight, type SolarState } from '../base/SolarLight';
import Vec from '../math/Vec';
import Transform from './Transform';

function readSkyColor(value: any, fallback: number[]): number[] {
    if (value == null) return [...fallback];
    if (!Array.isArray(value) || value.length < 3 || !value.slice(0, 3).every(v => Number.isFinite(v) && v >= 0 && v <= 1)) {
        throw new Error('Procedural sky colors require finite RGB components in [0, 1]');
    }
    return value.slice(0, 3);
}
import EnvironmentRenderer from "../render/Environment";

export default class EnvironmentComponent extends Component {
    skyHorizonColor: number[] = [0.55, 0.65, 0.8];
    skyZenithColor: number[] = [0.06, 0.22, 0.6];
    groundColor: number[] = [0.04, 0.035, 0.025];
    skyboxBlur = 0;
    private _generationKey = '';

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
        this._irradianceMapSize = 16;
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
        this.skyHorizonColor = [...other.skyHorizonColor];
        this.skyZenithColor = [...other.skyZenithColor];
        this.groundColor = [...other.groundColor];
        this.skyboxBlur = other.skyboxBlur;
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
        const image = sceneData.equirectangularTexture ?? sceneData.environmentImage;
        this.equirectangularTexture = image ? resolveResourceUrl(loader.currentPath || '', image) : '';
        this.skyHorizonColor = readSkyColor(sceneData.skyHorizonColor, [0.55, 0.65, 0.8]);
        this.skyZenithColor = readSkyColor(sceneData.skyZenithColor, [0.06, 0.22, 0.6]);
        this.groundColor = readSkyColor(sceneData.groundColor, [0.04, 0.035, 0.025]);
        this.skyboxBlur = sceneData.skyboxBlur ?? 0;
        this.irradianceIntensity = sceneData.irradianceIntensity ?? this.irradianceIntensity;
        this.showSkybox = sceneData.skyboxVisible ?? sceneData.showSkybox ?? this.showSkybox;
        this.cubemapSize = sceneData.cubemapSize || this.cubemapSize;
        this.irradianceMapSize = sceneData.irradianceMapSize || this.irradianceMapSize;
        this.specularMapSize = sceneData.specularMapSize || this.specularMapSize;
        this.specularMapL2Size = sceneData.specularMapL2Size || this.specularMapL2Size;
    }

    async serialize(sceneData: any, writer: any): Promise<void> {
        await super.serialize(sceneData, writer);
        Object.assign(sceneData, {
            equirectangularTexture: this.equirectangularTexture,
            skyHorizonColor: [...this.skyHorizonColor], skyZenithColor: [...this.skyZenithColor],
            groundColor: [...this.groundColor], skyboxBlur: this.skyboxBlur,
            skyboxVisible: this.showSkybox, irradianceIntensity: this.irradianceIntensity,
            cubemapSize: this.cubemapSize, irradianceMapSize: this.irradianceMapSize,
            specularMapSize: this.specularMapSize, specularMapL2Size: this.specularMapL2Size
        });
    }

    get solarState(): SolarState | null {
        const light = this.node?.lightComponent?.light;
        if (this.equirectangularTexture || !light?.enabled || light.type !== LightType.SUN) return null;
        const ray = Transform.GetWorldMatrix(this.node).multVector(new Vec(0, 0, 1, 0)).xyz;
        return evaluateSolarLight(light, ray);
    }

    /** Called only for the active environment, after scene transforms have updated. */
    async synchronize(): Promise<void> {
        if (!this._environment) return;
        const solar = this.solarState;
        const key = JSON.stringify([this.equirectangularTexture, this.skyHorizonColor, this.skyZenithColor,
            this.groundColor, this.cubemapSize, this.irradianceMapSize, solar]);
        if (key === this._generationKey) return;
        await this._environment.load({
            textureUrl: this.equirectangularTexture || null,
            environmentMapSize: [this.cubemapSize, this.cubemapSize],
            irradianceMapSize: [this.irradianceMapSize, this.irradianceMapSize],
            specularMapSize: [this.specularMapSize, this.specularMapSize],
            skyHorizonColor: readSkyColor(this.skyHorizonColor, []),
            skyZenithColor: readSkyColor(this.skyZenithColor, []),
            groundColor: readSkyColor(this.groundColor, []), solar
        });
        this._generationKey = key;
    }

    async init(): Promise<void> {
        if (this._environment) return;
        this._environment = this.renderer?.factory.environment()!;
        if (!this._environment) {
            throw new Error("EnvironmentComponent.init(): unexpected error. Unable to create environment object from renderer factory");
        }

        await this.synchronize();
    }
}
