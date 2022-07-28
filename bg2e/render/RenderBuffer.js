import Texture, { TextureDataType, TextureRenderTargetAttachmentNames } from "../base/Texture";
import Vec from "../math/Vec";

const getTextureObjects = (textureRendererOrTexture) => {
    const texture = textureRendererOrTexture instanceof Texture ?
        textureRendererOrTexture : textureRendererOrTexture.texture;
    const textureRenderer = textureRendererOrTexture instanceof Texture ?
        this.renderer.factory.textureRenderer(texture) : textureRendererOrTexture;
    return {
        texture,
        textureRenderer
    }
}

export default class RenderBuffer {
    constructor(renderer, size = new Vec([512,512])) {
        this._renderer = renderer;
        this._attachments = {};
        this._size = size;
        this._dirty = true;
    }

    get renderer() { return this._renderer; }

    get size() { return this._size; }

    set size(s) {
        this._size = new Vec(s); 
        for (const att of this.attachments) {
            const texture = att.texture;
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

        texture.dataType = TextureDataType.RENDER_TARGET;
        texture.size = this.size;
        await texture.loadImageData();
        const textureRenderer = this.renderer.factory.textureRenderer(texture);
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
 }
