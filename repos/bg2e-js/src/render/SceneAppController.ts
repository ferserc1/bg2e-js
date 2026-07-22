/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import AppController from "../app/AppController";
import SelectionHighlight from "../manipulation/SelectionHighlight";
import SelectionManager from "../manipulation/SelectionManager";
import GizmoManager from "../manipulation/GizmoManager";
import { registerComponents } from "../scene";
import Camera from "../scene/Camera";
import DebugRenderer from "../debug/DebugRenderer";
import Vec from "../math/Vec";
import Node from "../scene/Node";
import type SceneRenderer from "./SceneRenderer";
import type Environment from "./Environment";
import Bg2KeyboardEvent from "../app/Bg2KeyboardEvent";
import Bg2MouseEvent from "../app/Bg2MouseEvent";
import Bg2TouchEvent from "../app/Bg2TouchEvent";

export default class SceneAppController extends AppController {
    protected _sceneRoot: Node | null = null;
    protected _sceneRenderer: SceneRenderer | null = null;
    protected _environment: Environment | null = null;
    protected _selectionManager: SelectionManager | null = null;
    protected _selectionHighlight: SelectionHighlight | null = null;
    protected _gizmoManager: GizmoManager | null = null;
    protected _updateOnInputEvents: boolean | undefined;
    protected _debugRenderer: DebugRenderer | null = null;
    protected _updateInputEventsFrameCount: number = 60;

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

    get gizmoManager(): GizmoManager | null {
        return this._gizmoManager;
    }

    get selectionManagerEnabled(): boolean {
        return true;
    }

    get selectionHighlightEnabled(): boolean {
        return true;
    }

    get gizmoManagerEnabled(): boolean {
        return true;
    }

    get updateOnInputEvents(): boolean {
        return this._updateOnInputEvents ?? true;
    }

    set updateOnInputEvents(update: boolean) {
        this._updateOnInputEvents = update;
    }

    get updateInputEventsFrameCount(): number {
        return this._updateInputEventsFrameCount;
    }

    set updateInputEventsFrameCount(count: number) {
        this._updateInputEventsFrameCount = count;
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

        if (this.gizmoManagerEnabled) {
            if (!this._selectionManager) {
                console.warn("SceneAppController.init(): gizmoManagerEnabled is true but selectionManagerEnabled is false. GizmoManager needs a SelectionManager to resolve which node to show a gizmo for, so it will not be created.");
            }
            else {
                this._gizmoManager = new GizmoManager(this.renderer, this._selectionManager);
                await this._gizmoManager.init();
                this._gizmoManager.sceneRoot = this.sceneRoot;
            }
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
        this.gizmoManager?.setViewportSize(width,height);
        this._debugRenderer?.setViewportSize(width,height);
    }

    async frame(delta: number): Promise<void> {
        if (!this.sceneRoot || !this.sceneRenderer) {
            return;
        }
        this._debugRenderer?.beginFrame();

        await this.sceneRenderer?.frame(this.sceneRoot, delta);
        if (this.sceneRenderer.postRedisplayFrames > 0) {
            this.mainLoop.postRedisplay({ frames: this.sceneRenderer.postRedisplayFrames });
        }
    }

    display(): void {
        if (!this.sceneRoot || !this.sceneRenderer) {
            return;
        }
        this.sceneRenderer.draw();
        const camera = Camera.GetMain(this.sceneRoot);
        if (camera) {
            this.selectionHighlight && this.selectionHighlight.draw(this.sceneRoot, camera);
            this.gizmoManager && this.gizmoManager.draw(this.sceneRoot, camera);
        }
    }

    destroy(): void {
        this.sceneRenderer?.destroy();
        if (this.selectionManagerEnabled) {
            this.selectionManager?.destroy();
        }
        if (this.gizmoManagerEnabled) {
            this.gizmoManager?.destroy();
        }
    }

    keyDown(evt: Bg2KeyboardEvent): void {
        this.sceneRoot && this.sceneRenderer?.keyDown(this.sceneRoot, evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay({ frames: this._updateInputEventsFrameCount });
        }
    }

    keyUp(evt: Bg2KeyboardEvent): void {
        this.sceneRoot && this.sceneRenderer?.keyUp(this.sceneRoot, evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay({ frames: this._updateInputEventsFrameCount });
        }
    }

    mouseUp(evt: Bg2MouseEvent): void {
        // Read this before gizmoManager.mouseUp() clears it, so the scene graph (and
        // SelectionManager) only misses this event when the gizmo actually claimed the drag.
        const wasInteractingWithGizmo = this.gizmoManager?.isInteracting ?? false;
        if (!wasInteractingWithGizmo) {
            this.sceneRoot && this.sceneRenderer?.mouseUp(this.sceneRoot, evt);
            this.selectionManager?.mouseUp(evt);
        }
        this.gizmoManager?.mouseUp(evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay({ frames: this._updateInputEventsFrameCount });
        }
    }

    mouseDown(evt: Bg2MouseEvent): void {
        // gizmoManager.mouseDown() performs the gizmo hit-test synchronously, so
        // isInteracting is already up to date once it returns: if it claimed this click,
        // the scene graph (e.g. OrbitCameraController) must not see it at all.
        this.gizmoManager?.mouseDown(evt);
        if (!this.gizmoManager?.isInteracting) {
            this.sceneRoot && this.sceneRenderer?.mouseDown(this.sceneRoot, evt);
            this.selectionManager?.mouseDown(evt);
        }
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay({ frames: this._updateInputEventsFrameCount });
        }
    }

    mouseMove(evt: Bg2MouseEvent): void {
        if (!this.gizmoManager?.isInteracting) {
            this.sceneRoot && this.sceneRenderer?.mouseMove(this.sceneRoot, evt);
        }
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay({ frames: this._updateInputEventsFrameCount });
        }
    }

    mouseOut(evt: Bg2MouseEvent): void {
        this.sceneRoot && this.sceneRenderer?.mouseOut(this.sceneRoot, evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay({ frames: this._updateInputEventsFrameCount });
        }
    }

    mouseDrag(evt: Bg2MouseEvent): void {
        if (this.gizmoManager?.isInteracting) {
            this.gizmoManager.mouseDrag(evt);
        }
        else {
            this.sceneRoot && this.sceneRenderer?.mouseDrag(this.sceneRoot, evt);
        }
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay({ frames: this._updateInputEventsFrameCount });
        }
    }

    mouseWheel(evt: Bg2MouseEvent): void {
        if (!this.gizmoManager?.isInteracting) {
            this.sceneRoot && this.sceneRenderer?.mouseWheel(this.sceneRoot, evt);
        }
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay({ frames: this._updateInputEventsFrameCount });
        }
    }

    touchStart(evt: Bg2TouchEvent): void {
        this.sceneRoot && this.sceneRenderer?.touchStart(this.sceneRoot, evt);
        this.selectionManager?.touchStart(evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay({ frames: this._updateInputEventsFrameCount });
        }
    }

    touchMove(evt: Bg2TouchEvent): void {
        this.sceneRoot && this.sceneRenderer?.touchMove(this.sceneRoot, evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay({ frames: this._updateInputEventsFrameCount });
        }
    }

    touchEnd(evt: Bg2TouchEvent): void {
        this.sceneRoot && this.sceneRenderer?.touchEnd(this.sceneRoot, evt);
        this.selectionManager?.touchEnd(evt);
        if (this.updateOnInputEvents) {
            this.mainLoop.postRedisplay({ frames: this._updateInputEventsFrameCount });
        }
    }   
}
