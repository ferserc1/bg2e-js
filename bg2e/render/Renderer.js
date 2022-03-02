

export default class Renderer {

    constructor(identifier) {
        this._identifier = identifier;
    }

    async init(canvas) {
        this._canvas = canvas;
    }

    get canvas() {
        return this._canvas;
    }

    postReshape(width,height) {

    }

    postRedisplay() {

    }
}
