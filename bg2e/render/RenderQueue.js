
import { RenderLayer } from "../base/PolyList";

export default class RenderQueue {
    constructor(renderer) {
        this._renderer = renderer;

        this._queues = {};

        this._enabledLayers = [
            RenderLayer.OPAQUE_DEFAULT,
            RenderLayer.TRANSPARENT_DEFAULT
        ];

        this._layerOperations = {};

        this.newFrame();
    }

    get renderer() {
        return this._renderer;
    }

    get queues() {
        return this._queues;
    }

    get enabledLayers() {
        return this._enabledLayers;
    }

    // operation = (layer) => {}
    // This function will be called before render the queue
    // for the layer 'layer'
    setEnableLayerOperation(layer, operation) {
        if (this._enabledLayers.indexOf(layer) === -1) {
            this._layerOperations[layer] = operation;
        }
    }

    enableLayer(layer) {
        if (this._enabledLayers.indexOf(layer) === -1) {
            this._enabledLayers.push(layer);
        }
    }

    disableLayer(layer) {
        const i = this._enabledLayers.indexOf(layer);
        if (i !== -1) {
            this._enabledLayers.splice(i, 1);
        }
    }

    isLayerEnabled(layer) {
        return this._enabledLayers.indexOf(layer) !== -1;
    }

    newFrame() {
        this._queues = {};
        for (const layer of this._enabledLayers) {
            this._queues[layer] = [];
        }
    }

    addRenderState(rs) {
        for (const layer in this._queues) {
            const queue = this._queues[layer];
            if (this._layerOperations[layer]) {
                this._layerOperations[layer](layer);
            }
            if (rs.isLayerEnabled(Number(layer))) {
                queue.push(rs);
            }
        }
    }

    draw(layer) {
        const queue = this._queues[layer];
        if (queue) {
            queue.forEach(rs => rs.draw());
        }
        else {
            console.warn(`No render queue found for layer ${layer}`);
        }
    }
}