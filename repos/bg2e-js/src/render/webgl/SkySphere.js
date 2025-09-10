import SkySphere from "../SkySphere";

export default class WebGLSkySphere extends SkySphere {
    draw() {
        if (!this._renderState) {
            throw new Error("SkySphere.draw(): the render state is not updated");
        }
        
        const dm = this.renderer.state.depthMask;
        this.renderer.state.depthMask = false;
        this._renderState.draw();
        this.renderer.state.depthMask = dm;
    }
}