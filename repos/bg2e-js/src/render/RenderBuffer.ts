import Texture, { TextureDataType, TextureTarget, TextureRenderTargetAttachmentNames } from "../base/Texture";
import Vec from "../math/Vec";
import Mat4 from "../math/Mat4";

export enum RenderBufferType {
    UNINITIALIZED = 0,
    TEXTURE = 1,
    CUBE_MAP = 2
}

export const RenderBufferTypeName: Record<RenderBufferType, string> = {
    [RenderBufferType.UNINITIALIZED]: 'UNINITIALIZED',
    [RenderBufferType.TEXTURE]: 'TEXTURE',
    [RenderBufferType.CUBE_MAP]: 'CUBE_MAP'
};

export enum CubeMapFace {
    NONE = 0,
    POSITIVE_X = 1,
    NEGATIVE_X = 2,
    POSITIVE_Y = 3,
    NEGATIVE_Y = 4,
    POSITIVE_Z = 5,
    NEGATIVE_Z = 6
}

export type DrawFunc = (face?: CubeMapFace, viewMatrix?: Mat4, projectionMatrix?: Mat4) => void;

function getTargetType(texture: Texture): RenderBufferType | undefined {
    if (texture.target === TextureTarget.TEXTURE_2D) {
        return RenderBufferType.TEXTURE;
    }
    else if (texture.target === TextureTarget.CUBE_MAP) {
        return RenderBufferType.CUBE_MAP;
    }
}

function getRenderBufferTypeName(type: RenderBufferType): string {
    return RenderBufferTypeName[type];
}


export default class RenderBuffer {
    protected _renderer: any;
    protected _attachments: Record<string, any>;
    protected _size: Vec;
    protected _dirty: boolean;
    protected _type: RenderBufferType;

    constructor(renderer: any, size: Vec = new Vec([512,512])) {
        this._renderer = renderer;
        this._attachments = {};
        this._size = size;
        this._dirty = true;
        this._type = RenderBufferType.UNINITIALIZED;
    }

    get renderer(): any { return this._renderer; }

    get type(): RenderBufferType { return this._type; }

    get size(): Vec { return this._size; }

    set size(s: Vec | number[]) {
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
    get attachments(): Record<string, any> { return this._attachments; }

    getTextureRenderer(attachment: string): any {
        return this._attachments[attachment];
    }

    getTexture(attachment: string): Texture | undefined {
        return this.getTextureRenderer(attachment)?.texture;
    }

    get dirty(): boolean { return this._dirty; }

    setUpdated(updated: boolean = true): void { this._dirty = !updated; }

    async attachTexture(texture: Texture): Promise<void> {
        if (this._attachments[texture.renderTargetAttachment]) {
            throw new Error(`RenderBuffer.attachTexture(): The attachment is occupied by another texture ${TextureRenderTargetAttachmentNames[texture.renderTargetAttachment]}`);
        }

        if (this.type !== RenderBufferType.UNINITIALIZED) {
            const type = getTargetType(texture);
            if (this.type !== type) {
                throw new Error(`Invalid texture attachment. RenderBuffer is ${ getRenderBufferTypeName(this.type) }, but the new attachment is ${ getRenderBufferTypeName(type || RenderBufferType.UNINITIALIZED) }`);
            }
        }
        else {
            this._type = getTargetType(texture) || RenderBufferType.UNINITIALIZED;
        }

        texture.dataType = TextureDataType.RENDER_TARGET;
        texture.size = this.size;
        await texture.loadImageData();
        const textureRenderer = this.renderer.factory.texture(texture);
        this._attachments[texture.renderTargetAttachment] = textureRenderer;
    }

    detachTexture(texture: Texture): void {
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

    beginUpdate(textureFace: CubeMapFace = CubeMapFace.NONE): void {
        throw new Error("RenderBuffer.beginUpdate(): calling base implementation.");
    }

    endUpdate(textureFace: CubeMapFace = CubeMapFace.NONE): void {
        throw new Error("RenderBuffer.endUpdate(): calling base implementation.");
    }

    destroy(): void {
        throw new Error("RenderBuffer.destory(): calling base implementation.");
    }

    get frameBuffer(): any {
        throw new Error("RenderBuffer.frameBuffer: calling base implementation");
    }

    // Save and restore buffer states must save the currently binded array buffer and restore it
    saveVertexBufferState(): void {
        throw new Error("RenderBuffer.saveVertexBufferState: callig base implementation");
    }

    restoreVertexBufferState(): void {
        throw new Error("RenderBuffer.restoreVertexBufferState: calling base implementation");
    }

    update(drawFunc: DrawFunc): void {
        this.saveVertexBufferState();
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
                    viewMatrix.lookAt(new Vec([-1, 0, 0]), new Vec([0, 0, 0]), new Vec([0,-1, 0]));
                    break;
                case CubeMapFace.NEGATIVE_X:
                    viewMatrix.lookAt(new Vec([ 1, 0, 0]), new Vec([0, 0, 0]), new Vec([0,-1, 0]));
                    break;
                case CubeMapFace.POSITIVE_Y:
                    viewMatrix.lookAt(new Vec([ 0,-1, 0]), new Vec([0, 0, 0]), new Vec([0, 0, 1]));
                    break;
                case CubeMapFace.NEGATIVE_Y:
                    viewMatrix.lookAt(new Vec([ 0, 1, 0]), new Vec([0, 0, 0]), new Vec([0, 0,-1]));
                    break;
                case CubeMapFace.POSITIVE_Z:
                    viewMatrix.lookAt(new Vec([ 0, 0,-1]), new Vec([0, 0, 0]), new Vec([0,-1, 0]));
                    break;
                case CubeMapFace.NEGATIVE_Z:
                    viewMatrix.lookAt(new Vec([ 0, 0, 1]), new Vec([0, 0, 0]), new Vec([0,-1, 0]));
                    break;
                }
                
                this.beginUpdate(face);
                drawFunc(face,viewMatrix,projectionMatrix);
                this.endUpdate(face);
            }
        }
        this.restoreVertexBufferState();
    }

    readPixels(x: number, y: number, width: number, height: number): Uint8Array | undefined {
        return undefined;
    }
 }
