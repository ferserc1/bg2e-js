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

import type Renderer from "./Renderer";
import type PolyListRenderer from "./PolyListRenderer";
import type MaterialRenderer from "./MaterialRenderer";
import type { SelectionState } from "./RenderState";
import Mat4 from "../math/Mat4";

export default class Shader {
    protected _renderer: Renderer;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
    }

    get renderer(): Renderer { return this._renderer; }

    async load(): Promise<void> {

    }
    
    // The selectionState parameter is only used by the shaders involved in the picking
    // system (see PickSelectionShader): it allows the object that filled the render queue
    // to override the color code and the selection flag stored in the PolyList. Shaders
    // that don't take part in the picking process can simply omit this parameter.
    setup(
        plistRenderer: PolyListRenderer,
        materialRenderer: MaterialRenderer,
        modelMatrix: Mat4 = Mat4.MakeIdentity(),
        viewMatrix: Mat4 = Mat4.MakeIdentity(),
        projectionMatrix: Mat4 = Mat4.MakeIdentity(),
        selectionState: SelectionState | null = null
    ): void {
        throw new Error("Error: using an abstract implementation of render.Shader.");
    }

    destroy(): void {
        throw new Error("Error: using an abstract implementation of render.Shader.destroy()");
    }
}
