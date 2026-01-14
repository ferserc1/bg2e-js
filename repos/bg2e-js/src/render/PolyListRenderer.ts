import type Renderer from "./Renderer";
import type PolyList from "../base/PolyList";

export default class PolyListRenderer {
    protected _renderer: Renderer;
    protected _polyList: PolyList;

    constructor(renderer: Renderer, polyList: PolyList) {
        if ((polyList as any).renderer) {
            throw new Error("Invalid initialization of polyList renderer: the polyList is already controlled by another polyList renderer.")
        }
        this._renderer = renderer;
        this._polyList = polyList;
        (this._polyList as any)._renderer = this;
    }

    get polyList(): PolyList {
        return this._polyList;
    }

    get renderer(): Renderer {
        return this._renderer;
    }

    init(): void {

    }

    // Updates the internal state of the renderer. It is necessary to call this
    // function if the polyList has been modified, so that the internal objects
    // of the specific rendering API are updated.
    refresh(): void {

    }

    bindBuffers(): void {

    }

    draw(): void {

    }

    destroy(): void {
        
    }
}
