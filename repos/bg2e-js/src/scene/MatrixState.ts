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


import Mat4 from "../math/Mat4";

const pushMatrix = function(mat: Mat4, stack: Mat4[], id: string): void {
    stack.push(new Mat4(mat));
}

const popMatrix = function(mat: Mat4, stack: Mat4[], id: string): void {
    if (stack.length > 0) {
        mat.assign(stack[stack.length - 1]);
        stack.splice(stack.length - 1, 1);
    }
    else {
        throw new Error(`Matrix stack underflow detected in ${id} matrix`);
    }
}

export default class MatrixState {
    private _projection: Mat4;
    private _view: Mat4;
    private _model: Mat4;
    private _projMatrixStack: Mat4[];
    private _viewMatrixStack: Mat4[];
    private _modelMatrixStack: Mat4[];

    constructor() {
        this._projection = Mat4.MakeIdentity();
        this._view = Mat4.MakeIdentity();
        this._model = Mat4.MakeIdentity();

        this._projMatrixStack = [];
        this._viewMatrixStack = [];
        this._modelMatrixStack = [];
    }

    get projection(): Mat4 { return this._projection; }
    get view(): Mat4 { return this._view; }
    get model(): Mat4 { return this._model; }

    pushProjection(): void { pushMatrix(this._projection, this._projMatrixStack, 'projection'); }
    popProjection(): void { popMatrix(this._projection, this._projMatrixStack, 'projection'); }
    pushView(): void { pushMatrix(this._view, this._viewMatrixStack, 'view'); }
    popView(): void { popMatrix(this._view, this._viewMatrixStack, 'view'); }
    pushModel(): void { pushMatrix(this._model, this._modelMatrixStack, 'model'); }
    popModel(): void { popMatrix(this._model, this._modelMatrixStack, 'model'); }
}
