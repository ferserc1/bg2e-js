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

type ChannelSource = { texture: Texture; channel: TextureChannel; invert: boolean };

export default class TextureMergerRenderer {
    _renderer: Renderer;
    _shader: TextureMergerShader;
    _dirty: boolean;
    _mergedTexture: Texture;
    _renderBuffer: RenderBuffer;
    private sources = new Map<TextureChannel, ChannelSource>();

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
    }

    set size(value: number[]) { this._renderBuffer.size = value; }

    get renderer(): Renderer {
        return this._renderer;
    }

    get dirty(): boolean {
        return this._dirty;
    }

    set dirty(d: boolean) {
        this._dirty = d;
    }

    setTexture(tex: Texture | null, channel: TextureChannel, dstChannel: TextureChannel = TextureChannel.R, invert = false): void {
        if (!tex) {
            throw new Error("TextureMergerRenderer: cannot set null texture");
        }
        if (channel < TextureChannel.R || channel > TextureChannel.A) {
            throw new Error(`TextureMergerRenderer: invalid texture channel ${channel}`);
        }

        this.sources.set(channel, { texture: tex, channel: dstChannel, invert });
        this._dirty = true;
    }

    get mergedTexture(): Texture {
        return this._mergedTexture;
    }

    get isComplete(): boolean {
        return [TextureChannel.R, TextureChannel.G, TextureChannel.B, TextureChannel.A].every(channel => this.sources.has(channel));
    }

    update(): void {
        if (this._dirty) {
            try {
                for (const [target, { texture, channel, invert }] of this.sources) {
                    this._shader.setTexture(texture, target, channel, invert);
                }
                this._renderBuffer.update(() => {
                    this.renderer.presentTexture(null, { clearBuffers: true, shader: this._shader });
                });
            }
            finally {
                this._shader.clearTextures();
            }
            this._dirty = false;
        }
    }

    destroy(): void {
        this.sources.clear();
        this._renderBuffer.destroy();
        this._mergedTexture.destroy();
    }
}
