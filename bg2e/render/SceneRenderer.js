import { RenderLayer } from "../base/PolyList";
import { BlendFunction } from "./Pipeline";
import RenderQueue from "./RenderQueue";
import NodeVisitor from "../scene/NodeVisitor";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import Camera from "../scene/Camera";
import FindNodeVisitor from "../scene/FindNodeVisitor";
import Transform from "../scene/Transform";
import { bindRenderer, init } from "../scene/Node";
import LightComponent from "../scene/LightComponent";

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
        bindRenderer(node, this._renderer);
    }
}

export class InitVisitor extends NodeVisitor {
    constructor() {
        super();
    }

    async asyncVisit(node) {
        await init(node);
    }
}

export class EventCallbackVisitor extends NodeVisitor {
    constructor(callbackName)  {
        super();
        this._callbackName = callbackName;
        this._event = null;
    }

    set event(evt) {
        this._event = evt;
    }

    get event() {
        return this._event;
    }

    visit(node) {
        node[this._callbackName](this._event);
    }
}

export default class SceneRenderer {
    constructor(renderer) {
        this._renderer = renderer;
        this._keyDownVisitor = new EventCallbackVisitor('keyDown');
        this._keyUpVisitor = new EventCallbackVisitor('keyUp');
        this._mouseUpVisitor = new EventCallbackVisitor('mouseUp');
        this._mouseDownVisitor = new EventCallbackVisitor('mouseDown');
        this._mouseMoveVisitor = new EventCallbackVisitor('mouseMove');
        this._mouseOutVisitor = new EventCallbackVisitor('mouseOut');
        this._mouseDragVisitor = new EventCallbackVisitor('mouseDrag');
        this._mouseWheelVisitor = new EventCallbackVisitor('mouseWheel');
        this._touchStartVisitor = new EventCallbackVisitor('touchStart');
        this._touchMoveVisitor = new EventCallbackVisitor('touchMove');
        this._touchEndVisitor = new EventCallbackVisitor('touchEnd');

        // This will be the EnvironmentComponent component, if one is defined in the scene.
        this._sceneEnvironment = null;
    }

    get renderer() {
        return this._renderer;
    }

    get renderQueue() {
        return this._renderQueue;
    }

    async init({ shadowMapSize = new Vec(1024, 1024) } = {}) {
        if (typeof(shadowMapSize) === "number") {
            shadowMapSize = new Vec(shadowMapSize, shadowMapSize);
        }

        // TODO: Create function to resize shadow map
        this._shadowMapSize = shadowMapSize;

        this._mainDirectionalLight = null;

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
        this._initVisitor = new InitVisitor();
        this._frameVisitor = new FrameVisitor(this._renderQueue);

        this._skyCube = this.renderer.factory.skyCube();

        this._shadowRenderer = this.renderer.factory.shadowRenderer();
        await this._shadowRenderer.create(this._shadowMapSize);
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
    
    async bindRenderer(sceneRoot) {
        const bindRendererVisitor = new BindRendererVisitor(this.renderer);
        sceneRoot.accept(bindRendererVisitor);

        await sceneRoot.asyncAccept(this._initVisitor);        

        const findVisitor = new FindNodeVisitor();
        findVisitor.hasComponents("Environment");
        sceneRoot.accept(findVisitor);
        if (findVisitor.result.length) {
            const comp = findVisitor.result[0].component("Environment");
            this.setEnvironment(comp.environment);
            this._sceneEnvironment = comp;
        }
    }

    resize(sceneRoot, width,height) {
        this.renderer.viewport = new Vec([0, 0, width, height]);
        this.renderer.canvas.updateViewportSize();
        const mainCamera = Camera.GetMain(sceneRoot);
        if (mainCamera) {
            mainCamera.resize(width,height);
        }
    }

    async frame(sceneRoot,delta) {
        if (sceneRoot.sceneChanged) {
            await sceneRoot.asyncAccept(this._initVisitor);
        }
        this._sceneRoot = sceneRoot;

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
        const mainLight = LightComponent.GetMainDirectionalLight(this._sceneRoot);
        const camera = Camera.GetMain(this._sceneRoot);
        this._shadowRenderer.update(camera, mainLight, this._renderQueue);
        
        if (clearBuffers) {
            this.renderer.frameBuffer.clear();
        }

        if (this.environment && !this.environment.updated) {
            this.environment.updateMaps();
        }

        if (drawSky && (!this._sceneEnvironment || this._sceneEnvironment.showSkybox)) {
            this._skyCube.draw();
        }

        this._renderQueue.draw(RenderLayer.OPAQUE_DEFAULT);
        this._renderQueue.draw(RenderLayer.TRANSPARENT_DEFAULT);
    }

    destroy() {

    }

    keyDown(sceneRoot, evt) {
        this._keyDownVisitor.event = evt;
        sceneRoot.accept(this._keyDownVisitor);
    }

    keyUp(sceneRoot, evt) {
        this._keyUpVisitor.event = evt;
        sceneRoot.accept(this._keyUpVisitor);
    }

    mouseUp(sceneRoot, evt) {
        this._mouseUpVisitor.event = evt;
        sceneRoot.accept(this._mouseUpVisitor);
    }

    mouseDown(sceneRoot, evt) {
        this._mouseDownVisitor.event = evt;
        sceneRoot.accept(this._mouseDownVisitor);
    }

    mouseMove(sceneRoot, evt) {
        this._mouseMoveVisitor.event = evt;
        sceneRoot.accept(this._mouseMoveVisitor);
    }

    mouseOut(sceneRoot, evt) {
        this._mouseOutVisitor.event = evt;
        sceneRoot.accept(this._mouseOutVisitor);
    }

    mouseDrag(sceneRoot, evt) {
        this._mouseDragVisitor.event = evt;
        sceneRoot.accept(this._mouseDragVisitor);
    }

    mouseWheel(sceneRoot, evt) {
        this._mouseWheelVisitor.event = evt;
        sceneRoot.accept(this._mouseWheelVisitor);
    }

    touchStart(sceneRoot, evt) {
        this._touchStartVisitor.event = evt;
        sceneRoot.accept(this._touchStartVisitor);
    }

    touchMove(sceneRoot, evt) {
        this._touchMoveVisitor.event = evt;
        sceneRoot.accept(this._touchMoveVisitor);
    }

    touchEnd(sceneRoot, evt) {
        this._touchEndVisitor.event = evt;
        sceneRoot.accept(this._touchEndVisitor);
    }

}