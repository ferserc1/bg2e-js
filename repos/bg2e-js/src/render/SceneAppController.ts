import AppController from "../app/AppController";
import SelectionHighlight from "../manipulation/SelectionHighlight";
import SelectionManager from "../manipulation/SelectionManager";
import { registerComponents } from "../scene";
import Camera from "../scene/Camera";
import DebugRenderer from "../debug/DebugRenderer";
import Vec from "../math/Vec";
import Node from "../scene/Node";
import type SceneRenderer from "./SceneRenderer";
import type Environment from "./Environment";
import KeyboardEvent from "../app/KeyboardEvent";
import MouseEvent from "../app/MouseEvent";
import TouchEvent from "../app/TouchEvent";

export default class SceneAppController extends AppController {
    _sceneRoot: Node | null = null;
    _sceneRenderer: SceneRenderer | null = null;
    _environment: Environment | null = null;
    _selectionManager: SelectionManager | null = null;
    _selectionHighlight: SelectionHighlight | null = null;
    _updateOnInputEvents: boolean | undefined;
    _debugRenderer: DebugRenderer | null = null;

    get sceneRoot(): Node | null {
        return this._sceneRoot;
    }

    get sceneRenderer(): SceneRenderer | null {
        return this._sceneRenderer;
    }

    get environment(): Environment | null {
        return this._environment;
    }

    get selectionManager(): SelectionManager | null {
        return this._selectionManager;
    }

    get selectionHighlight(): SelectionHighlight | null {
        return this._selectionHighlight;
    }

    get selectionManagerEnabled(): boolean {
        return true;
    }

    get selectionHighlightEnabled(): boolean {
        return true;
    }

    get updateOnInputEvents(): boolean {
        return this._updateOnInputEvents ?? true;
    }

    set updateOnInputEvents(update: boolean) {
        this._updateOnInputEvents = update;
    }

    async loadScene(): Promise<Node> {
        return new Node("Scene Root");
    }

    async loadEnvironment(): Promise<Environment | null> {
        return null;
    }

    async registerLoaders(): Promise<void> {

    }

    async loadDone(): Promise<void> {

    }

    async init(): Promise<void> {
        registerComponents();

        await this.registerLoaders();

        this._sceneRoot = await this.loadScene();

        if (!this._sceneRoot) {
            throw new Error("SceneAppController.init: Failed to load scene.");
        }

        this._environment = await this.loadEnvironment();

        if (!this._environment) {
            this._environment = this.renderer.factory.environment();
            await this._environment?.load();   // Load black environment
        }

        this._sceneRenderer = this.renderer.factory.scene();
        await this.sceneRenderer?.init({ shadowMapSize: new Vec(4096, 4096) });
        if (this.environment) {
            await this.sceneRenderer?.setEnvironment(this.environment);
        }

        await this.sceneRenderer?.bindRenderer(this.sceneRoot!);

        if (this.selectionManagerEnabled) {
            this._selectionManager = new SelectionManager(this.renderer);
            await this._selectionManager.init();
            this._selectionManager.sceneRoot = this.sceneRoot;
        }

        if (this.selectionHighlightEnabled) {
            this._selectionHighlight = new SelectionHighlight(this.renderer);
            await this._selectionHighlight.init();
        }

        this._debugRenderer = DebugRenderer.Get(this.renderer);
        await this._debugRenderer?.init();

        await this.loadDone();
    }

    reshape(width: number, height: number): void {
        if (!this.sceneRoot || !this.sceneRenderer) {
            return;
        }

        this.sceneRenderer.resize(this.sceneRoot,width,height);
        this.selectionManager?.setViewportSize(width,height);
        this.selectionHighlight?.setViewportSize(width,height);
        this._debugRenderer?.setViewportSize(width,height);
    }

    async frame(delta: number): Promise<void> {
        if (!this.sceneRoot || !this.sceneRenderer) {
            return;
        }
        this._debugRenderer?.beginFrame();

        await this.sceneRenderer?.frame(this.sceneRoot, delta);
    }

    display(): void {
        if (!this.sceneRoot || !this.sceneRenderer) {
            return;
        }
        this.sceneRenderer.draw();
        const camera = Camera.GetMain(this.sceneRoot);
        this.selectionHighlight && this.selectionHighlight.draw(this.sceneRoot, camera);
        if (camera) {
            this._debugRenderer?.draw(camera);
        }
    }

    destroy(): void {
        this.sceneRenderer?.destroy();
        if (this.selectionManagerEnabled) {
            this.selectionManager?.destroy();
        }
    }

    keyDown(evt: KeyboardEvent): void {
        this.sceneRoot && this.sceneRenderer?.keyDown(this.sceneRoot, evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    keyUp(evt: KeyboardEvent): void {
        this.sceneRoot && this.sceneRenderer?.keyUp(this.sceneRoot, evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    mouseUp(evt: MouseEvent): void {
        this.sceneRoot && this.sceneRenderer?.mouseUp(this.sceneRoot, evt);
        this.selectionManager?.mouseUp(evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    mouseDown(evt: MouseEvent): void {
        this.sceneRoot && this.sceneRenderer?.mouseDown(this.sceneRoot, evt);
        this.selectionManager?.mouseDown(evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    mouseMove(evt: MouseEvent): void {
        this.sceneRoot && this.sceneRenderer?.mouseMove(this.sceneRoot, evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    mouseOut(evt: MouseEvent): void {
        this.sceneRoot && this.sceneRenderer?.mouseOut(this.sceneRoot, evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    mouseDrag(evt: MouseEvent): void {
        this.sceneRoot && this.sceneRenderer?.mouseDrag(this.sceneRoot, evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    mouseWheel(evt: MouseEvent): void {
        this.sceneRoot && this.sceneRenderer?.mouseWheel(this.sceneRoot, evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    touchStart(evt: TouchEvent): void {
        this.sceneRoot && this.sceneRenderer?.touchStart(this.sceneRoot, evt);
        this.selectionManager?.touchStart(evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    touchMove(evt: TouchEvent): void {
        this.sceneRoot && this.sceneRenderer?.touchMove(this.sceneRoot, evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    touchEnd(evt: TouchEvent): void {
        this.sceneRoot && this.sceneRenderer?.touchEnd(this.sceneRoot, evt);
        this.selectionManager?.touchEnd(evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }   
}
