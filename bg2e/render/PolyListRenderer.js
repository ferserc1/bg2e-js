
export default class PolyListRenderer {
    constructor(renderer,polyList) {
        this._renderer = renderer;
        this._polyList = polyList;
    }

    get polyList() {
        return this._polyList;
    }

    get renderer() {
        return this._renderer;
    }

    init() {

    }

    // Updates the internal state of the renderer. It is necessary to call this
    // function if the polyList has been modified, so that the internal objects
    // of the specific rendering API are updated.
    refresh() {

    }

    draw() {

    }
}
