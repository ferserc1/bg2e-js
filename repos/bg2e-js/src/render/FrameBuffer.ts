import type Renderer from "./Renderer";

export interface ClearOptions {
    color?: boolean;
    depth?: boolean;
    stencil?: boolean;
}

export default class FrameBuffer {
    protected _renderer: Renderer;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
    }

    get renderer(): Renderer {
        return this._renderer;
    }

    clearColor(): void {
        this.clear({ color: true, depth: false, stencil: false });
    }

    clearDepth(): void {
        this.clear({ color: true, depth: true, stencil: false });
    }

    clearStencil(): void {
        this.clear({color: false, depth: false, stencil: true });
    }

    clear({ color = true, depth = true, stencil = false }: ClearOptions = {}): void {
        throw new Error("FrameBuffer: calling base implementation of clear()");
    }
}
