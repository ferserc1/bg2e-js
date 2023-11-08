import AppController from "../app/AppController";
import SelectionHighlight from "../manipulation/SelectionHighlight";
import SelectionManager from "../manipulation/SelectionManager";
import { registerComponents } from "../scene";
import Camera from "../scene/Camera";
import DebugRenderer from "../debug/DebugRenderer";
import Vec from "../math/Vec";

export default class SceneAppController extends AppController {
    get sceneRoot() {
        return this._sceneRoot;
    }

    get sceneRenderer() {
        return this._sceneRenderer;
    }

    get environment() {
        return this._environment;
    }

    get selectionManager() {
        return this._selectionManager;
    }

    get selectionHighlight() {
        return this._selectionHighlight;
    }

    get selectionManagerEnabled() {
        return true;
    }

    get selectionHighlightEnabled() {
        return true;
    }

    get updateOnInputEvents() {
        return this._updateOnInputEvents ?? true;
    }

    set updateOnInputEvents(update) {
        this._updateOnInputEvents = update;
    }

    async loadScene() {
        return new Node("Scene Root");
    }

    async loadEnvironment() {
        return null;
    }

    async registerLoaders() {

    }

    async loadDone() {

    }

    async init() {
        registerComponents();

        await this.registerLoaders();

        this._sceneRoot = await this.loadScene();

        this._environment = await this.loadEnvironment();

        if (!this._environment) {
            this._environment = this.renderer.factory.environment();
            await this._environment.load();   // Load black environment
        }

        this._sceneRenderer = this.renderer.factory.scene();
        await this.sceneRenderer.init({ shadowMapSize: new Vec(4096, 4096) });
        if (this.environment) {
            await this.sceneRenderer.setEnvironment(this.environment);
        }

        await this.sceneRenderer.bindRenderer(this.sceneRoot);

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
        await this._debugRenderer.init();

        await this.loadDone();
    }

    reshape(width,height) {
        this.sceneRenderer.resize(this.sceneRoot,width,height);
        this.selectionManager?.setViewportSize(width,height);
        this.selectionHighlight?.setViewportSize(width,height);
        this._debugRenderer.setViewportSize(width,height);
    }

    async frame(delta) {
        this._debugRenderer.beginFrame();

        await this.sceneRenderer.frame(this.sceneRoot, delta);
    }

    display() {
        this.sceneRenderer.draw();
        const camera = Camera.GetMain(this.sceneRoot);
        this.selectionHighlight && this.selectionHighlight.draw(this.sceneRoot, camera);
        this._debugRenderer.draw(camera);
    }

    destroy() {
        this.sceneRenderer.destroy();
        if (this.selectionManagerEnabled) {
            this.selectionManager.destroy();
        }
    }

    keyDown(evt) {
        this.sceneRenderer.keyDown(this.sceneRoot,evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    keyUp(evt) {
        this.sceneRenderer.keyUp(this.sceneRoot,evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    mouseUp(evt) {
        this.sceneRenderer.mouseUp(this.sceneRoot,evt);
        this.selectionManager?.mouseUp(evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    mouseDown(evt) {
        this.sceneRenderer.mouseDown(this.sceneRoot,evt);
        this.selectionManager?.mouseDown(evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    mouseMove(evt) {
        this.sceneRenderer.mouseMove(this.sceneRoot,evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    mouseOut(evt) {
        this.sceneRenderer.mouseOut(this.sceneRoot,evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    mouseDrag(evt) {
        this.sceneRenderer.mouseDrag(this.sceneRoot,evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    mouseWheel(evt) {
        this.sceneRenderer.mouseWheel(this.sceneRoot,evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    touchStart(evt) {
        this.sceneRenderer.touchStart(this.sceneRoot,evt);
        this.selectionManager?.touchStart(evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    touchMove(evt) {
        this.sceneRenderer.touchMove(this.sceneRoot,evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }

    touchEnd(evt) {
        this.sceneRenderer.touchEnd(this.sceneRoot,evt);
        this.selectionManager?.touchEnd(evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay();
        }
    }   
}
