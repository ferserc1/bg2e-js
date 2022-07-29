
export default class SkySphere {
    constructor(renderer) {

    }

    get renderer() { return this._renderer; }

    async load(equirectangularTextureUrl) {
        throw new Error("SkySphere.load(): Using generic implementation of SkySphere");
    }

    getRenderState({ viewMatrix, projectionMatrix }) {
        throw new Error("SkySphere.getRenderState(): Using generic implementation of SkySphere");   
    }
}