
import Vec from "../../math/Vec";
import ShaderProgram from "./ShaderProgram";
import type Renderer from "./Renderer";

export default class State {

    private _renderer: Renderer;

    get CW(): number { return this.gl.CW; }
    get CCW(): number { return this.gl.CCW; }
    get FRONT(): number { return this.gl.FRONT; }
    get BACK(): number { return this.gl.BACK; }
    get FRONT_AND_BACK(): number { return this.gl.FRONT_AND_BACK; }

    constructor(renderer: Renderer) {
        this._renderer = renderer;

        this.cullFaceEnabled = true;
    }

    get renderer(): Renderer {
        return this._renderer;
    }

    get gl(): WebGLRenderingContext {
        return this._renderer.gl;
    }

    get viewport(): Vec {
        return new Vec(this.gl.getParameter(this.gl.VIEWPORT));
    }

    get maxViewportDims(): Vec {
        return new Vec(this.gl.getParameter(this.gl.MAX_VIEWPORT_DIMS));
    }

    set viewport(vp: Vec | number[]) {
        if (vp.length === 2) {
            this.gl.viewport(0, 0, vp[0], vp[1]);
        }
        else if (vp.length >=4) {
            this.gl.viewport(vp[0], vp[1], vp[2], vp[3]);
        }
        else {
            throw new Error("Invalid parameter setting viewport");
        }
    }

    set clearColor(c: Vec | number[]) {
        if (c.length<4) {
            throw new Error("Invalid parameter setting clear color");
        }

        this.gl.clearColor(c[0],c[1],c[2],c[3]);
    }

    get clearColor(): Vec {
        return new Vec(this.gl.getParameter(this.gl.COLOR_CLEAR_VALUE));
    }

    set clearDepth(d: number) {
        this.gl.clearDepth(d);
    }

    get clearDepth(): number {
        return this.gl.getParameter(this.gl.DEPTH_CLEAR_VALUE);
    }

    set clearStencil(s: number) {
        this.gl.clearStencil(s);
    }

    get clearStencil(): number {
        return this.gl.getParameter(this.gl.STENCIL_CLEAR_VALUE);
    }

    get depthMask(): boolean {
        return this.gl.getParameter(this.gl.DEPTH_WRITEMASK);
    }

    set depthMask(m: boolean) {
        this.gl.depthMask(m);
    }

    set frontFace(ff: number) {
        this.gl.frontFace(ff);
    }

    get frontFace(): number {
        return this.gl.getParameter(this.gl.FRONT_FACE);
    }

    set cullFace(cf: number) {
        this.gl.cullFace(cf);
    }

    get cullFace(): number {
        return this.gl.getParameter(this.gl.CULL_FACE_MODE);
    }

    set depthTestEnabled(e: boolean) {
        e ? this.gl.enable(this.gl.DEPTH_TEST) :
            this.gl.disable(this.gl.DEPTH_TEST);
    }

    get depthTestEnabled(): boolean {
        return this.gl.getParameter(this.gl.DEPTH_TEST);
    }

    set cullFaceEnabled(e: boolean) {
        e ? this.gl.enable(this.gl.CULL_FACE) :
            this.gl.disable(this.gl.CULL_FACE);
    }

    get blendEnabled(): boolean {
        return this.gl.getParameter(this.gl.BLEND);
    }

    set blendEnabled(b: boolean) {
        b ? this.gl.enable(this.gl.BLEND) :
            this.gl.disable(this.gl.BLEND);
    }

    get cullFaceEnabled(): boolean {
        return this.gl.getParameter(this.gl.CULL_FACE);
    }

    set shaderProgram(program: ShaderProgram) {
        program.useProgram();
    }

    get shaderProgram(): ShaderProgram | null {
        const glProgram = this.gl.getParameter(this.gl.CURRENT_PROGRAM);
        if (glProgram) {
            return ShaderProgram.GetShaderProgram(glProgram);
        }
        else {
            return null;
        }
    }

    clear({ color = true, depth = true, stencil = false}: { color?: boolean, depth?: boolean, stencil?: boolean } = {}): void {
        const clearValues = (color ? this.gl.COLOR_BUFFER_BIT : 0) |
                            (depth ? this.gl.DEPTH_BUFFER_BIT : 0) |
                            (stencil ? this.gl.STENCIL_BUFFER_BIT : 0);
        this.gl.clear(clearValues);
    }


    
}
