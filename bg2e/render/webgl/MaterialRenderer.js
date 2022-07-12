import MaterialRenderer from '../MaterialRenderer'
import { TextureWrapName, TextureFilterName, TextureTargetName } from '../../base/Texture';

const getTarget = (gl, tex) => {
    const name = TextureTargetName[tex.target];
    return gl[name];
}

const getClampMode = (gl, mode) => {
    const name = TextureWrapName[mode];
    return gl[name];
}

const getTextureFilter = (gl, filter) => {
    const name = TextureFilterName[filter];
    return gl[name];
}

const getWebGLTexture = (gl, textureData) => {
    if (textureData._apiObject) {
        gl.deleteTexture(textureData._apiObject);
    }
    const target = getTarget(gl, textureData);
    textureData._apiObject = gl.createTexture();
    gl.bindTexture(target, textureData._apiObject);

    gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureData._imageData);

    gl.texParameteri(target, gl.TEXTURE_WRAP_S, getClampMode(gl,textureData.wrapModeX));
    gl.texParameteri(target, gl.TEXTURE_WRAP_T, getClampMode(gl,textureData.wrapModeY));

    gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, getTextureFilter(gl, textureData.magFilter));
    gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, getTextureFilter(gl, textureData.minFilter));

    if (textureData.mipmapRequired) {
        gl.generateMipmap(target);
    }

    textureData.setUpdated();
}

export default class WebGLMaterialRenderer extends MaterialRenderer {
    constructor(renderer, material) {
        super(renderer, material);

        this._textures = [];
    }

    getTexture(materialAttribute) {
        const texture = super.getTexture(materialAttribute);
        if (texture) {
            if (texture.dirty) {
                getWebGLTexture(this.renderer.gl,texture);
                this._textures.push(texture);
            }
            return texture._apiObject;
        }
        else {
            return null;
        }
    }
}