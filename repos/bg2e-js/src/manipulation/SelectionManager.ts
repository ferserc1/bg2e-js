import Vec from "../math/Vec";
import SelectionBuffer from "./SelectionBuffer";
import Camera from "../scene/Camera";
import SelectionIdAssignVisitor from "./SelectionIdAssignVisitor";
import SelectionMode from "./SelectionMode";
import Renderer from "../render/Renderer";
import Node from "../scene/Node";
import Bg2MouseEvent from "../app/Bg2MouseEvent";
import Bg2TouchEvent from "../app/Bg2TouchEvent";

export type SelectionChangedData = {
    polyList: any;
    drawable: any;
}
export type SelectionChangedCallback = (selection: SelectionChangedData[]) => void;

export default class SelectionManager {
    protected _renderer: Renderer;
    protected _sceneRoot: Node | null;
    protected _camera: Camera | null;
    protected _selectionMode: SelectionMode;
    protected _multiSelect: boolean;
    protected _selection: Array<{ polyList: any; drawable: any }>;
    protected _selectionChangedCallbacks: Record<string, SelectionChangedCallback>;
    protected _selectionBuffer: SelectionBuffer | null = null;
    protected _selectionIdVisitor: SelectionIdAssignVisitor | null = null;
    protected _downPosition: Vec = new Vec();
    protected _viewportSize: [number, number] = [1, 1];

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

    clearSelection() {
        this._selection = [];
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
        if (!this._selectionBuffer || !this._selectionIdVisitor || !this.camera || !this.sceneRoot) {
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
            const isSelected = () => this._selection.find(s => {
                return s.polyList === item.polyList && s.drawable === item.drawable
            });
            if (item && this._multiSelect && !isSelected()) {
                this._selection.push(item);
                this.triggerSelectionChanged();
            }
            else if (item && !isSelected()) {
                this._selection = [item];
                this.triggerSelectionChanged();
            }
            else if (!item && !this._multiSelect && this._selection.length > 0) {
                this._selection = [];
                this.triggerSelectionChanged();
            }

            this._selection.forEach(item => item.polyList.selected = true);
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
