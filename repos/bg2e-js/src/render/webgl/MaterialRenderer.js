import Texture, { TextureChannel, TextureTargetName } from "../../base/Texture";
import MaterialRenderer from "../MaterialRenderer";
import { whiteTexture, createWhiteTexture, blackTexture, createBlackTexture } from "../../tools/TextureResourceDatabase";

export default class WebGLMaterialRenderer extends MaterialRenderer {
    static async InitResources(renderer) {
        await createWhiteTexture(renderer);
        await createBlackTexture(renderer);
    }

    constructor(renderer, material) {
        super(renderer, material);
        if (material.renderer) {
            throw new Error("Duplicate material renderer set to material. Please, use the Renderer factory to get material renderer instance.");
        }
        material._renderer = this;

        this._whiteTexture = renderer.factory.texture(whiteTexture(renderer));
        this._blackTexture = renderer.factory.texture(blackTexture(renderer));
        this._textureMerger = renderer.factory.textureMerger();
    }

    mergeTextures() {
        if (this.material.dirty) {
            const getTexture = (att, fallbackTexture = this._whiteTexture) => {
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
            this.material._renderer = null;
        }
    }

    // Bind the metalness, roughness, height and ambient occlussion combined texture
    bindMetalnessRoughnessHeightAOTexture(shaderProgram, uniformName, textureUnit) {
        shaderProgram.bindTexture(uniformName, this.renderer.factory.texture(this.metalnessRoughnessHeightAOTexture), textureUnit);
        return true;
    }

    // Binds the property to the uniformName  uniform of the shader program, if the
    // material property ies a texture. If not, it binds the fallbackTexture. If the fallbackTexture
    // value is null, it binds a 2x2 px white texture
    bindTexture(shaderProgram, property, uniformName, textureUnit, fallbackTexture = null) {
        if (this.material[property] instanceof Texture) {
            shaderProgram.bindTexture(uniformName, this.getTextureRenderer(property), textureUnit);
            return true;
        }
        else if (fallbackTexture instanceof Texture) {
            shaderProgram.bindTexture(uniformName, this.renderer.factory.texture(fallbackTexture), textureUnit);
            return false;
        }
        else {
            shaderProgram.bindTexture(uniformName, this._whiteTexture, textureUnit);
            return false;
        }
    }

    // Bind the property to the uniformName uniform of the shader program, if the
    // material property is a color. If not, it binds the fallbackColor vector
    bindColor(shaderProgram, property, uniformName, fallbackColor = [1, 1, 1, 1]) {
        if (this.material[property].length>=4) {
            shaderProgram.uniform4fv(uniformName, this.material[property]);
        }
        else {
            shaderProgram.uniform4fv(uniformName, fallbackColor);
        }
    }

    // Bind the property to the uniformName uniform of the shader program, if the
    // material property is a number. If not, it binds the fallbackValue value
    bindValue(shaderProgram, property, uniformName, fallbackValue = 1) {
        if (typeof(this.material[property]) === "number") {
            shaderProgram.uniform1f(uniformName, this.material[property]);
        }
        else {
            shaderProgram.uniform1f(uniformName, fallbackValue);
        }
    }
}