import Material from "../base/Material";
import { createCube } from "../primitives";
import RenderState from "./RenderState";
import SkyCubeShader from "../shaders/SkyCubeShader";
import Mat4 from "../math/Mat4";

export default class SkyCube {
    constructor(renderer) {
        this._renderer = renderer;
    }

    get renderer() { return this._renderer; }

    async load(cubemapTexture, Shader = null) {
        this._texture = cubemapTexture;

        this._material = new Material();
        this._material.diffuse = this._texture;

        this._shader = Shader ? new Shader(this.renderer) : new SkyCubeShader(this.renderer);
        await this._shader.load();
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
        throw new Error("SkyCube.draw(): Calling base implementation of SkyCube");
    }

    get polyListRenderer() {
        if (!this._plistRenderer) {
            this._plistRenderer = this.renderer.factory.polyList(createCube(1,1,1));
        }
        return this._plistRenderer;
    }

    destroy() {
        this._shader.destroy();
        this._texture.destroy();
        this._plistRenderer.destroy();
        this._material.destroy();
        this._shader = null;
        this._texture = null;
        this._material = null;
        this._plistRenderer = null;
        this._renderState = null;
    }
}