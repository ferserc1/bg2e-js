

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
import { generateUUID } from '../../tools/crypto';
import Renderer from '../Renderer';

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

const bg2eCreateTexture = (gl, textureObject) => {
    textureObject._apiObject = gl.createTexture();
    textureObject._apiObject._bg2_uuid = generateUUID();
    gl._bg2_textures = gl._bg2_textures || {};
    let id = textureObject.name || textureObject._apiObject._bg2_uuid;
    if (gl._bg2_textures[id] && gl._bg2_textures[id] !== textureObject) {
        id = textureObject.name + "_" + textureObject._apiObject._bg2_uuid;
    }
    gl._bg2_textures[id] = textureObject;
}

const bg2eDeleteTexture = (gl, textureObject) => {
    if (textureObject._apiObject) {
        gl.deleteTexture(textureObject._apiObject);
        delete gl._bg2_textures[textureObject._apiObject._bg2_uuid];
        textureObject._apiObject = null;
        textureObject.setUpdated(false);
    }
}

const getWebGLTexture = (gl, textureObject) => {
    if (!textureObject.imageData) {
        throw new Error("Error loading WebGL texture: image data not loaded");
    }

    bg2eDeleteTexture(gl, textureObject);
    bg2eCreateTexture(gl, textureObject);

    const target = getTarget(gl, textureObject);
    const dataFormat = getDataFormat(gl, textureObject);
    gl.bindTexture(target, textureObject._apiObject);

    if (textureObject.dataType ===TextureDataType.RENDER_TARGET) {
        const { width, height } = textureObject.size;

        const isDepthTexture = textureObject.renderTargetAttachment === TextureRenderTargetAttachment.DEPTH_ATTACHMENT;
        const internalFormat = isDepthTexture ? gl.DEPTH_COMPONENT : gl.RGBA;
        let format = isDepthTexture ? gl.DEPTH_COMPONENT : gl.RGBA;
        const type = isDepthTexture ? gl.UNSIGNED_SHORT : dataFormat;

        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, getClampMode(gl,textureObject.wrapModeX));
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, getClampMode(gl,textureObject.wrapModeY));
        
        if (target === gl.TEXTURE_CUBE_MAP) {
            for (let i = 0; i<6; ++i) {
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, internalFormat, width, height, 0, format, type, null);
            }
        }
        else {
            gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, null);
        }

        textureObject.imageData.currentSize = new Vec(textureObject.size);
    }
    else {
    
        gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, dataFormat, textureObject._imageData);
    
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, getClampMode(gl,textureObject.wrapModeX));
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, getClampMode(gl,textureObject.wrapModeY));
    
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, getTextureFilter(gl, textureObject.magFilter));
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, getTextureFilter(gl, textureObject.minFilter));
    
        if (textureObject.mipmapRequired) {
            gl.generateMipmap(target);
        }
    }
}

export default class WebGLTextureRenderer extends TextureRenderer {
    static ListTextures(glOrRenderer) {
        if (glOrRenderer instanceof Renderer) {
            glOrRenderer = glOrRenderer.gl;
        }
        return glOrRenderer._bg2_textures || {};
    }

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
        bg2eDeleteTexture(gl, this.texture);
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
