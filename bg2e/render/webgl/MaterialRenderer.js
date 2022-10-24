import Texture, { TextureTargetName } from "../../base/Texture";
import MaterialRenderer from "../MaterialRenderer";
import { whiteTexture, createWhiteTexture } from "../../tools/TextureResourceDatabase";

export default class WebGLMaterialRenderer extends MaterialRenderer {
    static async InitResources(renderer) {
        await createWhiteTexture(renderer);
    }

    constructor(renderer, material) {
        super(renderer, material);

        this._whiteTexture = renderer.factory.texture(whiteTexture(renderer));
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