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

import Texture, { TextureChannel } from "../../base/Texture";
import Material, { getMaterialAppearance } from "../../base/Material";
import MaterialRenderer from "../MaterialRenderer";
import WebGLTextureRenderer from "./TextureRenderer";
import TextureMerger from "../TextureMergerRenderer";
import ShaderProgram from "./ShaderProgram";
import Renderer from "../Renderer";
import type WebGLRenderer from "./Renderer";
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
        const material = this.material;
        const sources = [material.metalnessTexture, material.roughnessTexture, material.lightEmissionTexture, material.heightTexture];
        if (!material.dirty && !sources.some(texture => texture?.dirty)) return;

        const appearance = getMaterialAppearance(material);
        const white = this._whiteTexture.texture;
        this._textureMerger.setTexture(material.metalnessTexture ?? white, TextureChannel.R,
            TextureChannel.R + material.metalnessChannel, !!material.metalnessTexture && appearance.metalnessInvert);
        this._textureMerger.setTexture(material.roughnessTexture ?? white, TextureChannel.G,
            TextureChannel.R + material.roughnessChannel, !!material.roughnessTexture && appearance.roughnessInvert);
        this._textureMerger.setTexture(material.lightEmissionTexture ?? white, TextureChannel.B,
            TextureChannel.R + material.lightEmissionChannel, !!material.lightEmissionTexture && appearance.lightEmissionInvert);
        this._textureMerger.setTexture(material.heightTexture ?? this._blackTexture.texture, TextureChannel.A,
            TextureChannel.R + material.heightChannel);
        this._textureMerger.size = [
            Math.max(1, ...sources.map(texture => texture?.size.width ?? 1)),
            Math.max(1, ...sources.map(texture => texture?.size.height ?? 1))
        ];

        // The packed alpha carries height. Blending would mix every channel with the framebuffer.
        const { state } = this.renderer as WebGLRenderer;
        const blendEnabled = state.blendEnabled;
        state.blendEnabled = false;
        try {
            this._textureMerger.update();
            material.dirty = false;
        }
        finally {
            state.blendEnabled = blendEnabled;
        }
    }

    get metalnessRoughnessEmissionHeightTexture() {
        return this._textureMerger.mergedTexture;
    }

    destroy() {
        this._textureMerger.destroy();
        if (this.material) {
            // The use of 'as any' is to provide access to the internal property like a friend class in C++
            (this.material as any)._renderer = null;
        }
    }

    // Bind the metalness, roughness, height and ambient occlussion combined texture
    bindMetalnessRoughnessEmissionHeightTexture(shaderProgram: ShaderProgram, uniformName: string, textureUnit: number): boolean {
        const texRenderer = this.renderer.factory.texture(this.metalnessRoughnessEmissionHeightTexture) as WebGLTextureRenderer;
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
