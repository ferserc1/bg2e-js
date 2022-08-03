import { createSphere } from "../primitives";
import SkySphereShader from "../shaders/SkySphereShder";
import RenderState from "./RenderState";
import Material from "../base/Material";
import Texture from "../base/Texture";

export default class SkySphere {
    constructor(renderer) {
        this._renderer = renderer;
    }

    get renderer() { return this._renderer; }

    async load(equirectangularTextureUrl) {
        this._texture = new Texture();
        this._texture.fileName = equirectangularTextureUrl;
        await this._texture.loadImageData();

        this._material = new Material();
        this._material.diffuse = this._texture;

        this._shader = new SkySphereShader(this.renderer);
        await this._shader.load();
    }

    getRenderState({ viewMatrix, projectionMatrix }) {
        if (!this._renderState) {
            this._renderState = new RenderState({
                shader: this._shader,
                polyListRenderer: this.polyListRenderer,
                materialRenderer: this.renderer.factory.material(this._material),
                viewMatrix,
                projectionMatrix
            });
        }
        else {
            this._renderState.viewMatrix = viewMatrix;
            this._renderState.projectionMatrix = projectionMatrix;
        }
        return this._renderState;
    }

    get polyListRenderer() {
        if (!this._plistRenderer) {
            this._plistRenderer = this.renderer.factory.polyList(createSphere(1));
        }
        return this._plistRenderer;
    }

    destroy() {
        this._shader.destroy();
        this._texture.destroy();
        this._plistRenderer.destroy();
        this._shader = null;
        this._texture = null;
        this._material.destroy();
        this._material = null;
        this._plistRenderer = null;
        this._renderState = null;
    }
}