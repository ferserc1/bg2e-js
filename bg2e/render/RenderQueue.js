
import { RenderLayer } from "../base/PolyList";
import Mat4 from "../math/Mat4";
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

    getQueue(layer) {
        return this._queues.find(l => l.layer === layer);
    }

    enableQueue(layer, shader, { beginOperation = null, enabled = true } = {}) {
        const queue = this.getQueue(layer);
        if (!queue) {
            this._queues.push({
                layer,
                shader,
                beginOperation,
                enabled,
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

    draw(layer) {
        const queue = this.getQueue(layer);
        if (queue) {
            queue.beginOperation(layer);
            queue.queue.forEach(rs => rs.draw());
        }
        else {
            console.warn(`No render queue found for layer ${layer}`);
        }
    }
}