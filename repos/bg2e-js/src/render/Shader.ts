import type Renderer from "./Renderer";
import type PolyListRenderer from "./PolyListRenderer";
import type MaterialRenderer from "./MaterialRenderer";
import type Mat4 from "../math/Mat4";

export default class Shader {
    protected _renderer: Renderer;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
    }

    get renderer(): Renderer { return this._renderer; }

    async load(): Promise<void> {

    }
    
    setup(plistRenderer: PolyListRenderer, materialRenderer: MaterialRenderer, modelMatrix: Mat4, viewMatrix: Mat4, projectionMatrix: Mat4): void {
        throw new Error("Error: using an abstract implementation of render.Shader.");
    }

    destroy(): void {
        throw new Error("Error: using an abstract implementation of render.Shader.destroy()");
    }
}
