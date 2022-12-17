
import { RenderLayer } from "../base/PolyList";
import Mat4 from "../math/Mat4";
import { BlendFunction } from "./Pipeline";
import RenderState from "./RenderState";

const getLayers = (polyList,material) => {
    return polyList.renderLayers === RenderLayer.AUTO ?
        (material.isTransparent ? RenderLayer.TRANSPARENT_DEFAULT : RenderLayer.OPAQUE_DEFAULT) :
        (polyList.renderLayers);
}
export default class RenderQueue {
    constructor(renderer) {
        this._renderer = renderer;

        this._queues = [];

        this._viewMatrix = Mat4.MakeIdentity();
        this._projectionMatrix = Mat4.MakeIdentity();

        this._lights = [];
    }

    get renderer() {
        return this._renderer;
    }

    get queues() {
        return this._queues;
    }

    get viewMatrix() {
        return this._viewMatrix;
    }

    set viewMatrix(m) {
        this._viewMatrix.assign(m);
    }

    get projectionMatrix() {
        return this._projectionMatrix;
    }

    set projectionMatrix(m) {
        this._projectionMatrix.assign(m);
    }

    get lights() {
        return this._lights;
    }

    getQueue(layer) {
        return this._queues.find(l => l.layer === layer);
    }

    enableQueue(layer, shader, { beginOperation = null, endOperation = null, enabled = true, pipeline = null } = {}) {
        if (!pipeline) {
            pipeline = this.renderer.factory.pipeline();
            if (layer === RenderLayer.TRANSPARENT_DEFAULT) {
                pipeline.setBlendState({
                    enabled: true,
                    blendFuncSrc: BlendFunction.SRC_ALPHA,
                    blendFuncDst: BlendFunction.ONE_MINUS_SRC_ALPHA,
                    blendFuncSrcAlpha: BlendFunction.ONE,
                    blendFuncDstAlpha: BlendFunction.ONE_MINUS_SRC_ALPHA
                });
            }
            pipeline.create();
        }

        const queue = this.getQueue(layer);
        if (!queue) {
            this._queues.push({
                layer,
                shader,
                beginOperation,
                endOperation,
                enabled,
                pipeline,
                queue: []
            });
        }
        else {
            queue.enabled = true;
        }
    }

    disableQueue(layer) {
        const queue = this.getQueue(layer);
        if (queue) {
            queue.enabled = true;
        }
    }

    isQueueEnabled(layer) {
        return this.getQueue(layer)?.enabled || false;
    }

    newFrame() {
        this._queues.forEach(q => q.queue = []);
        this._lights = [];
    }

    addPolyList(polyListRenderer, materialRenderer, modelMatrix) {
        const plistLayers = getLayers(polyListRenderer.polyList, materialRenderer.material);
        this._queues.forEach(({ layer, shader, queue }) => {
            if (plistLayers & layer) {
                queue.push(new RenderState({
                    shader,
                    polyListRenderer,
                    materialRenderer,
                    modelMatrix,
                    viewMatrix: this.viewMatrix,
                    projectionMatrix: this.projectionMatrix
                }))
            }
        });
    }

    addLight(light, transform) {
        this._lights.push({ light, transform });
    }

    draw(layer) {
        const queue = this.getQueue(layer);
        if (queue) {
            if (typeof(queue.beginOperation) === "function") {
                queue.beginOperation(layer);
            }
            queue.pipeline.activate();
            queue.queue.forEach(rs => rs.draw());
            if (typeof(queue.endOperation) === "function") {
                queue.endOperation(layer);
            }
        }
        else {
            console.warn(`No render queue found for layer ${layer}`);
        }
    }
}