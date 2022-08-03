
import Vec from "../../math/Vec";
import ShaderProgram from "./ShaderProgram";

export default class State {

    get CW() { return this.gl.CW; }
    get CCW() { return this.gl.CCW; }
    get FRONT() { return this.gl.FRONT; }
    get BACK() { return this.gl.BACK; }
    get FRONT_AND_BACK() { return this.gl.FRONT_AND_BACK; }

    constructor(renderer) {
        this._renderer = renderer;
    }

    get renderer() {
        return this._renderer;
    }

    get gl() {
        return this._renderer.gl;
    }

    get viewport() {
        return new Vec(this.gl.getParameter(this.gl.VIEWPORT));
    }

    get maxViewportDims() {
        return new Vec(this.gl.getParameter(this.gl.MAX_VIEWPORT_DIMS));
    }

    set viewport(vp) {
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

    set clearColor(c) {
        if (c.length<4) {
            throw new Error("Invalid parameter setting clear color");
        }

        this.gl.clearColor(c[0],c[1],c[2],c[3]);
    }

    get clearColor() {
        return new Vec(this.gl.getParameter(this.gl.COLOR_CLEAR_VALUE));
    }

    set clearDepth(d) {
        this.gl.clearDepth(d);
    }

    get clearDepth() {
        return gl.getParameter(gl.DEPTH_CLEAR_VALUE);
    }

    set clearStencil(s) {
        this.gl.clearStencil(s);
    }

    get clearStencil() {
        return this.gl.getParameter(this.gl.STENCIL_CLEAR_VALUE);
    }

    get depthMask() {
        return this.gl.getParameter(this.gl.DEPTH_WRITEMASK);
    }

    set depthMask(m) {
        this.gl.depthMask(m);
    }

    set frontFace(ff) {
        this.gl.frontFace(ff);
    }

    get frontFace() {
        return this.gl.getParameter(this.gl.FRONT_FACE);
    }

    set cullFace(cf) {
        this.gl.cullFace(cf);
    }

    get cullFace() {
        return this.gl.getParameter(this.gl.CULL_FACE_MODE);
    }

    set depthTestEnabled(e) {
        e ? this.gl.enable(this.gl.DEPTH_TEST) :
            this.gl.disable(this.gl.DEPTH_TEST);
    }

    get depthTestEnabled() {
        return this.gl.getParameter(this.gl.DEPTH_TEST);
    }

    set cullFaceEnabled(e) {
        e ? this.gl.enable(this.gl.CULL_FACE) :
            this.gl.disable(this.gl.CULL_FACE);
    }

    get cullFaceEnabled() {
        return this.gl.getParameter(this.gl.CULL_FACE);
    }

    set shaderProgram(program) {
        program.useProgram();
    }

    get shaderProgram() {
        const glProgram = this.gl.getParameter(this.gl.CURRENT_PROGRAM);
        if (glProgram) {
            return ShaderProgram.GetShaderProgram(glProgram);
        }
        else {
            return null;
        }
    }

    clear({ color = true, depth = true, stencil = false} = {}) {
        const clearValues = (color ? this.gl.COLOR_BUFFER_BIT : 0) |
                            (depth ? this.gl.DEPTH_BUFFER_BIT : 0) |
                            (stencil ? this.gl.STENCIL_BUFFER_BIT : 0);
        this.gl.clear(clearValues);
    }


    
}
