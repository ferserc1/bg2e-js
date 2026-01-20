
import FrameBuffer from "../FrameBuffer";
import WebGLRenderer from "./Renderer";

export default class WebGLFrameBuffer extends FrameBuffer {
    clear({ color = true, depth = true, stencil = false } = {}) {
        const { state } = this.renderer as WebGLRenderer;
        state.clear({ color, depth, stencil });
    }
}