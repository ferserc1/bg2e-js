
import { getLayers, RenderLayer } from "../base/PolyList";
import Mat4 from "../math/Mat4";
import { BlendFunction } from "./Pipeline";
import RenderState from "./RenderState";
import type Renderer from "./Renderer";
import type Shader from "./Shader";
import type PolyListRenderer from "./PolyListRenderer";
import type MaterialRenderer from "./MaterialRenderer";
import type Pipeline from "./Pipeline";
import type Light from "../base/Light";
import type Mat3 from "../math/Mat3";

export interface QueuePipelines {
    cullBackFace: Pipeline;
    cullFaceDisabled: Pipeline;
}

export interface QueueItem {
    layer: RenderLayer;
    shader: Shader;
    beginOperation: ((layer: RenderLayer) => void) | null;
    endOperation: ((layer: RenderLayer) => void) | null;
    enabled: boolean;
    pipelines: QueuePipelines;
    queue: RenderState[];
}

export interface LightData {
    light: Light;
    transform: Mat4;
}

export interface EnableQueueOptions {
    beginOperation?: ((layer: RenderLayer) => void) | null;
    endOperation?: ((layer: RenderLayer) => void) | null;
    enabled?: boolean;
}

export default class RenderQueue {
    protected _renderer: Renderer;
    protected _queues: QueueItem[];
    protected _viewMatrix: Mat4;
    protected _projectionMatrix: Mat4;
    protected _lights: LightData[];

    constructor(renderer: Renderer) {
        this._renderer = renderer;

        this._queues = [];

        this._viewMatrix = Mat4.MakeIdentity();
        this._projectionMatrix = Mat4.MakeIdentity();

        this._lights = [];
    }

    get renderer(): Renderer {
        return this._renderer;
    }

    get queues(): QueueItem[] {
        return this._queues;
    }

    get viewMatrix(): Mat4 {
        return this._viewMatrix;
    }

    set viewMatrix(m: Mat4) {
        this._viewMatrix.assign(m);
    }

    get projectionMatrix(): Mat4 {
        return this._projectionMatrix;
    }

    set projectionMatrix(m: Mat4) {
        this._projectionMatrix.assign(m);
    }

    get lights(): LightData[] {
        return this._lights;
    }

    getQueue(layer: RenderLayer): QueueItem | undefined {
        return this._queues.find(l => l.layer === layer);
    }

    enableQueue(layer: RenderLayer, shader: Shader, { beginOperation = null, endOperation = null, enabled = true }: EnableQueueOptions = {}): void {
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

    disableQueue(layer: RenderLayer): void {
        const queue = this.getQueue(layer);
        if (queue) {
            queue.enabled = true;
        }
    }

    isQueueEnabled(layer: RenderLayer): boolean {
        return this.getQueue(layer)?.enabled || false;
    }

    newFrame(): void {
        this._queues.forEach(q => q.queue = []);
        this._lights = [];
    }

    addPolyList(polyListRenderer: PolyListRenderer, materialRenderer: MaterialRenderer, modelMatrix: Mat4): void {
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

    addLight(light: Light, transform: Mat4): void {
        // Clear the depth texture, because this parameter
        // is set each frame by the ShadowRenderer
        light.depthTexture = null;
        this._lights.push({ light, transform });
    }

    draw(layer: RenderLayer): void {
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