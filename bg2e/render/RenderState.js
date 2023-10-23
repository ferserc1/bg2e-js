
import { RenderLayer } from "../base/PolyList";
import Mat4 from "../math/Mat4";

export default class RenderState {
    constructor({
        shader = null,
        polyListRenderer = null,
        materialRenderer = null,
        modelMatrix = Mat4.MakeIdentity(),
        viewMatrix = Mat4.MakeIdentity(),
        projectionMatrix = Mat4.MakeIdentity(),
        pipeline = null
    }) {
        this._shader = shader;
        this._polyListRenderer = polyListRenderer;
        this._materialRenderer = materialRenderer;
        this._modelMatrix = modelMatrix;
        this._viewMatrix = viewMatrix;
        this._projectionMatrix = projectionMatrix;
        this._pipeline = pipeline;
    }

    get valid() {
        return this._shader && this._plistRenderer && this._materialRenderer;
    }

    get renderer() { return this._polyListRenderer?.renderer; }

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
    get pipeline() { return this._pipeline; }
    set pipeline(pl) { this._pipeline = pl; }

    isLayerEnabled(layer) {
        const { polyList } = this._polyListRenderer;
        const { material } = this._materialRenderer;
        const renderLayers = polyList.renderLayers === RenderLayer.AUTO ?
            (material.isTransparent ? RenderLayer.TRANSPARENT_DEFAULT : RenderLayer.OPAQUE_DEFAULT) :
            (polyList.renderLayers);
        
        return renderLayers & layer;
    }

    draw({ overrideShader = null, overrideViewMatrix = null, overrideProjectionMatrix = null} = {}) {
        if (!this.polyListRenderer.polyList.visible) {
            return;
        }
        if (this.renderer.debugMode) {
            console.log(`======= Begin render polyList "${this.polyListRenderer.polyList.name}"    ==============`);
        }

        if (this.pipeline) {
            this.pipeline.activate();
        }
        this.polyListRenderer.bindBuffers();
        const shader = overrideShader || this.shader;
        const viewMatrix = overrideViewMatrix || this.viewMatrix;
        const projectionMatrix = overrideProjectionMatrix || this.projectionMatrix;
        shader.setup(
            this.polyListRenderer,
            this.materialRenderer,
            this.modelMatrix,
            viewMatrix,
            projectionMatrix
        );
        this.polyListRenderer.draw();
        if (this.renderer.debugMode) {
            console.log(`======= End render polyList "${this.polyListRenderer.polyList.name}"      ==============`);
        }
    }
}
