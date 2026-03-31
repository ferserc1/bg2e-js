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

import Texture, { TextureChannel, TextureTargetName } from "../../base/Texture";
import Material from "../../base/Material";
import MaterialRenderer from "../MaterialRenderer";
import WebGLTextureRenderer from "./TextureRenderer";
import TextureMerger from "../TextureMergerRenderer";
import ShaderProgram from "./ShaderProgram";
import Renderer from "../Renderer";
import { whiteTexture, createWhiteTexture, blackTexture, createBlackTexture } from "../../tools/TextureResourceDatabase";

export default class WebGLMaterialRenderer extends MaterialRenderer {
    protected _whiteTexture: WebGLTextureRenderer;
    protected _blackTexture: WebGLTextureRenderer;
    protected _textureMerger: TextureMerger;

    static async InitResources(renderer: Renderer) {
        await createWhiteTexture(renderer);
        await createBlackTexture(renderer);
    }

    constructor(renderer: Renderer, material: Material) {
        super(renderer, material);
        if (material.renderer) {
            throw new Error("Duplicate material renderer set to material. Please, use the Renderer factory to get material renderer instance.");
        }
        // Link this material renderer to the material. This property is internal but should be accessed from the renderer
        // The use of 'as any' is to provide access to the internal property like a friend class in C++
        (material as any)._renderer = this;

        this._whiteTexture = renderer.factory.texture(whiteTexture(renderer)) as WebGLTextureRenderer;
        this._blackTexture = renderer.factory.texture(blackTexture(renderer)) as WebGLTextureRenderer;
        this._textureMerger = renderer.factory.textureMerger();
    }

    mergeTextures() {
        if (this.material.dirty) {
            const getTexture = (att: keyof Material, fallbackTexture = this._whiteTexture) => {
                if (this.material[att] instanceof Texture) {
                    return this.material[att];
                }
                else {
                    return fallbackTexture.texture;
                }
            }

            this._textureMerger.setTexture(getTexture('metalnessTexture'), TextureChannel.R, TextureChannel.R + this.material.metalnessChannel);
            this._textureMerger.setTexture(getTexture('roughnessTexture'), TextureChannel.G, TextureChannel.R + this.material.roughnessChannel);
            this._textureMerger.setTexture(getTexture('lightEmission', this._blackTexture), TextureChannel.B, TextureChannel.R + this.material.lightEmissionChannel);
            this._textureMerger.setTexture(getTexture('ambientOcclussion'), TextureChannel.A, TextureChannel.R + this.material.ambientOcclussionChannel);
            this._textureMerger.update();
            this.material.dirty = false;
        }
    }

    get metalnessRoughnessHeightAOTexture() {
        return this._textureMerger.mergedTexture;
    }

    destroy() {
        console.log("Destroy material renderer");
        if (this.material) {
            // The use of 'as any' is to provide access to the internal property like a friend class in C++
            (this.material as any)._renderer = null;
        }
    }

    // Bind the metalness, roughness, height and ambient occlussion combined texture
    bindMetalnessRoughnessHeightAOTexture(shaderProgram: ShaderProgram, uniformName: string, textureUnit: number): boolean {
        const texRenderer = this.renderer.factory.texture(this.metalnessRoughnessHeightAOTexture) as WebGLTextureRenderer;
        shaderProgram.bindTexture(uniformName, texRenderer, textureUnit);
        return true;
    }

    // Binds the property to the uniformName  uniform of the shader program, if the
    // material property ies a texture. If not, it binds the fallbackTexture. If the fallbackTexture
    // value is null, it binds a 2x2 px white texture
    bindTexture(shaderProgram: ShaderProgram, property: keyof Material, uniformName: string, textureUnit: number, fallbackTexture: Texture | null = null) {
        if (this.material[property] instanceof Texture) {
            shaderProgram.bindTexture(uniformName, this.getTextureRenderer(property) as WebGLTextureRenderer, textureUnit);
            return true;
        }
        else if (fallbackTexture instanceof Texture) {
            const texRenderer = this.renderer.factory.texture(fallbackTexture) as WebGLTextureRenderer;
            shaderProgram.bindTexture(uniformName, texRenderer, textureUnit);
            return false;
        }
        else {
            shaderProgram.bindTexture(uniformName, this._whiteTexture, textureUnit);
            return false;
        }
    }

    // Bind the property to the uniformName uniform of the shader program, if the
    // material property is a color. If not, it binds the fallbackColor vector
    bindColor(shaderProgram: ShaderProgram, property: keyof Material, uniformName: string, fallbackColor = [1, 1, 1, 1]) {
        if (this.material[property].length>=4) {
            shaderProgram.uniform4fv(uniformName, this.material[property]);
        }
        else {
            shaderProgram.uniform4fv(uniformName, fallbackColor);
        }
    }

    // Bind the property to the uniformName uniform of the shader program, if the
    // material property is a number. If not, it binds the fallbackValue value
    bindValue(shaderProgram: ShaderProgram, property: keyof Material, uniformName: string, fallbackValue = 1) {
        if (typeof(this.material[property]) === "number") {
            shaderProgram.uniform1f(uniformName, this.material[property]);
        }
        else {
            shaderProgram.uniform1f(uniformName, fallbackValue);
        }
    }
}