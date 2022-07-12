import Renderer from "../Renderer";
import State from "./State";
import PolyListRenderer from "./PolyListRenderer";
import MaterialRenderer from "./MaterialRenderer";

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

    postReshape(width, height) {

    }

    postRedisplay() {
        
    }

    polyListFactory(plist) {
        return super.polyListFactory(new PolyListRenderer(this, plist));
    }

    materialFactory(material) {
        return super.materialFactory(new MaterialRenderer(this, material));
    }
}
