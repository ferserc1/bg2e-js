
export default class PolyListRenderer {
    constructor(renderer,polyList) {
        if (polyList.renderer) {
            throw new Error("Invalid initialization of polyList renderer: the polyList is already controlled by another polyList renderer.")
        }
        this._renderer = renderer;
        this._polyList = polyList;
        this._polyList._renderer = this;
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

    bindBuffers() {

    }

    draw() {

    }

    destroy() {
        
    }
}
