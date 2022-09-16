import SkyCube from "../SkyCube";

export default class WebGLSkyCube extends SkyCube {
    draw() {
        if (!this._renderState) {
            throw new Error("SkyCube.draw(): the render state is not updated");
        }

        const dm = this.renderer.state.depthMask;
        this.renderer.state.depthMask = false;
        this._renderState.draw();
        this.renderer.state.depthMask = dm;
    }
}