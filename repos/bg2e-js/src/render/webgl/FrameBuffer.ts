
import FrameBuffer from "../FrameBuffer";

export default class WebGLFrameBuffer extends FrameBuffer {
    clear({ color = true, depth = true, stencil = false } = {}) {
        const { state } = this.renderer;
        state.clear({ color, depth, stencil });
    }
}