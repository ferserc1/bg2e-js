import AppController from "../app/AppController";
import { registerComponents } from "../scene";

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

    async loadScene() {
        return new Node("Scene Root");
    }

    async loadEnvironment() {
        return null;
    }

    async registerLoaders() {

    }

    async init() {
        registerComponents();

        await this.registerLoaders();

        this._sceneRoot = await this.loadScene();

        this._environment = await this.loadEnvironment();

        this._sceneRenderer = this.renderer.factory.scene();
        await this.sceneRenderer.init();
        if (this.environment) {
            await this.sceneRenderer.setEnvironment(this.environment);
        }

        this.sceneRenderer.bindRenderer(this.sceneRoot);
    }

    reshape(width,height) {
        this.sceneRenderer.resize(this.sceneRoot,width,height);
    }

    frame(delta) {
        this.sceneRenderer.frame(this.sceneRoot, delta);
    }

    display() {
        this.sceneRenderer.draw();
    }

    destroy() {
        this.sceneRenderer.destroy();
    }

    keyDown(evt) {
        this.sceneRenderer.keyDown(this.sceneRoot,evt);
    }

    keyUp(evt) {
        this.sceneRenderer.keyUp(this.sceneRoot,evt);
    }

    mouseUp(evt) {
        this.sceneRenderer.mouseUp(this.sceneRoot,evt);
    }

    mouseDown(evt) {
        this.sceneRenderer.mouseDown(this.sceneRoot,evt);
    }

    mouseMove(evt) {
        this.sceneRenderer.mouseMove(this.sceneRoot,evt);
    }

    mouseOut(evt) {
        this.sceneRenderer.mouseOut(this.sceneRoot,evt);
    }

    mouseDrag(evt) {
        this.sceneRenderer.mouseDrag(this.sceneRoot,evt);
    }

    mouseWheel(evt) {
        this.sceneRenderer.mouseWheel(this.sceneRoot,evt);
    }

    touchStart(evt) {
        this.sceneRenderer.touchStart(this.sceneRoot,evt);
    }

    touchMove(evt) {
        this.sceneRenderer.touchMove(this.sceneRoot,evt);
    }

    touchEnd(evt) {
        this.sceneRenderer.touchEnd(this.sceneRoot,evt);
    }   
}
