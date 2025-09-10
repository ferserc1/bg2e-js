import Material from "../base/Material";

export default class Shader {
    constructor(renderer) {
        this._renderer = renderer;
    }

    get renderer() { return this._renderer; }

    async load() {

    }
    
    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        throw new Error("Error: using an abstract implementation of render.Shader.");
    }

    destroy() {
        throw new Error("Error: using an abstract implementation of render.Shader.destroy()");
    }
}
