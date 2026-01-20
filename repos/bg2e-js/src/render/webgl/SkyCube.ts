import SkyCube from "../SkyCube";
import WebGLRenderer from "./Renderer";

export default class WebGLSkyCube extends SkyCube {
    draw() {
        const { state } = this.renderer as WebGLRenderer;
        if (!this._renderState) {
            throw new Error("SkyCube.draw(): the render state is not updated");
        }

        const dm = state.depthMask;
        state.depthMask = false;
        this._renderState.draw();
        state.depthMask = dm;
    }
}