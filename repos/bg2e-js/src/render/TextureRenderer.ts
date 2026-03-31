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

import Texture, { TextureTarget } from "../base/Texture";
import Renderer from "./Renderer";

export default class TextureRenderer {
    protected _renderer: Renderer;
    protected _texture: Texture;

    constructor(renderer: Renderer, texture: Texture) {
        if ((texture as any).renderer) {
            throw new Error("Invalid initialization of texture renderer: The texture object is already controlled by another texture renderer.");
        }

        this._renderer = renderer;
        this._texture = texture;
        (this._texture as any)._renderer = this;
    }

    get renderer(): Renderer {
        return this._renderer;
    }

    get texture(): Texture {
        return this._texture;
    }

    getApiObject(texture: Texture): any {
        // Return the specific texture identifier for renderer type
        throw new Error("TextureRenderer: getApiObject() invalid usage of generic implementation of TextureRenderer");
    }

    destroy(): void {
        throw new Error("TextureRenderer: destroy() invalid usage of generic implementation of TextureRenderer");
    }
}
