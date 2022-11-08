import Texture, { TextureDataType, TextureTarget, TextureRenderTargetAttachmentNames } from "../base/Texture";
import Vec from "../math/Vec";
import Mat4 from "../math/Mat4";

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

export const CubeMapFace = {
    NONE: 0,
    POSITIVE_X: 1,
    NEGATIVE_X: 2,
    POSITIVE_Y: 3,
    NEGATIVE_Y: 4,
    POSITIVE_Z: 5,
    NEGATIVE_Z: 6
}

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

    beginUpdate(textureFace = CubeMapFace.NONE) {
        throw new Error("RenderBuffer.beginUpdate(): calling base implementation.");
    }

    endUpdate(textureFace = CubeMapFace.NONE) {
        throw new Error("RenderBuffer.endUpdate(): calling base implementation.");
    }

    destroy() {
        throw new Error("RenderBuffer.destory(): calling base implementation.");
    }

    get frameBuffer() {
        throw new Error("RenderBuffer.frameBuffer: calling base implementation");
    }

    update(drawFunc) {
        if (this.type === RenderBufferType.TEXTURE) {
            this.beginUpdate();
            drawFunc();
            this.endUpdate();
        }
        else if (this.type === RenderBufferType.CUBE_MAP) {
            const viewMatrix = Mat4.MakeIdentity();
            const projectionMatrix = Mat4.MakePerspective(90, 1, 0.1, 100000);
            for (let i = 0; i<6; ++i) {
                const face = CubeMapFace.POSITIVE_X + i;
                switch (face) {
                case CubeMapFace.POSITIVE_X:
                    viewMatrix.lookAt([-1, 0, 0], [0, 0, 0], [0,-1, 0]);
                    break;
                case CubeMapFace.NEGATIVE_X:
                    viewMatrix.lookAt([ 1, 0, 0], [0, 0, 0], [0,-1, 0]);
                    break;
                case CubeMapFace.POSITIVE_Y:
                    viewMatrix.lookAt([ 0,-1, 0], [0, 0, 0], [0, 0, 1]);
                    break;
                case CubeMapFace.NEGATIVE_Y:
                    viewMatrix.lookAt([ 0, 1, 0], [0, 0, 0], [0, 0,-1]);
                    break;
                case CubeMapFace.POSITIVE_Z:
                    viewMatrix.lookAt([ 0, 0,-1], [0, 0, 0], [0,-1, 0]);
                    break;
                case CubeMapFace.NEGATIVE_Z:
                    viewMatrix.lookAt([ 0, 0, 1], [0, 0, 0], [0,-1, 0]);
                    break;
                }
                
                this.beginUpdate(face);
                drawFunc(face,viewMatrix,projectionMatrix);
                this.endUpdate(face);
            }
        }
    }
 }
