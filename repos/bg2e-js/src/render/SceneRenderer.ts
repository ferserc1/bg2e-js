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
import Renderer from "./Renderer";
import Node from "../scene/Node";
import type Pipeline from "./Pipeline";
import type SkyCube from "./SkyCube";
import type ShadowRenderer from "./ShadowRenderer";
import type EnvironmentRenderer from "../render/Environment";
import type EnvironmentComponent from "../scene/EnvironmentComponent";
import KeyboardEvent from "../app/Bg2KeyboardEvent"
import MouseEvent from "../app/Bg2MouseEvent"
import TouchEvent from "../app/Bg2TouchEvent";

export class FrameVisitor extends NodeVisitor {
    _renderQueue: RenderQueue;
    _delta: number;
    _modelMatrix: Mat4;
    _matrixStack: Mat4[];

    constructor(renderQueue: RenderQueue) {
        super();
        this._renderQueue = renderQueue;
        this._delta = 0;
        this._modelMatrix = Mat4.MakeIdentity();
        this._matrixStack = [];
    }

    get delta(): number { return this._delta; }
    set delta(d: number) { this._delta = d; }

    get modelMatrix(): Mat4 { return this._modelMatrix; }
    
    visit(node: Node): void {
        this._matrixStack.push(new Mat4(this._modelMatrix));
        node.frame(this._delta, this._modelMatrix, this._renderQueue);
    }

    didVisit(node: Node): void {
        this._modelMatrix = this._matrixStack[this._matrixStack.length - 1] || Mat4.MakeIdentity();
        this._matrixStack.pop();
    }
}

export class BindRendererVisitor extends NodeVisitor {
    _renderer: Renderer;

    constructor(renderer: Renderer) {
        super();
        this._renderer = renderer;
    }

    visit(node: Node): void {
        bindRenderer(node, this._renderer);
    }
}

export class InitVisitor extends NodeVisitor {
    constructor() {
        super();
    }

    async asyncVisit(node: Node): Promise<void> {
        await init(node);
    }
}

export class EventCallbackVisitor extends NodeVisitor {
    _callbackName: string;
    _event: KeyboardEvent | MouseEvent | TouchEvent | null;

    constructor(callbackName: string)  {
        super();
        this._callbackName = callbackName;
        this._event = null;
    }

    set event(evt: KeyboardEvent | MouseEvent | TouchEvent | null) {
        this._event = evt;
    }

    get event(): KeyboardEvent | MouseEvent | TouchEvent | null {
        return this._event;
    }

    visit(node: Node): void {
        (node as any)[this._callbackName](this._event);
    }
}

export default class SceneRenderer {
    _renderer: Renderer;
    _keyDownVisitor: EventCallbackVisitor;
    _keyUpVisitor: EventCallbackVisitor;
    _mouseUpVisitor: EventCallbackVisitor;
    _mouseDownVisitor: EventCallbackVisitor;
    _mouseMoveVisitor: EventCallbackVisitor;
    _mouseOutVisitor: EventCallbackVisitor;
    _mouseDragVisitor: EventCallbackVisitor;
    _mouseWheelVisitor: EventCallbackVisitor;
    _touchStartVisitor: EventCallbackVisitor;
    _touchMoveVisitor: EventCallbackVisitor;
    _touchEndVisitor: EventCallbackVisitor;
    _sceneEnvironment: EnvironmentComponent | null;
    _shadowMapSize: Vec | null = null;
    _mainDirectionalLight: LightComponent | null = null;
    _opaquePipeline: Pipeline | null = null;
    _transparentPipeline: Pipeline | null = null;
    _renderQueue: RenderQueue | null = null;
    _initVisitor: InitVisitor | null = null;
    _frameVisitor: FrameVisitor | null = null;
    _skyCube: SkyCube | null = null;
    _shadowRenderer: ShadowRenderer | null = null;
    _environment: EnvironmentRenderer | null = null;
    _defaultViewMatrix: Mat4 = Mat4.MakeIdentity();
    _defaultProjectionMatrix: Mat4 = Mat4.MakeIdentity();
    _sceneRoot: Node | null = null;

