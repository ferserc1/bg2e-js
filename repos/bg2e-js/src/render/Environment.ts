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

import ProceduralSkyShader from '../shaders/ProceduralSkyShader';
import type { SolarState } from '../base/SolarLight';
import WebGLRenderer from "./webgl/Renderer";
import WebGLTextureRenderer from "./webgl/TextureRenderer";
import Texture, { TextureRenderTargetAttachment, TextureTarget, TextureComponentFormat } from "../base/Texture";
import IrradianceMapCubeShader from "../shaders/IrradianceMapCubeShader";
import SpecularMapCubeShader from "../shaders/SpecularMapCubeShader";
import RenderBuffer from "./RenderBuffer";
import Renderer from "./Renderer";
import SkySphere from "./SkySphere";
import SkyCube from "./SkyCube";
import Mat4 from "../math/Mat4";

type TextureResources = {
    renderer: Renderer;
    texture: Texture;
    renderBuffer: RenderBuffer;
    skyShape: SkySphere | SkyCube | null;
}

const createTextureResources = async (renderer: Renderer, size: [number, number]) : Promise<TextureResources> => {
    const texture = new Texture();
    texture.linearData = true;
    texture.componentFormat = TextureComponentFormat.FLOAT32;
    texture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
    texture.target = TextureTarget.CUBE_MAP;

    const renderBuffer = renderer.factory.renderBuffer();
    await renderBuffer.attachTexture(texture);
    renderBuffer.size = size;

    return { renderer, texture, renderBuffer, skyShape: null };
}

const destroyTextureResources = (resources: TextureResources) => {
    resources.skyShape?.destroy();
    resources.texture.destroy();
    resources.renderBuffer.destroy();
}

const updateMap = (mapResources: TextureResources) => {
    const { renderBuffer, skyShape } = mapResources;
    renderBuffer.update((face,viewMatrix,projectionMatrix) => {
        mapResources.renderer.clearBuffer();
        skyShape?.updateRenderState({
            viewMatrix: viewMatrix || Mat4.MakeIdentity(),
            projectionMatrix
        });
        skyShape?.draw();
    })
}

export interface EnvironmentOptions {
    textureUrl?: string | null;
    environmentMapSize?: [number, number];
    specularMapSize?: [number, number];
    irradianceMapSize?: [number, number];
    skyHorizonColor?: number[];
    skyZenithColor?: number[];
    groundColor?: number[];
    solar?: SolarState | null;
}

export default class Environment {
    solar: SolarState | null = null;
    private _loadOptions: EnvironmentOptions = {};
    private _backgroundResources: TextureResources | null = null;
    get backgroundMap(): Texture | null { return this._backgroundResources?.texture ?? this.environmentMap; }
    protected _renderer: Renderer;
    protected _updated: boolean = false;
    protected _environmentDataResources: TextureResources | null = null;
    get environmentData(): Texture | null { return this._environmentDataResources?.texture || null; }
    get irradianceLod(): number { return Math.log2(this._envMapSize[0] / this._irrMapSize[0]); }
    get maxSpecularLod(): number { return this.irradianceLod - 1; }

    protected _environmentMapResources: TextureResources | null = null;
    protected _specularMapResources: TextureResources | null = null;
    protected _irradianceMapResources: TextureResources | null = null;
    protected _envMapSize: [number, number] = [512, 512];
    protected _specMapSize: [number, number] = [128, 128];
    protected _irrMapSize: [number, number] = [16, 16];

    constructor(renderer: Renderer) {
        this._renderer = renderer;
    }

    get renderer() {
        return this._renderer;
    }

    get updated() {
        return this._updated;
    }

    get environmentMap(): Texture | null {
        return this.environmentData;
    }

    /** @deprecated Generation scratch texture. Use environmentData and maxSpecularLod. */
    get specularMap(): Texture | null {
        return this._specularMapResources?.texture || null;
    }

    /** @deprecated Generation scratch texture. Use environmentData and irradianceLod. */
    get irradianceMap(): Texture | null {
        return this._irradianceMapResources?.texture || null;
    }

    async load(options: EnvironmentOptions = {}): Promise<void> {
        const replacement = new Environment(this.renderer);
        try {
            await replacement._build(options);
            replacement.updateMaps();
        }
        catch (error) { replacement.destroy(); throw error; }
        this.destroy();
        Object.assign(this, replacement);
        this._loadOptions = { ...options };
    }

    private async _build({
        textureUrl = null,
        environmentMapSize = [ 512, 512 ],
        specularMapSize = [ 128, 128 ], // Deprecated: accepted for existing callers; levels derive from the two endpoint sizes.
        irradianceMapSize = [16, 16],
        skyHorizonColor = [0.55, 0.65, 0.8], skyZenithColor = [0.06, 0.22, 0.6],
        groundColor = [0.04, 0.035, 0.025], solar = null
    } : EnvironmentOptions = {}): Promise<void> {
        const gl = (this.renderer as WebGLRenderer).gl;
        if (!gl.getExtension("EXT_shader_texture_lod")) throw new Error("IBL requires EXT_shader_texture_lod");
        if (!gl.getExtension('OES_texture_float') || !gl.getExtension('OES_texture_float_linear') || !gl.getExtension('WEBGL_color_buffer_float')) {
            throw new Error('Environment generation requires renderable, linearly filtered float textures');
        }
        const max = environmentMapSize[0], min = irradianceMapSize[0];
        const pot = (n: number) => Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0;
        if (!pot(max) || !pot(min) || environmentMapSize[1] !== max || irradianceMapSize[1] !== min || max / min < 4 || max > gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE)) {
            throw new Error("Environment sizes must be square powers of two, with maximum >= 4 * minimum and within GPU limits");
        }
        for (const color of [skyHorizonColor, skyZenithColor, groundColor]) {
            if (color.length < 3 || !color.slice(0, 3).every(v => Number.isFinite(v) && v >= 0 && v <= 1)) throw new Error("Invalid procedural sky RGB");
        }
        this.solar = textureUrl ? null : solar;
        this._envMapSize = environmentMapSize;
        this._environmentDataResources = await createTextureResources(this.renderer, environmentMapSize);
        this._specMapSize = specularMapSize;
        this._irrMapSize = irradianceMapSize;

