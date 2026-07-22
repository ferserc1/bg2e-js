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

export interface ClearOptions {
    color?: boolean;
    depth?: boolean;
    stencil?: boolean;
}

export default class FrameBuffer {
    protected _renderer: Renderer;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
    }

    get renderer(): Renderer {
        return this._renderer;
    }

    clearColor(): void {
        this.clear({ color: true, depth: false, stencil: false });
    }

    clearDepth(): void {
        this.clear({ color: false, depth: true, stencil: false });
    }

    clearStencil(): void {
        this.clear({color: false, depth: false, stencil: true });
    }

    clear({ color = true, depth = true, stencil = false }: ClearOptions = {}): void {
        throw new Error("FrameBuffer: calling base implementation of clear()");
    }
}
