
import { TextureChannel } from "../base/Texture";

// TODO: Implement texture merger

export default class TextureMergerRenderer {
    constructor(renderer) {
        this._renderer = renderer;

        this._textures = {};
        this._dirty = true;

        this._mergedTexture = null;
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
                this._textures[TextureChannel.A];
    }

    async merge() {
        if (this._dirty) {
            // TODO: Merge textures
            this._dirty = false;
        }
    }
}
