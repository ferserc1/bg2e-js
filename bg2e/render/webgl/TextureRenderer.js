

import TextureRenderer from '../TextureRenderer';
import Texture, { 
    TextureWrapName, 
    TextureFilterName, 
    TextureTargetName,
    TextureDataType,
    TextureComponentFormat,
    TextureRenderTargetAttachment,
    TextureTarget
} from '../../base/Texture';
import Vec from '../../math/Vec';

const getTarget = (gl, tex) => {
    switch (tex.target) {
    case TextureTarget.TEXTURE_2D:
        return gl.TEXTURE_2D;
    case TextureTarget.CUBE_MAP:
        return gl.TEXTURE_CUBE_MAP;
    default:
        throw new Error("Error creating WebGL Texture: invalid target");
    }
}

const getClampMode = (gl, mode) => {
    if (mode === 1) {
        return gl.CLAMP_TO_EDGE;
    }
    else {
        const name = TextureWrapName[mode];
        return gl[name];
    }
}

const getTextureFilter = (gl, filter) => {
    const name = TextureFilterName[filter];
    return gl[name];
}

const getDataFormat = (gl,texture) => {
    const componentFormat = texture.componentFormat;
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
    const dataFormat = getDataFormat(gl, textureData);
    gl.bindTexture(target, textureData._apiObject);

    if (textureData.dataType ===TextureDataType.RENDER_TARGET) {
        const { width, height } = textureData.size;

        const isDepthTexture = textureData.renderTargetAttachment === TextureRenderTargetAttachment.DEPTH_ATTACHMENT;
        const internalFormat = isDepthTexture ? gl.DEPTH_COMPONENT : gl.RGBA;
        let format = isDepthTexture ? gl.DEPTH_COMPONENT : gl.RGBA;
        const type = isDepthTexture ? gl.UNSIGNED_SHORT : dataFormat;

        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, getClampMode(gl,textureData.wrapModeX));
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, getClampMode(gl,textureData.wrapModeY));
        
        if (target === gl.TEXTURE_CUBE_MAP) {
            for (let i = 0; i<6; ++i) {
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, internalFormat, width, height, 0, format, type, null);
            }
        }
        else {
            gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, null);
        }

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
            try {
                getWebGLTexture(this.renderer.gl, this.texture);
                this.texture.setUpdated();
            }
            catch (err) {
                console.warn(err.message);
            }
        }
        return this.texture._apiObject;
    }
    
    destroy() {
        const { gl } = this.renderer;
        if (this.texture._apiObject) {
            gl.deleteTexture(this.texture._apiObject);
            this.texture._apiObject = null;
            this.texture.setUpdated(false);
        }
    }

    ///// webgl specific functions
    // Returns the webgl target (TEXTURE_2D, TEXTURE_3D...)
    get target() {
        return this.renderer.gl[TextureTargetName[this.texture.target]];
    }

    activeTexture(index = 0) {
        const { gl } = this.renderer;
        gl.activeTexture(gl.TEXTURE0 + index);
    }

    bindTexture() {
        this.renderer.gl.bindTexture(this.target, this.getApiObject());
    }
}
