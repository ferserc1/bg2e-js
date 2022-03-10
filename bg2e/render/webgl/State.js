
import Vec from "../../math/Vec";

export default class State {
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
        return gl.getParameter(gl.STENCIL_CLEAR_VALUE);
    }

    clear({ color = true, depth = true, stencil = false} = {}) {
        const clearValues = (color ? this.gl.COLOR_BUFFER_BIT : 0) |
                            (depth ? this.gl.DEPTH_BUFFER_BIT : 0) |
                            (stencil ? this.gl.STENCIL_BUFFER_BIT : 0);
        this.gl.clear(clearValues);
    }
}
