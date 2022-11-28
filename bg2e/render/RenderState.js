
import Mat4 from "../math/Mat4";

export default class RenderState {
    constructor({
        shader = null,
        polyListRenderer = null,
        materialRenderer = null,
        modelMatrix = Mat4.MakeIdentity(),
        viewMatrix = Mat4.MakeIdentity(),
        projectionMatrix = Mat4.MakeIdentity()
    }) {
        this._shader = shader;
        this._polyListRenderer = polyListRenderer;
        this._materialRenderer = materialRenderer;
        this._modelMatrix = modelMatrix;
        this._viewMatrix = viewMatrix;
        this._projectionMatrix = projectionMatrix;
    }

    get valid() {
        return this._shader && this._plistRenderer && this._materialRenderer;
    }

    set shader(shader) { this._shader = shader; }
    get shader() { return this._shader; }
    set polyListRenderer(polyListRenderer) { this._polyListRenderer = polyListRenderer; }
    get polyListRenderer() { return this._polyListRenderer; }
    set materialRenderer(materialRenderer) { this._materialRenderer = materialRenderer; }
    get materialRenderer() { return this._materialRenderer; }
    set modelMatrix(model) { this._modelMatrix = model; }
    get modelMatrix() { return this._modelMatrix; }
    set viewMatrix(view) { this._viewMatrix = view; }
    get viewMatrix() { return this._viewMatrix; }
    set projectionMatrix(projection) { this._projectionMatrix = projection; }
    get projectionMatrix() { return this._projectionMatrix; }

    draw() {
        this.polyListRenderer.bindBuffers();
        this.materialRenderer.prepareRenderState(this.polyListRenderer);
        this.shader.setup(
            this.polyListRenderer,
            this.materialRenderer,
            this.modelMatrix,
            this.viewMatrix,
            this.projectionMatrix
        );
        this.polyListRenderer.draw();
    }
}
