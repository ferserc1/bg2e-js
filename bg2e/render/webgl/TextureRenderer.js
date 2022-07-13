

import TextureRenderer from '../TextureRenderer';
import Texture, { 
    TextureWrapName, 
    TextureFilterName, 
    TextureTargetName
} from '../../base/Texture';
import {
    ColorTextureAttributes, 
    ValueTextureAttributes 
} from '../../base/Material';

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
    if (!textureData._imageData) {
        throw new Error("Error loading WebGL texture: image data not loaded");
    }

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
}
export default class WebGLTextureRenderer extends TextureRenderer {
    getApiObject() {
        if (this.texture.dirty) {
            getWebGLTexture(this.renderer.gl, this.texture);
            this.texture.setUpdated();
        }
        return this.texture._apiObject;
    }
    
    deleteTexture(texture) {
        if (super.deleteTexture(texture)) {
            if (texture instanceof Texture && texture._apiObject) {
                gl.deleteTexture(texture._apiObject);
                texture._apiObject = null;
            }
            return true;
        }
        return false;
    }
}