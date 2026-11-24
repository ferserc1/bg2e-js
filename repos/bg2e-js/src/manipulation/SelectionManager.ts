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

import Vec from "../math/Vec";
import SelectionBuffer from "./SelectionBuffer";
import Camera from "../scene/Camera";
import SelectionIdAssignVisitor, { type SelectionElement } from "./SelectionIdAssignVisitor";
import SelectionMode from "./SelectionMode";
import Renderer from "../render/Renderer";
import Node from "../scene/Node";
import DrawableInstance from "../scene/DrawableInstance";
import Bg2MouseEvent from "../app/Bg2MouseEvent";
import Bg2TouchEvent from "../app/Bg2TouchEvent";

export type SelectionChangedData = SelectionElement;
export type SelectionChangedCallback = (selection: SelectionChangedData[]) => void;

export default class SelectionManager {
    protected _renderer: Renderer;
    protected _sceneRoot: Node | null;
    protected _camera: Camera | null;
    protected _selectionMode: SelectionMode;
    protected _multiSelect: boolean;
    protected _selection: SelectionElement[];
    protected _selectionChangedCallbacks: Record<string, SelectionChangedCallback>;
    protected _selectionBuffer: SelectionBuffer | null = null;
    protected _selectionIdVisitor: SelectionIdAssignVisitor | null = null;
    protected _downPosition: Vec = new Vec();
    protected _viewportSize: [number, number] = [1, 1];
    protected _enabled: boolean = true;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
        this._sceneRoot = null;
        this._camera = null;
        this._selectionMode = SelectionMode.POLY_LIST;
        this._multiSelect = false;

        this._selection = [];

        this._selectionChangedCallbacks = {}
    }

    async init() {
        this._selectionBuffer = new SelectionBuffer(this._renderer);
        await this._selectionBuffer.init();

        this._selectionIdVisitor = new SelectionIdAssignVisitor();
    }

    setViewportSize(w: number, h: number) {
        this._viewportSize = [w, h];
    }

    get selection() {
        return this._selection;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
        if (!this._enabled) {
            this.clearSelection();
        }
    }

    clearSelection() {
        this._selection.forEach(item => this.clearItemSelection(item));
        this._selection = [];
        this.triggerSelectionChanged();
    }

    // Clears the selection flags of a picked element. All the items of the element are
    // cleared, whatever the current selection mode is, because the selection mode may
    // have changed since the element was selected.
    protected clearItemSelection(item: SelectionElement) {
        if (item.drawable instanceof DrawableInstance) {
            item.drawable.clearSelection();
        }
        else {
            item.drawable.items.forEach(({ polyList }) => polyList.selected = false);
        }
    }

    protected applyItemSelection(item: SelectionElement) {
        const wholeObject = this.selectionMode === SelectionMode.OBJECT;
        if (item.drawable instanceof DrawableInstance) {
            if (wholeObject) item.drawable.selectAll();
            else item.drawable.setSelected(item.itemIndex, true);
        }
        else if (wholeObject) {
            item.drawable.items.forEach(({ polyList }) => polyList.selected = true);
        }
        else {
            item.polyList.selected = true;
        }
    }

    set sceneRoot(root) {
        this._sceneRoot = root;
        this.clearSelection();
    }

    get sceneRoot() {
        return this._sceneRoot;
    }

    set camera(cam) {
        this._camera = cam;
        this.clearSelection();
    }

    get camera() {
        if (this._camera) {
            return this._camera;
        }

        if (!this.sceneRoot) {
            return null;
        }

        this._camera = Camera.GetMain(this.sceneRoot);
        return this._camera;
    }

    set selectionMode(mode: SelectionMode) {
        this._selectionMode = mode;
        this.clearSelection();
    }

    get selectionMode() {
        return this._selectionMode;
    }

    setSelectionMode(mode: SelectionMode) {
        this.selectionMode = mode;
    }

    setMultiSelectMode(mode: boolean) {
        this.multiSelectMode = mode;
    }

    set multiSelectMode(mode) {
        this._multiSelect = mode;
        this.clearSelection();
    }

    get multiSelectMode() {
        return this._multiSelect;
    }

    onSelectionChanged(id: string, cb: SelectionChangedCallback) {
        this._selectionChangedCallbacks[id] = cb;
    }

    triggerSelectionChanged() {
        for (const key in this._selectionChangedCallbacks) {
            this._selectionChangedCallbacks[key](this._selection);
        }
    }

    mouseUp(evt: { x: number; y: number }) {
        if (!this._selectionBuffer || !this._selectionIdVisitor || !this.camera || !this.sceneRoot || !this.enabled) {
            return;
        }

        const upPosition = new Vec([evt.x, evt.y]);
        if (Vec.Distance(this._downPosition, upPosition) < 2) {
            if (this._selectionIdVisitor && this.sceneRoot) {
                this._selectionIdVisitor.selectionMode = this.selectionMode;
                this.sceneRoot.accept(this._selectionIdVisitor);
            }
            const pixelRatio = window.devicePixelRatio || 1;
            this._selectionBuffer?.reshape(this._viewportSize[0], this._viewportSize[1]);
            const pickedColor = this._selectionBuffer!.draw(this.sceneRoot, this.camera, evt.x * pixelRatio, evt.y * pixelRatio);
            const item = this._selectionIdVisitor.findElement(pickedColor);
            const previous = this._selection;
            const selection = previous.filter(selected =>
                selected.drawable.items[selected.itemIndex]?.polyList === selected.polyList);
            const selectedIndex = item ? selection.findIndex(selected =>
                selected.drawable === item.drawable &&
                (this.selectionMode === SelectionMode.OBJECT || selected.itemIndex === item.itemIndex)) : -1;

            if (!item) this._selection = [];
            else if (this._multiSelect && selectedIndex === -1) this._selection = [...selection, item];
            else if (this._multiSelect) this._selection = selection.filter((_, index) => index !== selectedIndex);
            else this._selection = selectedIndex === -1 ? [item] : selection;

            previous.forEach(selected => this.clearItemSelection(selected));
            this._selection.forEach(selected => this.applyItemSelection(selected));
            if (previous.length !== this._selection.length ||
                previous.some((selected, index) => selected !== this._selection[index])) {
                this.triggerSelectionChanged();
            }
        }
    }

    mouseDown(evt: Bg2MouseEvent) {
        this._downPosition = new Vec([evt.x, evt.y]);
    }

    touchStart(evt: Bg2TouchEvent) {

    }

    touchEnd(evt: Bg2TouchEvent) {

    }

    destroy() {
        this._selectionBuffer?.destroy();
    }
}
