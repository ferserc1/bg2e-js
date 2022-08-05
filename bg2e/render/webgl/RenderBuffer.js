
import { TextureRenderTargetAttachment, TextureTargetName } from "../../base/Texture";
import Vec from "../../math/Vec";
import RenderBuffer, { RenderBufferType, CubeMapFace } from "../RenderBuffer";

function getAttachmentPoint(gl,att) {
    switch (Number(att)) {
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_0:
        return gl.COLOR_ATTACHMENT0;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_1:
        return gl.COLOR_ATTACHMENT1;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_2:
        return gl.COLOR_ATTACHMENT2;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_3:
        return gl.COLOR_ATTACHMENT3;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_4:
        return gl.COLOR_ATTACHMENT4;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_5:
        return gl.COLOR_ATTACHMENT5;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_6:
        return gl.COLOR_ATTACHMENT6;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_7:
        return gl.COLOR_ATTACHMENT7;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_8:
        return gl.COLOR_ATTACHMENT8;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_9:
        return gl.COLOR_ATTACHMENT9;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_10:
        return gl.COLOR_ATTACHMENT10;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_11:
        return gl.COLOR_ATTACHMENT11;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_12:
        return gl.COLOR_ATTACHMENT12;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_13:
        return gl.COLOR_ATTACHMENT13;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_14:
        return gl.COLOR_ATTACHMENT14;
    case TextureRenderTargetAttachment.COLOR_ATTACHMENT_15:
        return gl.COLOR_ATTACHMENT15;
    case TextureRenderTargetAttachment.DEPTH_ATTACHMENT:
        return gl.DEPTH_ATTACHMENT;
    case TextureRenderTargetAttachment.STENCIL_ATTACHMENT:
        return gl.STENCIL_ATTACHMET;
    default:
        throw new Error(`RenderBuffer.beginUpdate() Error creating render buffer. Invalid attachment ${att}`);
    }
}

function getTextureTarget(gl,texture) {
    return gl[TextureTargetName[texture.target]];
}

function beginUpdateTexture() {
    const { gl } = this.renderer;

    if (this.dirty) {
        if (this._framebuffer) {
            gl.deleteFramebuffer(this._framebuffer);
        }
        this._framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);

        let depthBufferPresent = false;
        for (const attachment in this.attachments) {
            const textureRenderer = this.attachments[attachment];
            const textureApi = textureRenderer.getApiObject();
            const attachmentPoint = getAttachmentPoint(gl,attachment);
            const textureTarget = getTextureTarget(gl,textureRenderer.texture);
            const level = 0;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, textureTarget, textureApi, level);
            depthBufferPresent = depthBufferPresent || Number(attachment) === TextureRenderTargetAttachment.DEPTH_ATTACHMENT;
        }

        if (!depthBufferPresent) {
            this._depthBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthBuffer);

            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.size.width, this.size.height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthBuffer);
        }

        this.setUpdated(true);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error("Error initializing render buffer: the framebuffer is not complete");
        }
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);

    this._screenViewport = this.renderer.state.viewport;
    this.renderer.state.viewport = this.size;
}

function endUpdateTexture() {
    const { gl } = this.renderer;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.renderer.state.viewport = this._screenViewport;
}

function beginUpdateCubemap(face) {
    // TODO: Implement this
    // https://stackoverflow.com/questions/38854832/rendering-to-a-cubemap-texture-with-a-framebuffer
    // https://stackoverflow.com/questions/34639572/render-to-cubemap-tutorial-in-webgl
    // https://stackoverflow.com/questions/43634998/can-gl-depth-component-be-used-as-the-format-of-cubemaps
    // One framebuffer and one depth buffer for each view
    this._framebuffers = [];
    this._depthBuffers = [];
    throw new Error("Not implemented");
}

function endUpdateCubemap() {
    throw new Error("Not implemented");
}
export default class WebGLRenderBuffer extends RenderBuffer {
    constructor(renderer) {
        super(renderer);
    }

    beginUpdate(textureFace = CubeMapFace.NONE) {
        if (this.type === RenderBufferType.TEXTURE) {
            beginUpdateTexture.apply(this);
        }
        else if (this.type === RenderBufferType.CUBE_MAP) {
            beginUpdateCubemap.apply(this, [textureFace]);
        }
        else {
            throw new Error("The render buffer is not initialized");
        }
    }

    endUpdate(textureFace = CubeMapFace.NONE) {
        if (this.type === RenderBufferType.TEXTURE) {
            endUpdateTexture.apply(this);
        }
        else if (this.type === RenderBufferType.CUBE_MAP) {
            endUpdateCubemap.apply(this, [textureFace]);
        }
        else {
            throw new Error("The render buffer is not initialized");
        }
    }

    destroy() {
        const { gl }  = this.renderer;
        if (this.type === RenderBufferType.TEXTURE) {
            if (this._framebuffer) {
                gl.deleteFramebuffer(this._framebuffer);
                this._framebuffer = null;
            }
            if (this._depthBuffer) {
                gl.deleteRenderbuffer(this._depthBuffer);
                this._depthBuffer = null;
            }
        }
        else if (this.type === RenderBufferType.CUBE_MAP) {
            if (this._framebuffers?.length) {
                this._framebuffers.forEach(fb => gl.deleteFramebuffer(fb));
            }
            if (this._depthBuffers?.length) {
                this._depthBuffers.forEach(db => gl.deleteRenderbuffer(db));
            }
            this._framebuffers = null;
            this._depthBuffers = null;
        }
    }
}