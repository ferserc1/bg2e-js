
import Texture, { TextureChannel, TextureComponentFormat, TextureRenderTargetAttachment } from "../base/Texture";
import TextureMergerShader from "../shaders/TextureMergerShader";
export default class TextureMergerRenderer {
    constructor(renderer) {
        this._renderer = renderer;

        this._shader = new TextureMergerShader(this.renderer);

        this._dirty = true;
    }

    async create() {
        this._mergedTexture = new Texture();
        this._mergedTexture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._mergedTexture.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;

        this._renderBuffer = this.renderer.factory.renderBuffer();
        this._renderBuffer.attachTexture(this._mergedTexture);

        await this._shader.load();
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

    setTexture(tex,channel,dstChannel = TextureChannel.R) {
        this._shader.setTexture(tex,channel,dstChannel);
        this._dirty = true;
    }

    get mergedTexture() {
        return this._mergedTexture;
    }

    get isComplete() {
        return this._shader.isComplete;
    }

    update() {
        if (this._dirty) {
            this._renderBuffer.update(() => {
                // DEBUG: check why it's neccesary to present texture twice
                this.renderer.presentTexture(null, { clear: true, shader: this._shader });
                this.renderer.presentTexture(null, { shader: this._shader });
            });
            //this._dirty = false;
        }
    }
}
