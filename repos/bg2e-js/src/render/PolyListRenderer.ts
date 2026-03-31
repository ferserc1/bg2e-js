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
import type PolyList from "../base/PolyList";

export default class PolyListRenderer {
    protected _renderer: Renderer;
    protected _polyList: PolyList;

    constructor(renderer: Renderer, polyList: PolyList) {
        if ((polyList as any).renderer) {
            throw new Error("Invalid initialization of polyList renderer: the polyList is already controlled by another polyList renderer.")
        }
        this._renderer = renderer;
        this._polyList = polyList;
        (this._polyList as any)._renderer = this;
    }

    get polyList(): PolyList {
        return this._polyList;
    }

    get renderer(): Renderer {
        return this._renderer;
    }

    init(): void {

    }

    // Updates the internal state of the renderer. It is necessary to call this
    // function if the polyList has been modified, so that the internal objects
    // of the specific rendering API are updated.
    refresh(): void {

    }

    bindBuffers(): void {

    }

    draw(): void {

    }

    destroy(): void {
        
    }
}
