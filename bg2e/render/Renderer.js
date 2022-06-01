

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

    // The child function will call this function passing the specific
    // polyListRenderer instance, so plist here will be a PolyListRenderer
    // instance, instead of a PolyList
    polyListFactory(plist) {
        plist.init();
        plist.refresh();
        return plist;
    }

    get factory() {
        const renderer = this;
        return {
            polyList(plist) {
                return renderer.polyListFactory(plist);
            }
        }
    }
}
