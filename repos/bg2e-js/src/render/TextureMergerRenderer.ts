/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import Texture, { TextureChannel, TextureComponentFormat, TextureRenderTargetAttachment, TextureWrap } from "../base/Texture";
import TextureMergerShader from "../shaders/TextureMergerShader";
import Renderer from "./Renderer";
import type RenderBuffer from "./RenderBuffer";

export default class TextureMergerRenderer {
    _renderer: Renderer;
    _shader: TextureMergerShader;
    _dirty: boolean;
    _mergedTexture: Texture;
    _renderBuffer: RenderBuffer;

    constructor(renderer: Renderer) {
        this._renderer = renderer;

        this._shader = TextureMergerShader.GetUnique(this.renderer);

        this._dirty = true;

        this._mergedTexture = new Texture();
        this._mergedTexture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._mergedTexture.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;
        this._mergedTexture.wrapModeXY = TextureWrap.REPEAT;

        this._renderBuffer = this.renderer.factory.renderBuffer();
        this._renderBuffer.attachTexture(this._mergedTexture);

        this._shader.load();
    }

    get renderer(): Renderer {
        return this._renderer;
    }

    get dirty(): boolean {
        return this._dirty;
    }

    set dirty(d: boolean) {
        this._dirty = d;
    }

    setTexture(tex: Texture | null, channel: TextureChannel, dstChannel: TextureChannel = TextureChannel.R): void {
        if (!tex) {
            throw new Error("TextureMergerRenderer: cannot set null texture");
        }

        this._shader.setTexture(tex, channel, dstChannel);
        this._dirty = true;
    }

    get mergedTexture(): Texture {
        return this._mergedTexture;
    }

    get isComplete(): boolean {
        return this._shader.isComplete ?? false;
    }

    update(): void {
        if (this._dirty) {
            this._renderBuffer.update(() => {
                // DEBUG: check why it's neccesary to present texture twice
                this.renderer.presentTexture(null, { clearBuffers: true, shader: this._shader });
                this.renderer.presentTexture(null, { shader: this._shader });
            });
            this._dirty = false;
        }
    }
}
