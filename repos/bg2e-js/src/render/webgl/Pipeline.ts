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


import Pipeline, { BlendEquation, BlendFunction } from "../Pipeline";

const getBlendEquation = (gl: WebGLRenderingContext, blendEquation: BlendEquation): number => {
    switch (blendEquation) {
    case BlendEquation.ADD:
        return gl.FUNC_ADD; 
    case BlendEquation.SUBTRACT:
        return gl.FUNC_SUBTRACT; 
    case BlendEquation.REVERSE_SUBTRACT:
        return gl.FUNC_REVERSE_SUBTRACT; 
    }
    throw new Error(`Invalid blend equation specified in WebGLPipeline: ${ blendEquation }`);
}

const getBlendFunc = (gl: WebGLRenderingContext, blendFunc: BlendFunction): number | null => {
    switch (blendFunc) {
    case BlendFunction.NULL:
        return null;
    case BlendFunction.ZERO:
        return gl.ZERO;
    case BlendFunction.ONE:
        return gl.ONE;
    case BlendFunction.SRC_COLOR:
        return gl.SRC_COLOR;
    case BlendFunction.ONE_MINUS_SRC_COLOR:
        return gl.ONE_MINUS_SRC_COLOR;
    case BlendFunction.DST_COLOR:
        return gl.DST_COLOR;
    case BlendFunction.ONE_MINUS_DST_COLOR:
        return gl.ONE_MINUS_DST_COLOR;
    case BlendFunction.SRC_ALPHA:
        return gl.SRC_ALPHA;
    case BlendFunction.ONE_MINUS_SRC_ALPHA:
        return gl.ONE_MINUS_SRC_ALPHA;
    case BlendFunction.DST_ALPHA:
        return gl.DST_ALPHA;
    case BlendFunction.ONE_MINUS_DST_ALPHA:
        return gl.ONE_MINUS_DST_ALPHA;
    }
    throw new Error(`Invalid blend function specified in WebGLPipeline: ${ blendFunc }`);
}

export default class WebGLPipeline extends Pipeline {
    private _blendEquation!: number;
    private _blendFuncSrcColor!: number | null;
    private _blendFuncSrcAlpha!: number | null;
    private _blendFuncDstColor!: number | null;
    private _blendFuncDstAlpha!: number | null;
    private _blendFunc!: (a: number | null, b: number | null, c?: number | null, d?: number | null) => void;

    create(): void {
        const { gl } = this.renderer;

        // Set the webgl equivalent values
        this._blendEquation = getBlendEquation(gl, this.blendState.blendEquation);
        this._blendFuncSrcColor = getBlendFunc(gl, this.blendState.blendFuncSrc);
        this._blendFuncSrcAlpha = getBlendFunc(gl, this.blendState.blendFuncSrcAlpha);
        this._blendFuncDstColor = getBlendFunc(gl, this.blendState.blendFuncDst);
        this._blendFuncDstAlpha = getBlendFunc(gl, this.blendState.blendFuncDstAlpha);
        if ((this._blendFuncDstAlpha === null && this._blendFuncSrcAlpha !== null) ||
            (this._blendFuncDstAlpha !== null && this._blendFuncSrcAlpha === null))
        {
            throw new Error("WebGLPipeline.create(): Invalid values of blendFuncDstAlpha and blendFuncSrcAlpha");
        }
        this._blendFunc = this._blendFuncDstAlpha !== null ? (a,b) => gl.blendFunc(a,b) : (a,b,c,d) => gl.blendFuncSeparate(a,b,c,d);
    }

    activate(): void {
        const { gl, state } = this.renderer;
        this.blendState.enabled ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND);
        gl.blendEquation(this._blendEquation);
        this._blendFunc(
            this._blendFuncSrcColor,
            this._blendFuncDstColor,
            this._blendFuncSrcAlpha,
            this._blendFuncDstAlpha
        );

        state.depthTestEnabled = this.depthTest;

        if (this.cullFace) {
            gl.enable(gl.CULL_FACE);
        }
        else {
            gl.disable(gl.CULL_FACE);
        }
    }
}