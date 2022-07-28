

import TextureRenderer from '../TextureRenderer';
import Texture, { 
    TextureWrapName, 
    TextureFilterName, 
    TextureTargetName,
    TextureDataType,
    TextureComponentFormat
} from '../../base/Texture';
import {
    ColorTextureAttributes, 
    ValueTextureAttributes 
} from '../../base/Material';
import Vec from '../../math/Vec';

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

const getDataFormat = (gl,componentFormat) => {
    switch (componentFormat) {
    case TextureComponentFormat.UNSIGNED_BYTE:
        return gl.UNSIGNED_BYTE;
    case TextureComponentFormat.FLOAT32:
        return gl.FLOAT;
    default:
        throw new Error("Error creating webgl texture: invalid component data format");
    }
}

const getWebGLTexture = (gl, textureData) => {
    if (!textureData.imageData) {
        throw new Error("Error loading WebGL texture: image data not loaded");
    }

    if (textureData._apiObject) {
        gl.deleteTexture(textureData._apiObject);
    }
    textureData._apiObject = gl.createTexture();
    const target = getTarget(gl, textureData);
    const dataFormat = getDataFormat(gl, textureData.componentFormat);
    gl.bindTexture(target, textureData._apiObject);

    if (textureData.dataType ===TextureDataType.RENDER_TARGET) {
        const { width, height } = textureData.size;

        gl.texImage2D(target, 0, gl.RGBA, width, height, 0, gl.RGBA, dataFormat, null);

        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        textureData.imageData.currentSize = new Vec(textureData.size);
    }
    else {
    
        gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, dataFormat, textureData._imageData);
    
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, getClampMode(gl,textureData.wrapModeX));
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, getClampMode(gl,textureData.wrapModeY));
    
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, getTextureFilter(gl, textureData.magFilter));
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, getTextureFilter(gl, textureData.minFilter));
    
        if (textureData.mipmapRequired) {
            gl.generateMipmap(target);
        }
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
    
    deleteTexture() {
        if (super.deleteTexture()) {
            if (this.texture instanceof Texture && this.texture._apiObject) {
                gl.deleteTexture(this.texture._apiObject);
                this.texture._apiObject = null;
            }
            return true;
        }
        return false;
    }
}
