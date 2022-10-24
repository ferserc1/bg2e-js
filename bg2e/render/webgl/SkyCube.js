import SkyCube from "../SkyCube";

export default class WebGLSkyCube extends SkyCube {
    draw() {
        const { state } = this.renderer;
        if (!this._renderState) {
            throw new Error("SkyCube.draw(): the render state is not updated");
        }

        const dm = state.depthMask;
        const face = state.frontFace;
        state.frontFace = state.CW;
        state.depthMask = false;
        this._renderState.draw();
        state.depthMask = dm;
        state.frontFace = face;
    }
}