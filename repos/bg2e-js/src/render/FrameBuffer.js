
export default class FrameBuffer {
    constructor(renderer) {
        this._renderer = renderer;
    }

    get renderer() {
        return this._renderer;
    }

    clearColor() {
        this.clear({ color: true, depth: false, stencil: false });
    }

    clearDepth() {
        this.clear({ color: true, depth: true, stencil: false });
    }

    clearStencil() {
        this.clear({color: false, depth: false, stencil: true });
    }

    clear({ color = true, depth = true, stencil = false } = {}) {
        throw new Error("FrameBuffer: calling base implementation of clear()");
    }
}
