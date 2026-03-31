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

import Texture from "../base/Texture";
import Renderer from "./Renderer";
import Material from "../base/Material";
import TextureRenderer from "./TextureRenderer";

export default class MaterialRenderer {
    protected _renderer: Renderer;
    protected _material: Material;

    constructor(renderer: Renderer, material: Material) {
        this._renderer = renderer;
        this._material = material;
    }

    get renderer() {
        return this._renderer;
    }

    get material() {
        return this._material;
    }

    getTextureRenderer(materialAttribute: keyof Material): TextureRenderer | null {
        const element = this.material[materialAttribute];
        if (element instanceof Texture) {
            // The texture renderer factory will create a texture renderer, or
            // return the existing one
            return this.renderer.factory.texture(element);
        }
        return null;
    }

}

