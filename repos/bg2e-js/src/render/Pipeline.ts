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

export enum BlendEquation {
    ADD = 1,
    SUBTRACT = 2,
    REVERSE_SUBTRACT = 3
}

export enum BlendFunction {
    NULL = 0,
    ZERO = 1,
    ONE = 2,
    SRC_COLOR = 3,
    ONE_MINUS_SRC_COLOR = 4,
    DST_COLOR = 5,
    ONE_MINUS_DST_COLOR = 6,
    SRC_ALPHA = 7,
    ONE_MINUS_SRC_ALPHA = 8,
    DST_ALPHA = 9,
    ONE_MINUS_DST_ALPHA = 10
}

export interface BlendState {
    enabled: boolean;
    blendEquation: BlendEquation;
    blendFuncSrc: BlendFunction;
    blendFuncDst: BlendFunction;
    blendFuncSrcAlpha: BlendFunction;
    blendFuncDstAlpha: BlendFunction;
}

export interface BlendStateParams {
    enabled?: boolean;
    blendEquation?: BlendEquation;
    blendFuncSrc?: BlendFunction;
    blendFuncDst?: BlendFunction;
    blendFuncSrcAlpha?: BlendFunction;
    blendFuncDstAlpha?: BlendFunction;
}

export default class Pipeline {
    protected _renderer: any;
    protected _blendState: BlendState = {
        enabled: false,
        blendEquation: BlendEquation.ADD,
        blendFuncSrc: BlendFunction.SRC_ALPHA,
        blendFuncDst: BlendFunction.ONE_MINUS_SRC_ALPHA,
        blendFuncSrcAlpha: BlendFunction.SRC_ALPHA,
        blendFuncDstAlpha: BlendFunction.ONE_MINUS_SRC_ALPHA
    }
    protected _depthTestEnabled: boolean;
    protected _cullFace: boolean;

    constructor(renderer: any) {
        this._renderer = renderer;

        this._depthTestEnabled = true;

        this._cullFace = true;
    }

    get renderer(): any {
        return this._renderer;
    }

    setBlendState({
        enabled = false,
        blendEquation = BlendEquation.ADD,
        blendFuncSrc = BlendFunction.SRC_ALPHA,
        blendFuncDst = BlendFunction.ONE_MINUS_SRC_ALPHA,
        blendFuncSrcAlpha = BlendFunction.SRC_ALPHA,
        blendFuncDstAlpha = BlendFunction.ONE_MINUS_SRC_ALPHA
    }: BlendStateParams = {}): void {
        this._blendState = {
            enabled,
            blendEquation,
            blendFuncSrc,
            blendFuncDst,
            blendFuncSrcAlpha,
            blendFuncDstAlpha
        }
    }

    get blendState(): BlendState {
        return this._blendState;
    }

    get depthTest(): boolean {
        return this._depthTestEnabled;
    }

    set depthTest(dt: boolean) {
        this._depthTestEnabled = dt;
    }

    set cullFace(cf: boolean) {
        this._cullFace = cf;
    }

    get cullFace(): boolean {
        return this._cullFace;
    }
    
    create(): void {
        throw new Error("Pipeline.create(): calling base class method.");
    }

    activate(): void {
        throw new Error("Pipeline.activate(): calling base class method.");
    }
}