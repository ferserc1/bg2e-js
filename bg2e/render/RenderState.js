
import Mat4 from "../math/Mat4";

export default class RenderState {
    constructor({
        shader = null,
        polyListRenderer = null,
        material = null,
        modelMatrix = Mat4.MakeIdentity(),
        viewMatrix = Mat4.MakeIdentity(),
        projectionMatrix = Mat4.MakeIdentity()
    }) {
        this._shader = shader;
        this._polyListRenderer = polyListRenderer;
        this._material = material;
        this._modelMatrix = modelMatrix;
        this._viewMatrix = viewMatrix;
        this._projectionMatrix = projectionMatrix;
    }

    get valid() {
        return this._shader && this._plistRenderer && this._material;
    }

    set shader(shader) { this._shader = shader; }
    get shader() { return this._shader; }
    set polyListRenderer(polyListRenderer) { this._polyListRenderer = polyListRenderer; }
    get polyListRenderer() { return this._polyListRenderer; }
    set material(material) { this._material = material; }
    get material() { return this._material; }
    set modelMatrix(model) { this._modelMatrix = model; }
    get modelMatrix() { return this._modelMatrix; }
    set viewMatrix(view) { this._viewMatrix = view; }
    get viewMatrix() { return this._viewMatrix; }
    set projectionMatrix(projection) { this._projectionMatrix = projection; }
    get projectionMatrix() { return this._projectionMatrix; }

    draw() {
        this.shader.setup(
            this.polyListRenderer,
            this.material,
            this.modelMatrix,
            this.viewMatrix,
            this.projectionMatrix
        );
        this.polyListRenderer.draw();
    }
}
