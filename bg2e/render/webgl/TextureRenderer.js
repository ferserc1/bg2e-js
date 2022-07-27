

import TextureRenderer from '../TextureRenderer';
import Texture, { 
    TextureWrapName, 
    TextureFilterName, 
    TextureTargetName,
    TextureDataType
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

const beginUpdateRenderTargetTexture = (gl,textureData) => {
    ///  https://webglfundamentals.org/webgl/lessons/webgl-render-to-texture.html
    // TODO:
    // 1) resize texture, if needed, set viewport, etc

    // 2) bind/create framebuffers

    // 3) Setup attachment
    throw new Error("beginUpdateRenderTargetTexture() not implemented");
}

const endUpdateRenderTargetTexture = (gl,textureData) => {
    // TODO;
    // 1) set framebuffer to null
    throw new Error("endUpdateRenderTargetTexture(): not implemented");
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

    beginUpdate(target = TextureTarget.TEXTURE_2D) {
        if (this.texture.dataType !== TextureDataType.RENDER_TARGET) {
            throw new Error("Invalid use of `beginUpdate()` on non render target texture.");
        }

        this._beginUpdateTextureData = {
            texture: this.texture
        };

        beginUpdateRenderTargetTexture(gl,this._beginUpdateTextureData);
    }

    endUpdate() {
        if (this.texture.dataType !== TextureDataType.RENDER_TARGET) {
            throw new Error("Invalid use of `endUpdate()` on non render target texture.");
        }

        if (!this._beginUpdateTextureData) {
            throw new Error("Calling TextureRenderer.endUpdate() without previous call to beginUpdate()");
        }

        endUpdateRenderTargetTexture(gl, this._beginUpdateTextureData);

        this._beginUpdateTextureData = null;
    }
}
