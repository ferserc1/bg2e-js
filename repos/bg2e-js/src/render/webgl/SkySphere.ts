import SkySphere from "../SkySphere";
import WebGLRenderer from "./Renderer";

export default class WebGLSkySphere extends SkySphere {
    draw() {
        const renderer = this.renderer as WebGLRenderer;
        if (!this._renderState) {
            throw new Error("SkySphere.draw(): the render state is not updated");
        }
        
        const dm = renderer.state.depthMask;
        renderer.state.depthMask = false;
        this._renderState.draw();
        renderer.state.depthMask = dm;
    }
}