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

import NodeVisitor from "../scene/NodeVisitor";
import SelectionMode from "./SelectionMode";
import Color from "../base/Color";
import Node from "../scene/Node";
import PolyList from "../base/PolyList";
import Drawable from "../scene/Drawable";
import type DrawableInstance from "../scene/DrawableInstance";

const getColorKey = (comps: ArrayLike<number>) =>
    (Math.round(comps[0]) << 16) | (Math.round(comps[1]) << 8) | Math.round(comps[2]);

export type SelectionElement = {
    polyList: PolyList;
    drawable: Drawable | DrawableInstance;
    itemIndex: number;
};

export default class SelectionAssignVisitor extends NodeVisitor {
    protected _selectionMode = SelectionMode.POLY_LIST;
    private elements = new Map<number, SelectionElement>();
    private nextId = 0;

    set selectionMode(mode: SelectionMode) {
        this._selectionMode = mode;
        this.clear();
    }

    get selectionMode(): SelectionMode {
        return this._selectionMode;
    }

    clear(): void {
        this.nextId = 0;
        this.elements.clear();
    }

    getNextColor(): Color {
        const id = ++this.nextId;
        if (id > 0xffffff) throw new Error("No available picking colors");
        return new Color([(id >> 16) / 255, ((id >> 8) & 255) / 255, (id & 255) / 255, 1]);
    }

    findElement(pickedColor: Uint8Array | undefined | null): SelectionElement | null {
        return pickedColor ? this.elements.get(getColorKey(pickedColor)) ?? null : null;
    }

    visit(node: Node): void {
        if (node.drawable) this.assignDrawableColorCodes(node.drawable);
        if (node.drawableInstance) this.assignInstanceColorCodes(node.drawableInstance);
    }

    private assignDrawableColorCodes(drawable: Drawable): void {
        this.assignColorCodes(drawable, index => drawable.items[index].polyList.isSelectable, (index, color) => {
            const { polyList } = drawable.items[index];
            polyList.colorCode = color;
            polyList.selected = false;
        });
    }

    private assignInstanceColorCodes(drawable: DrawableInstance): void {
        this.assignColorCodes(drawable, index => drawable.isSelectable(index), (index, color) => {
            drawable.setColorCode(index, color);
            drawable.setSelected(index, false);
        });
    }

    private assignColorCodes(drawable: Drawable | DrawableInstance, selectable: (index: number) => boolean,
        setColor: (index: number, color: Color) => void): void {
        let color: Color | undefined;
        drawable.items.forEach(({ polyList }, itemIndex) => {
            if (!selectable(itemIndex)) return;
            if (!color || this._selectionMode === SelectionMode.POLY_LIST) color = this.getNextColor();
            setColor(itemIndex, color);
            const id = getColorKey([color.r * 255, color.g * 255, color.b * 255]);
            this.elements.set(id, { polyList, drawable, itemIndex });
        });
    }
}
