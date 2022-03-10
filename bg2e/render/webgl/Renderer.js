import Renderer from "../Renderer";
import State from "./State";

export default class WebGLRenderer extends Renderer {
    constructor() {
        super("webgl");
    }

    async init(canvas) {
        await super.init(canvas);
        this._canvas = canvas;

        this._gl = canvas.domElement.getContext("webgl", { preserveDrawingBuffer: true });

        this._state = new State(this);
    }

    get gl() { return this._gl; }

    get canvas() { return this._canvas; }

    get state() {
        return this._state;
    }

    postReshape() {

    }

    postRedisplay() {
        
    }
}