        this._environmentMapResources = await createTextureResources(this.renderer, environmentMapSize);
        if (textureUrl) {
            const envShape = this.renderer.factory.skySphere();
            await envShape.load(textureUrl);
            envShape.linearOutput = true;
            this._environmentMapResources.skyShape = envShape;
        }
        else {
            const createSky = async (resources: TextureResources, disk: boolean) => {
                const shape = this.renderer.factory.skyCube();
                await shape.load(resources.texture, ProceduralSkyShader);
                const shader = shape.shader as ProceduralSkyShader;
                shader.horizon = skyHorizonColor; shader.zenith = skyZenithColor; shader.ground = groundColor;
                shader.solar = solar; shader.includeDisk = disk; shader.size = max;
                resources.skyShape = shape;
            };
            await createSky(this._environmentMapResources, true);
            if (solar) {
                this._backgroundResources = await createTextureResources(this.renderer, environmentMapSize);
                await createSky(this._backgroundResources, false);
            }
        }

        this._specularMapResources = await createTextureResources(this.renderer, specularMapSize);
        const specShape = this.renderer.factory.skyCube();
        await specShape.load(this._environmentMapResources.texture, SpecularMapCubeShader);
        this._specularMapResources.skyShape = specShape;

        this._irradianceMapResources = await createTextureResources(this.renderer, irradianceMapSize);
        const irrShape = this.renderer.factory.skyCube();
        await irrShape.load(this._backgroundResources?.texture ?? this._environmentMapResources.texture, IrradianceMapCubeShader);
        this._irradianceMapResources.skyShape = irrShape;
        this._updated = false;
    }

    destroy() {
        this._environmentDataResources && destroyTextureResources(this._environmentDataResources);
        this._environmentMapResources && destroyTextureResources(this._environmentMapResources);
        this._specularMapResources && destroyTextureResources(this._specularMapResources);
        this._irradianceMapResources && destroyTextureResources(this._irradianceMapResources);
        if (this._backgroundResources) destroyTextureResources(this._backgroundResources);
        this._backgroundResources = null;
        this._environmentDataResources = null;
        this._environmentMapResources = null;
        this._specularMapResources = null;
        this._irradianceMapResources = null;
        this._updated = false;
    }

    updateMaps() {
        this._environmentMapResources && updateMap(this._environmentMapResources);
        if (this._backgroundResources) updateMap(this._backgroundResources);
        const output = this._environmentDataResources;
        const source = this._environmentMapResources;
        if (!output || !source || !this._specularMapResources || !this._irradianceMapResources) return;
        const gl = (this.renderer as WebGLRenderer).gl;
        // These are spatial averages of source radiance, separate from the output's
        // authored roughness/irradiance levels. GGX sampling selects their LOD by PDF.
        const sourceTexture = (this.renderer.factory.texture(source.texture) as WebGLTextureRenderer).getApiObject();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, sourceTexture);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        const target = (this.renderer.factory.texture(output.texture) as WebGLTextureRenderer).getApiObject();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, target);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        const copy = (resources: TextureResources, level: number) => {
            resources.renderBuffer.update((face, viewMatrix, projectionMatrix) => {
                this.renderer.clearBuffer();
                resources.skyShape?.updateRenderState({ viewMatrix: viewMatrix || Mat4.MakeIdentity(), projectionMatrix });
                resources.skyShape?.draw();
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, target);
                gl.copyTexSubImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + Number(face) - 1, level, 0, 0, 0, 0, resources.renderBuffer.size.width, resources.renderBuffer.size.height);
            });
        };
        copy(source, 0);
        for (let level = 1; level <= this.maxSpecularLod; ++level) {
            const resources = this._specularMapResources;
            const size = this._envMapSize[0] / Math.pow(2, level);
            resources.renderBuffer.size = [size, size];
            (resources.skyShape as SkyCube).setSpecularRoughness(level / this.maxSpecularLod);
            copy(resources, level);
        }
        for (let level = this.irradianceLod; level <= Math.log2(this._envMapSize[0]); ++level) {
            const size = this._envMapSize[0] / Math.pow(2, level);
            this._irradianceMapResources.renderBuffer.size = [size, size];
            copy(this._irradianceMapResources, level);
        }
        this._irradianceMapResources.renderBuffer.size = this._irrMapSize;
        this._updated = true;
    }

    async reloadImage(imageUrl: string | null) {
        await this.load({ ...this._loadOptions, textureUrl: imageUrl });
    }
}
