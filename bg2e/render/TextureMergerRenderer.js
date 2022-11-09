
import Texture, { TextureChannel, TextureComponentFormat, TextureRenderTargetAttachment } from "../base/Texture";

export default class TextureMergerRenderer {
    constructor(renderer) {
        this._renderer = renderer;

        this._textures = {};
        this._dirty = true;

        this._mergedTexture = null;
    }

    async create() {
        this._mergedTexture = new Texture();
        this._mergedTexture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._mergedTexture.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;

        this._renderBuffer = this.renderer.factory.renderBuffer();
        this._renderBuffer.attachTexture(this._mergedTexture);

        // TODO: Create texture merge shader
        this._shader = null;
    }

    get renderer() {
        return this._renderer;
    }

    get dirty() {
        return this._dirty;
    }

    set dirty(d) {
        this._dirty = d;
    }

    setTexture(tex,channel) {
        if (channel<TextureChannel.R || channel>TextureChannel.A) {
            throw new Error(`TextureMergerRenderer: invalid texture channel set ${ channel }`);
        }
        this._textures[channel] = tex;
        this._dirty = true;
    }

    get mergedTexture() {
        return this._mergedTexture;
    }

    get isComplete() {
        return  this._textures[TextureChannel.R] &&
                this._textures[TextureChannel.G] &&
                this._textures[TextureChannel.B] &&
                this._textures[TextureChannel.A] && true;
    }

    async merge() {
        this._renderBuffer.update(() => {
            this._renderBuffer.frameBuffer.clear();
            // TODO: present texture
        });
    }
}
