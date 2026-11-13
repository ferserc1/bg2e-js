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

import { decodeRadianceHDR } from '../tools/RadianceHDR';
import { createSphere } from "../primitives";
import SkySphereShader from "../shaders/SkySphereShader";
import RenderState from "./RenderState";
import Material from "../base/Material";
import Texture, { ProceduralTextureFunction, TextureFilter, TextureWrap } from "../base/Texture";
import Mat4 from "../math/Mat4";
import { PolyListCullFace, PolyListFrontFace } from "../base/PolyList";
import Color from "../base/Color";
import type Renderer from "./Renderer";
import type Shader from "./Shader";
import type PolyListRenderer from "./PolyListRenderer";

export interface UpdateRenderStateOptions {
    viewMatrix: Mat4;
    projectionMatrix?: Mat4 | null;
}

export default class SkySphere {
    protected _renderer: Renderer;
    protected _texture: Texture | null;
    protected _material: Material | null;
    protected _shader: Shader | null;
    protected _plistRenderer: PolyListRenderer | null;
    protected _renderState: RenderState | null;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
        this._texture = null;
        this._material = null;
        this._shader = null;
        this._plistRenderer = null;
        this._renderState = null;
    }

    set linearOutput(value: boolean) {
        if (this._shader instanceof SkySphereShader) this._shader.linearOutput = value;
    }

    get renderer(): Renderer { return this._renderer; }

    async load(equirectangularTextureUrl: string | null, Shader: (new (renderer: Renderer) => any) | null = null): Promise<void> {
        this.destroy();
        this._texture = await this._loadTexture(equirectangularTextureUrl);

        this._material = new Material();
        this._material.albedoTexture = this._texture;

        this._shader = Shader ? new Shader(this.renderer) : new SkySphereShader(this.renderer);
        await this._shader?.load();
    }

    private async _loadTexture(equirectangularTextureUrl: string | null): Promise<Texture> {
        const texture = new Texture();
        if (equirectangularTextureUrl) {
            texture.fileName = equirectangularTextureUrl;
        }
        else {
            // Load black texture
            texture.magFilter = TextureFilter.NEAREST;
            texture.minFilter = TextureFilter.NEAREST;
            texture.wrapModeXY = TextureWrap.REPEAT;
            texture.proceduralFunction = ProceduralTextureFunction.PLAIN_COLOR;
            texture.proceduralParameters = Color.Black();
            texture.size = [2, 2];
        }
        if (equirectangularTextureUrl && /\.hdr(?:[?#]|$)/i.test(equirectangularTextureUrl)) {
            const response = await fetch(equirectangularTextureUrl);
            if (!response.ok) throw new Error(`Cannot load HDR environment: ${response.status}`);
            const { width, height, data } = decodeRadianceHDR(await response.arrayBuffer());
            texture.setFloatImageData(width, height, data);
            texture.wrapModeXY = TextureWrap.CLAMP;
            texture.minFilter = TextureFilter.LINEAR;
        } else {
            await texture.loadImageData();
        }

        return texture;
    }

    async setTexture(equirectangularTextureUrl: string): Promise<void> {
        if (!this._material) throw new Error('SkySphere: call load() before setTexture()');
        const texture = await this._loadTexture(equirectangularTextureUrl);
        this._texture?.destroy();
        this._texture = texture;
        this._material.albedoTexture = texture;
    }

    updateRenderState({ viewMatrix, projectionMatrix = null }: UpdateRenderStateOptions): RenderState {
        if (!this._material) {
            throw new Error("SkySphere: internal error, material is null when updating render state.");
        }
        const rotationMatrix = Mat4.GetRotation(viewMatrix);
        if (!this._renderState) {
            this._renderState = new RenderState({
                shader: this._shader,
                polyListRenderer: this.polyListRenderer,
                materialRenderer: this.renderer.factory.material(this._material),
                viewMatrix: rotationMatrix,
                projectionMatrix: projectionMatrix || Mat4.MakeIdentity()
            });
        }
        else {
            this._renderState.viewMatrix = rotationMatrix;
            if (projectionMatrix) {
                this._renderState.projectionMatrix = projectionMatrix;
            }
        }
        return this._renderState;
    }

    draw(): void {
        throw new Error("SkySphere.draw(): Calling base implementation of SkySphere");
    }

    get polyListRenderer(): PolyListRenderer {
        if (!this._plistRenderer) {
            const sphere = createSphere(3.5);
            sphere.cullFace = PolyListCullFace.FRONT;  // Draw back face
            this._plistRenderer = this.renderer.factory.polyList(sphere);
        }
        return this._plistRenderer;
    }

    destroy(): void {
        this._shader?.destroy();
        this._texture?.destroy();
        this._plistRenderer?.destroy();
        this._shader = null;
        this._texture = null;
        this._material?.destroy();
        this._material = null;
        this._plistRenderer = null;
        this._renderState = null;
    }
}