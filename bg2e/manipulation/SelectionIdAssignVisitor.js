import NodeVisitor from "../scene/NodeVisitor";
import SelectionMode from "./SelectionMode";
import Color from "../base/Color";

export default class SelectionAssignVisitor extends NodeVisitor {
    constructor() {
        super();

        this._selectionMode = SelectionMode.POLY_LIST;
        this._elements = [];
    }

    set selectionMode(mode) {
        this._selectionMode = mode;
        this.clear();
    }

    get selectionMode() {
        return this._selectionMode;
    }

    clear() {
        this._r = 0;
        this._g = 0;
        this._b = 0;
        this._elements = [];
    }

    getNextColor() {
        const color = new Color([this._r/255, this._g/255, this._b/255, 1]);
        ++this._b;
        if (this._b > 255) {
            this._b = 0;
            ++this._g;
        }
        if (this._g > 255) {
            this._g = 0;
            ++this._r;
        }
        if (this._r > 255) {
            console.warn("Maximum number of selectable objects reached");
        }
        return color;
    }

    findElement(pickedColor) {
        return this._elements.find(elem => {
            return  Math.round(elem.polyList.colorCode[0] * 255) === pickedColor[0] &&
                    Math.round(elem.polyList.colorCode[1] * 255) === pickedColor[1] &&
                    Math.round(elem.polyList.colorCode[2] * 255) === pickedColor[2] &&
                    Math.round(elem.polyList.colorCode[3] * 255) === pickedColor[3];
        });
    }

    visit(node) {
        const { drawable } = node;
        if (drawable) {
            let color = this.getNextColor();
            drawable.items.forEach(({polyList}, i, array) => {
                polyList.colorCode = color;
                this._elements.push({ polyList, drawable });
                // Get new color code for the next polyList, only if this is not the
                // last item, and the selection mode is POLY_LIST, otherwise we'll
                // use the same color code for all polyList in the drawable
                if (i<array.length-1 && this._selectionMode == SelectionMode.POLY_LIST) {
                    color = this.getNextColor();
                }
            });
        }
    }
}