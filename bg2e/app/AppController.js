
export default class AppController {
    constructor() {
        this._mainLoop = null;
    }

    get mainLoop() { return this._mainLoop; }
    set mainLoop(ml) { this._mainLoop = ml; }

    get canvas() { return this._mainLoop?.canvas; }

    get renderer() { return this._mainLoop?.canvas?.renderer; }

    get viewport() { return this.canvas?.viewport || { width: 0, height: 0, aspectRatio: 0 }; }

    init() {}
    reshape(width,height) {}
    frame(delta) {}
    display() {}
    keyDown(evt) {}
    keyUp(evt) {}
    mouseUp(evt) {}
    mouseDown(evt) {}
    mouseMove(evt) {}
    mouseOut(evt) {}
    mouseDrag(evt) {}
    mouseWheel(evt) {}
    touchStart(evt) {}
    touchMove(evt) {}
    touchEnd(evt) {}
}
