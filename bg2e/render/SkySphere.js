import { createSphere } from "../primitives";
export default class SkySphere {
    constructor(renderer) {
        this._renderer = renderer;
    }

    get renderer() { return this._renderer; }

    async load(equirectangularTextureUrl) {
        this._texture = new Texture();
        this._texture.fileName = equirectangularTextureUrl;
        await this._texture.loadImageData();

        console.log(`TODO: Load sky sphere texture texture '${this.texture}'`);
    }

    getRenderState({ viewMatrix, projectionMatrix }) {
        throw new Error("SkySphere.getRenderState(): Not implemented");
    }

    get polyListRenderer() {
        if (!this._plistRenderer) {
            this._plistRenderer = this.renderer.factory.polyList(createSphere(10));
        }
        return this._polyListRenderer;
    }

    get shader() {
        if (!this._skySphereShader) {
            
        }
        return this._skySphereShader;
    }
}