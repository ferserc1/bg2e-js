
import { getLayers, RenderLayer } from "../base/PolyList";
import Mat4 from "../math/Mat4";
import { BlendFunction } from "./Pipeline";
import RenderState from "./RenderState";

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

    enableQueue(layer, shader, { beginOperation = null, endOperation = null, enabled = true } = {}) {
        // TODO: Create pipelines for different render states (cull face, front face etc.)
        const cullBackFace = this.renderer.factory.pipeline();
        const cullFaceDisabled = this.renderer.factory.pipeline();
        if (layer === RenderLayer.TRANSPARENT_DEFAULT) {
            const blendState = {
                enabled: true,
                blendFuncSrc: BlendFunction.SRC_ALPHA,
                blendFuncDst: BlendFunction.ONE_MINUS_SRC_ALPHA,
                blendFuncSrcAlpha: BlendFunction.ONE,
                blendFuncDstAlpha: BlendFunction.ONE_MINUS_SRC_ALPHA
            };
            cullBackFace.setBlendState(blendState);
            cullFaceDisabled.setBlendState(blendState);
        }
        cullBackFace.create();
        cullFaceDisabled.cullFace = false;
        cullFaceDisabled.create();

    
        

        const queue = this.getQueue(layer);
        if (!queue) {
            this._queues.push({
                layer,
                shader,
                beginOperation,
                endOperation,
                enabled,
                pipelines: {
                    cullBackFace,
                    cullFaceDisabled
                },
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
        this._queues.forEach(({ layer, shader, queue, pipelines }) => {
            if (plistLayers & layer) {
                const { polyList } = polyListRenderer;
                let pipeline = null;
                // TODO: Select pipeline based on material and polyList properties
                if (polyList.enableCullFace) {
                    pipeline = pipelines.cullBackFace;
                }
                else {
                    pipeline = pipelines.cullFaceDisabled;
                }
                queue.push(new RenderState({
                    shader,
                    polyListRenderer,
                    materialRenderer,
                    modelMatrix,
                    viewMatrix: this.viewMatrix,
                    projectionMatrix: this.projectionMatrix,
                    pipeline
                }))
            }
        });
    }

    addLight(light, transform) {
        // Clear the depth texture, because this parameter
        // is set each frame by the ShadowRenderer
        light.depthTexture = null;
        this._lights.push({ light, transform });
    }

    draw(layer) {
        const queue = this.getQueue(layer);
        if (queue) {
            if (typeof(queue.beginOperation) === "function") {
                queue.beginOperation(layer);
            }
            
            //queue.pipeline.activate();
            queue.queue.forEach(rs => {
                rs.draw();
            });
            if (typeof(queue.endOperation) === "function") {
                queue.endOperation(layer);
            }
        }
        else {
            console.warn(`No render queue found for layer ${layer}`);
        }
    }
}