import Renderer from "../Renderer";

export default class WebGLRenderer extends Renderer {
    constructor() {
        super("webgl");
    }

    async init(canvas) {
        await super.init(canvas);

        // TODO: init webgl

    }

    postReshape() {

    }

    postRedisplay() {
        
    }
}