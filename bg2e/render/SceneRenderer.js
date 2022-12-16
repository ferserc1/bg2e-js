import { RenderLayer } from "../base/PolyList";
import { BlendFunction } from "./Pipeline";
import RenderQueue from "./RenderQueue";
import NodeVisitor from "../scene/NodeVisitor";
import Mat4 from "../math/Mat4";

export class FrameVisitor extends NodeVisitor {
    constructor(renderQueue) {
        super();
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

    get defaultViewMatrix() {
        return this._defaultViewMatrix || Mat4.MakeIdentity();
    }

    set defaultViewMatrix(mat) {
        this._defaultViewMatrix = mat;
    }

    get defaultProjectionMatrix() {
        return this._defaultProjectionMatrix || Mat4.MakePerspective(55,this.renderer.viewport.aspectRatio, 0.2, 100.0);
    }

    set defaultProjectionMatrix(mat) {
        this._defaultProjectionMatrix = mat;
    }
    
    frame(sceneRoot,delta) {
        this._renderQueue.newFrame();
        this._frameVisitor.delta = delta;
        this._frameVisitor.modelMatrix.identity();

        // TODO: extract view and proyection matrixes from cameras in scene using
        // a node component visitor to find the main camera. If there is no camera in
        // the scene, use the default values 
        this._renderQueue.viewMatrix = this.defaultViewMatrix;
        this._renderQueue.projectionMatrix = this.defaultProjectionMatrix;

        sceneRoot.accept(this._frameVisitor);
    }

    draw() {
        console.log(this._renderQueue);
    }

    destroy() {

    }
}