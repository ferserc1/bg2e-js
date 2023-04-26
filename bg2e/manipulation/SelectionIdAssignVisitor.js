import NodeVisitor from "../scene/NodeVisitor";
import SelectionMode from "./SelectionMode";
import Color from "../base/Color";

const getColor = (comps) => "" + comps[0] + comps[1] + comps[2];

export default class SelectionAssignVisitor extends NodeVisitor {
    constructor() {
        super();

        this._selectionMode = SelectionMode.POLY_LIST;
        this._elements = {};
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
        this._elements = {};
    }

    getNextColor() {
        const getId = () => {
            return [ Math.round(Math.random()*255),
                     Math.round(Math.random()*255),
                     Math.round(Math.random()*255)];
        }
        
        let components = getId();
        let color = getColor(components);
        while (this._elements[color]) {
            components = getId();
            color = getColor(components);
        }

        this._r = components[0];
        this._g = components[1];
        this._b = components[2];

        return new Color([components[0]/255, components[1]/255, components[2]/255, 1]);
    }

    findElement(pickedColor) {
        const color = [
            pickedColor[0],
            pickedColor[1],
            pickedColor[2]
        ];
        return this._elements[getColor(color)];
    }

    visit(node) {
        const { drawable } = node;
        if (drawable) {
            let color = this.getNextColor();
            drawable.items.forEach(({polyList}, i, array) => {
                polyList.colorCode = color;
                const colorCode = getColor([
                    Math.round(color[0] * 255),
                    Math.round(color[1] * 255),
                    Math.round(color[2] * 255)
                ]);
                console.log(colorCode);
                this._elements[colorCode] = { polyList, drawable };
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