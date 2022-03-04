import Renderer from "../Renderer";

export default class WebGLRenderer extends Renderer {
    constructor() {
        super("webgl");
    }

    async init(canvas) {
        await super.init(canvas);
        this._canvas = canvas;

        this._gl = canvas.domElement.getContext("webgl", { preserveDrawingBuffer: true });
    }

    get gl() { return this._gl; }

    get canvas() { return this._canvas; }

    postReshape() {

    }

    postRedisplay() {
        
    }
}