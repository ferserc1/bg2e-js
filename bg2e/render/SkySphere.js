import { createSphere } from "../primitives";
import SkySphereShader from "../shaders/SkySphereShder";
export default class SkySphere {
    constructor(renderer) {
        this._renderer = renderer;
    }

    get renderer() { return this._renderer; }

    async load(equirectangularTextureUrl) {
        this._texture = new Texture();
        this._texture.fileName = equirectangularTextureUrl;
        await this._texture.loadImageData();

        this._shader = new SkySphereShader(this.renderer);
        await this._shader.load();
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
}