    constructor(renderer: Renderer) {
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

    // Implement in subclasses
    get brightness(): number { return 0; }
    set brightness(_value: number) { }
    get contrast(): number { return 0; }
    set contrast(value: number) { }

    get renderer(): Renderer {
        return this._renderer;
    }

    get renderQueue(): RenderQueue | null {
        return this._renderQueue;
    }

    async init({ shadowMapSize = new Vec(1024, 1024) }: { shadowMapSize?: Vec | number } = {}): Promise<void> {
        if (typeof(shadowMapSize) === "number") {
            shadowMapSize = new Vec(shadowMapSize, shadowMapSize);
        }

        // TODO: Create function to resize shadow map
        this._shadowMapSize = shadowMapSize;

        this._mainDirectionalLight = null;

        this._opaquePipeline = this.renderer.factory.pipeline();
        this._opaquePipeline?.setBlendState({ enabled: false });
        this._opaquePipeline?.create();

        this._transparentPipeline = this.renderer.factory.pipeline();
        this._transparentPipeline?.setBlendState({
            enabled: true,
            blendFuncSrc: BlendFunction.SRC_ALPHA,
            blendFuncDst: BlendFunction.ONE_MINUS_SRC_ALPHA,
            blendFuncSrcAlpha: BlendFunction.ONE,
            blendFuncDstAlpha: BlendFunction.ONE_MINUS_SRC_ALPHA
        });
        this._transparentPipeline?.create();

        this._renderQueue = new RenderQueue(this.renderer);
        this._initVisitor = new InitVisitor();
        this._frameVisitor = new FrameVisitor(this._renderQueue);

        this._skyCube = this.renderer.factory.skyCube();

        this._shadowRenderer = this.renderer.factory.shadowRenderer();
        await this._shadowRenderer?.create(this._shadowMapSize);
    }

    async setEnvironment(env: EnvironmentRenderer): Promise<void> {
        this._environment = env;
        if (this._environment?.environmentMap) {
            this._skyCube?.load(this._environment?.environmentMap);
        }
    }

    get environment(): EnvironmentRenderer | null {
        return this._environment;
    }

    get defaultViewMatrix(): Mat4 {
        return this._defaultViewMatrix || Mat4.MakeIdentity();
    }

    set defaultViewMatrix(mat: Mat4) {
        this._defaultViewMatrix = mat;
    }

    get defaultProjectionMatrix(): Mat4 {
        return this._defaultProjectionMatrix || Mat4.MakePerspective(55,this.renderer.viewport.aspectRatio, 0.2, 100.0);
    }

    set defaultProjectionMatrix(mat: Mat4) {
        this._defaultProjectionMatrix = mat;
    }
    
    async bindRenderer(sceneRoot: Node): Promise<void> {
        const bindRendererVisitor = new BindRendererVisitor(this.renderer);
        sceneRoot.accept(bindRendererVisitor);

        await sceneRoot.asyncAccept(this._initVisitor);        

        const findVisitor = new FindNodeVisitor();
        findVisitor.hasComponents("Environment");
        sceneRoot.accept(findVisitor);
        if (findVisitor.result.length) {
            const comp = findVisitor.result[0].component("Environment") as EnvironmentComponent;
            comp && this.setEnvironment(comp.environment);
            this._sceneEnvironment = comp;
        }
    }

    resize(sceneRoot: Node, width: number, height: number): void {
        this.renderer.viewport = new Vec([0, 0, width, height]);
        this.renderer.canvas.updateViewportSize();
        const mainCamera = Camera.GetMain(sceneRoot);
        if (mainCamera) {
            mainCamera.resize(width,height);
        }
    }

    async frame(sceneRoot: Node, delta: number): Promise<void> {
        if (!this._frameVisitor || !this._renderQueue || !this._initVisitor) {
            throw new Error("SceneRenderer.frame(): SceneRenderer not initialized. Call SceneRenderer.init() first.");
        }

        if (sceneRoot.sceneChanged) {
            await sceneRoot.asyncAccept(this._initVisitor);
        }
        this._sceneRoot = sceneRoot;

        this._renderQueue?.newFrame();
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

        this._skyCube?.updateRenderState({
            viewMatrix: viewMatrix,
            projectionMatrix: projectionMatrix
        });
    }

    draw({ clearBuffers = true, drawSky = true }: { clearBuffers?: boolean; drawSky?: boolean } = {}): void {
        if (!this._renderQueue || !this._shadowRenderer || !this._sceneRoot) {
            throw new Error("SceneRenderer.draw(): SceneRenderer not initialized. Call SceneRenderer.init() first.");
        }

        const mainLight = LightComponent.GetMainDirectionalLight(this._sceneRoot);
        const camera = Camera.GetMain(this._sceneRoot);

        // Update the light projection based on the camera focus distance, to optimize
        // the shadow map size
        if (mainLight && camera) {
            const focus = camera.focusDistance;
            const lightProjection = Mat4.MakeOrtho(-focus,focus,-focus,focus,0.1,500.0);
            mainLight.light.projection = lightProjection;
        }
        if (mainLight && camera) {
            this._shadowRenderer.update(camera, mainLight, this._renderQueue);
        }
        
        if (clearBuffers) {
            this.renderer.frameBuffer.clear();
        }

        if (this.environment && !this.environment.updated) {
            this.environment.updateMaps();
        }

        if (drawSky && (!this._sceneEnvironment || this._sceneEnvironment.showSkybox)) {
            this._skyCube?.draw();
        }

        this._renderQueue.draw(RenderLayer.OPAQUE_DEFAULT);
        this._renderQueue.draw(RenderLayer.TRANSPARENT_DEFAULT);
    }

    destroy(): void {

    }

    keyDown(sceneRoot: Node, evt: KeyboardEvent): void {
        this._keyDownVisitor.event = evt;
        sceneRoot.accept(this._keyDownVisitor);
    }

    keyUp(sceneRoot: Node, evt: KeyboardEvent): void {
        this._keyUpVisitor.event = evt;
        sceneRoot.accept(this._keyUpVisitor);
    }

    mouseUp(sceneRoot: Node, evt: MouseEvent): void {
        this._mouseUpVisitor.event = evt;
        sceneRoot.accept(this._mouseUpVisitor);
    }

    mouseDown(sceneRoot: Node, evt: MouseEvent): void {
        this._mouseDownVisitor.event = evt;
        sceneRoot.accept(this._mouseDownVisitor);
    }

    mouseMove(sceneRoot: Node, evt: MouseEvent): void {
        this._mouseMoveVisitor.event = evt;
        sceneRoot.accept(this._mouseMoveVisitor);
    }

    mouseOut(sceneRoot: Node, evt: MouseEvent): void {
        this._mouseOutVisitor.event = evt;
        sceneRoot.accept(this._mouseOutVisitor);
    }

    mouseDrag(sceneRoot: Node, evt: MouseEvent): void {
        this._mouseDragVisitor.event = evt;
        sceneRoot.accept(this._mouseDragVisitor);
    }

    mouseWheel(sceneRoot: Node, evt: MouseEvent): void {
        this._mouseWheelVisitor.event = evt;
        sceneRoot.accept(this._mouseWheelVisitor);
    }

    touchStart(sceneRoot: Node, evt: TouchEvent): void {
        this._touchStartVisitor.event = evt;
        sceneRoot.accept(this._touchStartVisitor);
    }

    touchMove(sceneRoot: Node, evt: TouchEvent): void {
        this._touchMoveVisitor.event = evt;
        sceneRoot.accept(this._touchMoveVisitor);
    }

    touchEnd(sceneRoot: Node, evt: TouchEvent): void {
        this._touchEndVisitor.event = evt;
        sceneRoot.accept(this._touchEndVisitor);
    }

}