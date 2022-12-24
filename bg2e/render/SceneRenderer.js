import { RenderLayer } from "../base/PolyList";
import { BlendFunction } from "./Pipeline";
import RenderQueue from "./RenderQueue";
import NodeVisitor from "../scene/NodeVisitor";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import Camera from "../scene/Camera";
import Transform from "../scene/Transform";

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
        this._modelMatrix = this._matrixStack[this._matrixStack.length - 1] || Mat4.MakeIdentity();
        this._matrixStack.pop();
    }
}

export class BindRendererVisitor extends NodeVisitor {
    constructor(renderer) {
        super(renderer);
        this._renderer = renderer;
    }

    visit(node) {
        node.components.forEach(comp => {
            comp.bindRenderer(this._renderer);
        });
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

        this._skyCube = this.renderer.factory.skyCube();
    }

    async setEnvironment(env) {
        this._environment = env;
        this._skyCube.load(this._environment.environmentMap);
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
    
    bindRenderer(sceneRoot) {
        const bindRendererVisitor = new BindRendererVisitor(this.renderer);
        sceneRoot.accept(bindRendererVisitor);
    }

    resize(sceneRoot, width,height) {
        this.renderer.viewport = new Vec([0, 0, width, height]);
        this.renderer.canvas.updateViewportSize();
        const mainCamera = Camera.GetMain(sceneRoot);
        if (mainCamera) {
            mainCamera.resize(width,height);
        }
    }

    frame(sceneRoot,delta) {
        this._renderQueue.newFrame();
        this._frameVisitor.delta = delta;
        this._frameVisitor.modelMatrix.identity();

        const mainCamera = Camera.GetMain(sceneRoot);

        let viewMatrix = this.defaultViewMatrix;
        let projectionMatrix = this.defaultProjectionMatrix;
        if (mainCamera) {
            projectionMatrix = mainCamera.projectionMatrix;
            viewMatrix = Mat4.GetInverted(Transform.GetWorldMatrix(mainCamera.node));
        }

        this._renderQueue.viewMatrix = viewMatrix;
        this._renderQueue.projectionMatrix = projectionMatrix;

        sceneRoot.accept(this._frameVisitor);

        this._skyCube.updateRenderState({
            viewMatrix: viewMatrix,
            projectionMatrix: projectionMatrix
        });
    }

    draw({ clearBuffers = true, drawSky = true } = {}) {
        if (clearBuffers) {
            this.renderer.frameBuffer.clear();
        }

        if (this.environment && !this.environment.updated) {
            this.environment.updateMaps();
        }

        if (drawSky) {
            this._skyCube.draw();
        }

        this._renderQueue.draw(RenderLayer.OPAQUE_DEFAULT);
        this._renderQueue.draw(RenderLayer.TRANSPARENT_DEFAULT);
    }

    destroy() {

    }
}