
import { RenderLayer } from "../base/PolyList";
import Mat4 from "../math/Mat4";
import type Shader from "./Shader";
import type PolyListRenderer from "./PolyListRenderer";
import type MaterialRenderer from "./MaterialRenderer";
import type Renderer from "./Renderer";
import type Pipeline from "./Pipeline";

export interface RenderStateOptions {
    shader?: Shader | null;
    polyListRenderer?: PolyListRenderer | null;
    materialRenderer?: MaterialRenderer | null;
    modelMatrix?: Mat4;
    viewMatrix?: Mat4;
    projectionMatrix?: Mat4;
    pipeline?: Pipeline | null;
}

export interface DrawOptions {
    overrideShader?: Shader | null;
    overrideViewMatrix?: Mat4 | null;
    overrideProjectionMatrix?: Mat4 | null;
}

export default class RenderState {
    protected _shader: Shader | null;
    protected _polyListRenderer: PolyListRenderer | null;
    protected _materialRenderer: MaterialRenderer | null;
    protected _modelMatrix: Mat4;
    protected _viewMatrix: Mat4;
    protected _projectionMatrix: Mat4;
    protected _pipeline: Pipeline | null;

    constructor({
        shader = null,
        polyListRenderer = null,
        materialRenderer = null,
        modelMatrix = Mat4.MakeIdentity(),
        viewMatrix = Mat4.MakeIdentity(),
        projectionMatrix = Mat4.MakeIdentity(),
        pipeline = null
    }: RenderStateOptions = {}) {
        this._shader = shader;
        this._polyListRenderer = polyListRenderer;
        this._materialRenderer = materialRenderer;
        this._modelMatrix = modelMatrix;
        this._viewMatrix = viewMatrix;
        this._projectionMatrix = projectionMatrix;
        this._pipeline = pipeline;
    }

    get valid(): boolean {
        return this._shader && this._polyListRenderer !== null && this._materialRenderer !== null || false;
    }

    get renderer(): Renderer | undefined { return this._polyListRenderer?.renderer; }

    set shader(shader: Shader | null) { this._shader = shader; }
    get shader(): Shader | null { return this._shader; }
    set polyListRenderer(polyListRenderer: PolyListRenderer | null) { this._polyListRenderer = polyListRenderer; }
    get polyListRenderer(): PolyListRenderer | null { return this._polyListRenderer; }
    set materialRenderer(materialRenderer: MaterialRenderer | null) { this._materialRenderer = materialRenderer; }
    get materialRenderer(): MaterialRenderer | null { return this._materialRenderer; }
    set modelMatrix(model: Mat4) { this._modelMatrix = model; }
    get modelMatrix(): Mat4 { return this._modelMatrix; }
    set viewMatrix(view: Mat4) { this._viewMatrix = view; }
    get viewMatrix(): Mat4 { return this._viewMatrix; }
    set projectionMatrix(projection: Mat4) { this._projectionMatrix = projection; }
    get projectionMatrix(): Mat4 { return this._projectionMatrix; }
    get pipeline(): Pipeline | null { return this._pipeline; }
    set pipeline(pl: Pipeline | null) { this._pipeline = pl; }

    isLayerEnabled(layer: RenderLayer): boolean {
        const { polyList } = this._polyListRenderer || {};
        const { material } = this._materialRenderer || {};
        if (!polyList || !material) {
            return false;
        }

        const renderLayers = polyList.renderLayers === RenderLayer.AUTO ?
            (material.isTransparent ? RenderLayer.TRANSPARENT_DEFAULT : RenderLayer.OPAQUE_DEFAULT) :
            (polyList.renderLayers);
        
        return (renderLayers & layer) !== 0;
    }

    draw({ overrideShader = null, overrideViewMatrix = null, overrideProjectionMatrix = null}: DrawOptions = {}): void {
        const shader = overrideShader || this.shader;
        if (!this.polyListRenderer?.polyList.visible || !shader || !this.materialRenderer) {
            return;
        }
        if ((this.renderer as any)?.debugMode) {
            console.log(`======= Begin render polyList "${this.polyListRenderer.polyList.name}"    ==============`);
        }

        if (this.pipeline) {
            this.pipeline.activate();
        }
        this.polyListRenderer.bindBuffers();
        
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
        if ((this.renderer as any)?.debugMode) {
            console.log(`======= End render polyList "${this.polyListRenderer.polyList.name}"      ==============`);
        }
    }
}
