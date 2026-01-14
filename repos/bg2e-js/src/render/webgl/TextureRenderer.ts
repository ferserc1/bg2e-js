

import TextureRenderer from '../TextureRenderer';
import Texture, { 
    TextureTargetName,
    TextureDataType,
    TextureComponentFormat,
    TextureRenderTargetAttachment,
    TextureTarget,
    textureWrapString,
    textureFilterString
} from '../../base/Texture';
import Vec from '../../math/Vec';
import { generateUUID } from '../../tools/crypto';
import Renderer from '../Renderer';

const getTarget = (gl: WebGLRenderingContext, tex: Texture): number => {
    switch (tex.target) {
    case TextureTarget.TEXTURE_2D:
        return gl.TEXTURE_2D;
    case TextureTarget.CUBE_MAP:
        return gl.TEXTURE_CUBE_MAP;
    default:
        throw new Error("Error creating WebGL Texture: invalid target");
    }
}

const getClampMode = (gl: WebGLRenderingContext, mode: number): number => {
    if (mode === 1) {
        return gl.CLAMP_TO_EDGE;
    }
    else {
        const name = textureWrapString(mode);
        return (gl as any)[name];
    }
}

const getTextureFilter = (gl: WebGLRenderingContext, filter: number): number => {
    const name = textureFilterString(filter);
    return (gl as any)[name];
}

const getDataFormat = (gl: WebGLRenderingContext, texture: Texture): number => {
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

const bg2eCreateTexture = (gl: any, textureObject: any): void => {
    textureObject._apiObject = gl.createTexture();
    textureObject._apiObject._bg2_uuid = generateUUID();
    gl._bg2_textures = gl._bg2_textures || {};
    let id = textureObject.name || textureObject._apiObject._bg2_uuid;
    if (gl._bg2_textures[id] && gl._bg2_textures[id] !== textureObject) {
        id = textureObject.name + "_" + textureObject._apiObject._bg2_uuid;
    }
    gl._bg2_textures[id] = textureObject;
}

const bg2eDeleteTexture = (gl: any, textureObject: any): void => {
    if (textureObject._apiObject) {
        gl.deleteTexture(textureObject._apiObject);
        delete gl._bg2_textures[textureObject._apiObject._bg2_uuid];
        textureObject._apiObject = null;
        textureObject.setUpdated(false);
    }
}

const getWebGLTexture = (gl: WebGLRenderingContext, textureObject: any): void => {
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
    static ListTextures(glOrRenderer: Renderer | any): Record<string, any> {
        if (glOrRenderer instanceof Renderer) {
            glOrRenderer = (glOrRenderer as any).gl;
        }
        return glOrRenderer._bg2_textures || {};
    }

    getApiObject(): any {
        if (this.texture.dirty) {
            try {
                getWebGLTexture((this.renderer as any).gl, this.texture);
                this.texture.setUpdated();
            }
            catch (err: any) {
                console.warn(err.message);
            }
        }
        return (this.texture as any)._apiObject;
    }
    
    destroy(): void {
        const { gl } = this.renderer as any;
        bg2eDeleteTexture(gl, this.texture);
    }

    ///// webgl specific functions
    // Returns the webgl target (TEXTURE_2D, TEXTURE_3D...)
    get target(): number {
        return (this.renderer as any).gl[TextureTargetName[this.texture.target]];
    }

    activeTexture(index: number = 0): void {
        const { gl } = this.renderer as any;
        gl.activeTexture(gl.TEXTURE0 + index);
    }

    bindTexture(): void {
        (this.renderer as any).gl.bindTexture(this.target, this.getApiObject());
    }
}
