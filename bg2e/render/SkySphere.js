import { createSphere } from "../primitives";
import SkySphereShader from "../shaders/SkySphereShader";
import RenderState from "./RenderState";
import Material from "../base/Material";
import Texture from "../base/Texture";
import Mat4 from "../math/Mat4";
import { PolyListCullFace, PolyListFrontFace } from "../base/PolyList";

export default class SkySphere {
    constructor(renderer) {
        this._renderer = renderer;
    }

    get renderer() { return this._renderer; }

    async load(equirectangularTextureUrl, Shader = null) {
        this._texture = new Texture();
        this._texture.fileName = equirectangularTextureUrl;
        await this._texture.loadImageData();

        this._material = new Material();
        this._material.diffuse = this._texture;

        this._shader = Shader ? new Shader(this.renderer) : new SkySphereShader(this.renderer);
        await this._shader.load();
    }

    async setTexture(equirectangularTextureUrl) {
        if (this._texture) {
            this._texture.destroy();
        }
        this._texture.fileName = equirectangularTextureUrl;
        await this._texture.loadImageData();

        this._material.diffuse = this._texture;
    }

    updateRenderState({ viewMatrix, projectionMatrix = null }) {
        const rotationMatrix = Mat4.GetRotation(viewMatrix);
        if (!this._renderState) {
            this._renderState = new RenderState({
                shader: this._shader,
                polyListRenderer: this.polyListRenderer,
                materialRenderer: this.renderer.factory.material(this._material),
                viewMatrix: rotationMatrix,
                projectionMatrix
            });
        }
        else {
            this._renderState.viewMatrix = rotationMatrix;
            if (projectionMatrix) {
                this._renderState.projectionMatrix = projectionMatrix;
            }
        }
        return this._renderState;
    }

    draw() {
        throw new Error("SkySphere.draw(): Calling base implementation of SkySphere");
    }

    get polyListRenderer() {
        if (!this._plistRenderer) {
            const sphere = createSphere(3.5);
            sphere.cullFace = PolyListCullFace.FRONT;  // Draw back face
            this._plistRenderer = this.renderer.factory.polyList(sphere);
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