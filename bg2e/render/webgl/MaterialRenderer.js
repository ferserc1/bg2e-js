import Texture, { TextureTargetName } from "../../base/Texture";
import MaterialRenderer from "../MaterialRenderer";
import { whiteTexture } from "../../tools/TextureResourceDatabase";

export default class WebGLMaterialRenderer extends MaterialRenderer {
    constructor(renderer, material) {
        super(renderer, material);

        this._whiteTexture = renderer.factory.texture(whiteTexture(this));
    }

    // Binds the property to the uniformName  uniform of the shader program, if the
    // material property ies a texture. If not, it binds the fallbackTexture. If the fallbackTexture
    // value is null, it binds a 2x2 px white texture
    bindTexture(shaderProgram, property, uniformName, textureUnit, fallbackTexture = null) {
        const { gl } = this.renderer;
        const bindTexture = (textureRenderer) => {
            const webglTexture = textureRenderer.getApiObject();
            const target = TextureTargetName[textureRenderer.texture.target];
            gl.activeTexture(gl.TEXTURE0 +  textureUnit);
            gl.bindTexture(gl[target], webglTexture);
            shaderProgram.uniform1i(uniformName, textureUnit);
        }

        if (this.material[property] instanceof Texture) {
            bindTexture(this.getTextureRenderer(property));
            return true;
        }
        else if (fallbackTexture instanceof Texture) {
            bindTexture(this.factory.texture(fallbackTexture));
            return false;
        }
        else {
            bindTexture(this._whiteTexture);
            return false;
        }
    }

    // Bind the property to the uniformName uniform of the shader program, if the
    // material property is a color. If not, it binds the fallbackColor vector
    bindColor(shaderProgram, property, uniformName, fallbackColor = [1, 1, 1, 1]) {

    }

    // Bind the property to the uniformName uniform of the shader program, if the
    // material property is a number. If not, it binds the fallbackValue value
    bindValue(shaderProgram, property, uniformName, fallbackValue = 1) {

    }
}