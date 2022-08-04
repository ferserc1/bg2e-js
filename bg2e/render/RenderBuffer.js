import Texture, { TextureDataType, TextureTarget, TextureRenderTargetAttachmentNames } from "../base/Texture";
import Vec from "../math/Vec";

export const RenderBufferType = {
    UNINITIALIZED: 0,
    TEXTURE: 1,
    CUBE_MAP: 2
};

export const RenderBufferTypeName = {
    0: 'UNINITIALIZED',
    1: 'TEXTURE',
    2: 'CUBE_MAP'
};

function getTargetType(texture) {
    if (texture.target === TextureTarget.TEXTURE_2D) {
        return RenderBufferType.TEXTURE;
    }
    else if (texture.target === TextureTarget.CUBE_MAP) {
        return RenderBufferType.CUBE_MAP;
    }
}

function getRenderBufferTypeName(type) {
    return RenderBufferTypeName[type];
}


export default class RenderBuffer {
    constructor(renderer, size = new Vec([512,512])) {
        this._renderer = renderer;
        this._attachments = {};
        this._size = size;
        this._dirty = true;
        this._type = RenderBufferType.UNINITIALIZED;
    }

    get renderer() { return this._renderer; }

    get type() { return this._type; }

    get size() { return this._size; }

    set size(s) {
        this._size = new Vec(s); 
        for (const att in this.attachments) {
            const textureRenderer = this.attachments[att];
            const texture = textureRenderer.texture;
            if (!Vec.Equals(texture.size, this.size)) {
                texture.size = this.size;
            }
        }
        this._dirty = true;
    }

    // This is an object of type { TextureRenderTargetAttachmentName: TextureRenderer }
    get attachments() { return this._attachments; }

    getTextureRenderer(attachment) {
        return this._attachments[attachment];
    }

    getTexture(attachment) {
        return this.getAttachment(attachment)?.texture;
    }

    get dirty() { return this._dirty; }

    setUpdated(updated = true) { this._dirty = !updated; }

    async attachTexture(texture) {
        if (this._attachments[texture.renderTargetAttachment]) {
            throw new Error(`RenderBuffer.attachTexture(): The attachment is occupied by another texture ${TextureRenderTargetAttachmentNames[texture.renderTargetAttachment]}`);
        }

        if (this.type !== RenderBufferType.UNINITIALIZED) {
            const type = getTargetType(texture);
            if (this.type !== type) {
                throw new Error(`Invalid texture attachment. RenderBuffer is ${ getRenderBufferTypeName(this.type) }, but the new attachment is ${ getRenderBufferTypeName(type) }`);
            }
        }
        else {
            this._type = getTargetType(texture);
        }

        texture.dataType = TextureDataType.RENDER_TARGET;
        texture.size = this.size;
        await texture.loadImageData();
        const textureRenderer = this.renderer.factory.texture(texture);
        this._attachments[texture.renderTargetAttachment] = textureRenderer;
    }

    detachTexture(texture) {
        const textureRenderer = this._attachments[texture.renderTargetAttachment];
        if (!textureRenderer) {
            throw new Error(`RenderBuffer.detachTexture(): no texture attached to ${TextureRenderTargetAttachmentNames[texture.renderTargetAttachment]}`);
        }

        if (textureRenderer.texture !== texture) {
            throw new Error(`RenderBuffer.detachTexture(): the texture is not attached to ${TextureRenderTargetAttachmentNames[texture.renderTargetAttachment]}`);
        }

        this._attachments[texture.renderTargetAttachment] = null;
        textureRenderer.deleteTexture();
        this._dirty = true;
    }

    beginUpdate() {
        throw new Error("RenderBuffer.beginUpdate(): calling base implementation.");
    }

    endUpdate() {
        throw new Error("RenderBuffer.endUpdate(): calling base implementation.");
    }

    destroy() {
        throw new Error("RenderBuffer.destory(): calling base implementation.");
    }
 }
