import { RenderLayer } from "../base/PolyList";
import { BlendFunction } from "./Pipeline";
import RenderQueue from "./RenderQueue";
import NodeVisitor from "../scene/NodeVisitor";
import Mat4 from "../math/Mat4";

export class FrameVisitor extends NodeVisitor {
    constructor(renderQueue) {
        this._renderQueue = renderQueue;
        this._delta = 0;
        this._modelMatrix = Mat4.MakeIdentity();
        this._matrixStack = [];
    }

    get delta() { return this._delta; }
    set delta(d) { this._delta = d; }

    get modelMatrix() { return this._modelMatrix; }
    
    visit(node) {
        this._matrixStack.push(new Mat4(this._modelMatrix));
        node.frame(this._delta, this._modelMatrix, this._renderQueue);
    }

    didVisit(node) {
        this._matrixStack.pop();
        this._modelMatrix = this._matrixStack[this._matrixStack.length - 1] || this._modelMatrix;
    }
}

export default class SceneRenderer {
    constructor(renderer) {
        this._renderer = renderer;
    }

    get renderer() {
        return this._renderer;
    }

    get renderQueue() {
        return this._renderQueue;
    }

    async init() {
        this._opaquePipeline = this.renderer.factory.pipeline();
        this._opaquePipeline.setBlendState({ enabled: false });
        this._opaquePipeline.create();

        this._transparentPipeline = this.renderer.factory.pipeline();
        this._transparentPipeline.setBlendState({
            enabled: true,
            blendFuncSrc: BlendFunction.SRC_ALPHA,
            blendFuncDst: BlendFunction.ONE_MINUS_SRC_ALPHA,
            blendFuncSrcAlpha: BlendFunction.ONE,
            blendFuncDstAlpha: BlendFunction.ONE_MINUS_SRC_ALPHA
        });
        this._transparentPipeline.create();

        this._renderQueue = new RenderQueue(this.renderer);
        this._frameVisitor = new FrameVisitor(this._renderQueue);
    }

    set environment(env) {
        this._environment = env;
    }

    get environment() {
        return this._environment;
    }
    
    frame(sceneRoot,delta) {
        this._frameVisitor.delta = delta;
        this._frameVisitor.modelMatrix.identity();
        sceneRoot.apply(this._frameVisitor);
    }

    draw() {

    }

    destroy() {

    }
}