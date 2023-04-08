import Vec from "../math/Vec";
import SelectionBuffer from "./SelectionBuffer";
import Camera from "../scene/Camera";
import SelectionIdAssignVisitor from "./SelectionIdAssignVisitor";
import SelectionMode from "./SelectionMode";

export default class SelectionManager {
    constructor(renderer) {
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

    setViewportSize(w,h) {
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

        this._camera = Camera.GetMain(this.sceneRoot);
        return this._camera;
    }

    set selectionMode(mode) {
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

    onSelectionChanged(id, cb) {
        this._selectionChangedCallbacks[id] = cb;
    }

    triggerSelectionChanged() {
        for (const key in this._selectionChangedCallbacks) {
            this._selectionChangedCallbacks[key](this._selection);
        }
    }

    mouseUp(evt) {
        const upPosition = new Vec([evt.x, evt.y]);
        if (Vec.Distance(this._downPosition, upPosition) < 2) {
            this._selectionIdVisitor.selectionMode = this.selectionMode;
            this.sceneRoot.accept(this._selectionIdVisitor);
            
            this._selectionBuffer.reshape(this._viewportSize[0], this._viewportSize[1]);
            const pickedColor = this._selectionBuffer.draw(this.sceneRoot, this.camera, evt.x, evt.y);
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
        }
    }

    mouseDown(evt) {
        this._downPosition = new Vec([evt.x, evt.y]);
    }

    touchStart(evt) {

    }

    touchEnd(evt) {

    }

    destroy() {
        this._selectionBuffer.destroy();
    }
}
