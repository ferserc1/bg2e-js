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

import Component from "./Component";
import Drawable from "./Drawable";
import Color from "../base/Color";
import Mat4 from "../math/Mat4";
import type Renderer from "../render/Renderer";
import type Node from "./Node";

// A component can only be added to one node: adding it to a second node removes it from
// the first one. The Instance component makes it possible to render the same Drawable
// component in several nodes of the scene graph, and therefore in several positions.
//
// The instance draws the polyLists of the source Drawable using the materials and the
// sub mesh transforms of that Drawable, so all the instances of a Drawable share their
// appearance: modifying a material of the source Drawable affects every instance.
//
// The source Drawable does not need to be added to a node of the scene: an "orphan"
// Drawable is perfectly valid. In that case the instance takes care of binding the
// renderer to it, because there is no node in the scene graph that would do it.
export default class Instance extends Component {
    private _name: string;
    private _sourceDrawable: Drawable | null;
    private _selectable: boolean;

    // Selection state of this instance, with one entry per item of the source Drawable.
    // The picking system stores here the color codes and the selection flags, instead of
    // storing them in the PolyList objects, because those objects are shared by all the
    // instances of the same Drawable (see SelectionIdAssignVisitor and PickSelectionShader).
    private _colorCodes: Color[];
    private _selectedItems: boolean[];

    constructor(sourceDrawable?: Drawable, name?: string) {
        super("Instance");
        this._name = name ?? "";
        this._sourceDrawable = null;
        this._selectable = true;
        this._colorCodes = [];
        this._selectedItems = [];
        if (sourceDrawable) {
            this.sourceDrawable = sourceDrawable;
        }
    }

    get name(): string {
        return this._name;
    }

    set name(n: string) {
        this._name = n;
    }

    get sourceDrawable(): Drawable | null {
        return this._sourceDrawable;
    }

    set sourceDrawable(drawable: Drawable | null) {
        if (drawable !== null && !(drawable instanceof Drawable)) {
            throw new Error("Instance.sourceDrawable: the specified object is not an instance of Drawable");
        }
        const node: Node | null = this.node;
        if (drawable && node && drawable.node === node) {
            console.warn(`Instance component in node '${ node.name }' references the Drawable component of its own node. The drawable will be rendered twice with the same transform.`);
        }
        this._sourceDrawable = drawable;
        this._colorCodes = [];
        this._selectedItems = [];
        this.bindSourceDrawable();
    }

    get valid(): boolean {
        return this._sourceDrawable !== null && this._sourceDrawable.valid;
    }

    // Selection API. It mirrors the PolyList selection API, but the state is stored per
    // instance and per item of the source drawable, so each instance can be picked and
    // highlighted separately even if all of them share the same polyLists.
    get selectable(): boolean {
        return this._selectable;
    }

    set selectable(s: boolean) {
        this._selectable = s;
        if (!s) {
            this.clearSelection();
        }
    }

    makeSelectable(selectable: boolean = true): void {
        this.selectable = selectable;
    }

    get itemCount(): number {
        return this._sourceDrawable?.items.length ?? 0;
    }

    colorCode(index: number): Color {
        this.updateItemStateSize();
        return this._colorCodes[index] ?? Color.Black();
    }

    setColorCode(index: number, color: Color): void {
        this.updateItemStateSize();
        if (index >= 0 && index < this._colorCodes.length) {
            this._colorCodes[index] = color;
        }
    }

    isSelected(index: number): boolean {
        this.updateItemStateSize();
        return this._selectedItems[index] ?? false;
    }

    setSelected(index: number, selected: boolean): void {
        this.updateItemStateSize();
        if (index >= 0 && index < this._selectedItems.length) {
            this._selectedItems[index] = selected;
        }
    }

    get isAnySelected(): boolean {
        return this._selectedItems.some(s => s);
    }

    selectAll(): void {
        this.updateItemStateSize();
        this._selectedItems = this._selectedItems.map(() => true);
    }

    clearSelection(): void {
        this.updateItemStateSize();
        this._selectedItems = this._selectedItems.map(() => false);
    }

    clone(): Instance {
        const result = new Instance();
        result.assign(this);
        return result;
    }

    // Note: the clone shares the source drawable with this instance. This is the purpose
    // of this component: a Drawable rendered from several places of the scene graph.
    assign(other: Instance): void {
        this._name = other._name;
        this._selectable = other._selectable;
        this.sourceDrawable = other._sourceDrawable;
    }

    destroy(): void {
        // The source drawable is only referenced by this component, so it must not be
        // destroyed here: it may be in use by the scene or by other instances.
        this._sourceDrawable = null;
        this._colorCodes = [];
        this._selectedItems = [];
    }

    addedToNode(node: Node): void {
        if (this._sourceDrawable && this._sourceDrawable.node === node) {
            console.warn(`Instance component added to node '${ node.name }', that contains the Drawable component referenced by the instance. The drawable will be rendered twice with the same transform.`);
        }

        // Node.addComponent() does not bind the renderer to the new component, so an
        // instance added to a node that is already part of an initialized scene would
        // never be bound. Do it here, using the renderer bound to the node.
        if (!this._renderer && node.bindedRenderer) {
            this.bindRenderer(node.bindedRenderer);
        }
    }

    bindRenderer(renderer: Renderer): void {
        super.bindRenderer(renderer);
        this.bindSourceDrawable();
    }

    async init(): Promise<void> {
        // If the source drawable is not part of an initialized scene, no node will call its
        // init() function, so the instance does it. The _initialized flag is the same one
        // used by the scene node initialization (see Node.init), so the drawable will not
        // be initialized twice if its node is added to the scene later.
        const drawable = this._sourceDrawable;
        if (!drawable || (drawable as any)._initialized) {
            return;
        }
        const drawableNode: Node | null = drawable.node;
        if (!drawableNode || !drawableNode.bindedRenderer) {
            await drawable.init();
            (drawable as any)._initialized = true;
        }
    }

    draw(renderQueue: any, modelMatrix: Mat4): void {
        const drawable = this._sourceDrawable;
        if (!this.ready || !drawable) {
            return;
        }

        if (!drawable.ready) {
            this.bindSourceDrawable();
            if (!drawable.ready) {
                return;
            }
        }

        this.updateItemStateSize();

        // The items are added to the render queue here, instead of using Drawable.draw(),
        // because each draw call needs the selection state of this instance.
        drawable.items.forEach((item, index) => {
            if (!item.polyListRenderer || !item.materialRenderer) {
                return;
            }
            renderQueue.addPolyList(
                item.polyListRenderer,
                item.materialRenderer,
                Mat4.Mult(item.transform, modelMatrix),
                {
                    colorCode: this._colorCodes[index],
                    selected: this._selectedItems[index]
                });
        });
    }

    async deserialize(sceneData: any, loader: any): Promise<void> {
        // An Instance references a Drawable component that may not be part of the scene,
        // so there is no way to resolve the reference at load time yet.
        console.warn("Instance.deserialize() is not implemented: the instance will be empty. Set the sourceDrawable property to complete the component.");
    }

    async serialize(sceneData: any, writer: any): Promise<void> {
        await super.serialize(sceneData, writer);
        throw new Error("Instance.serialize() not implemented");
    }

    // Binds the renderer to the source drawable, if it hasn't been bound yet. This is
    // needed when the source drawable is not present in the scene graph, because in that
    // case no node will bind the renderer to it.
    // It is safe to call this function even if the drawable is (or will be) part of the
    // scene: the polyList and material renderer factories return the renderer objects
    // already created for a polyList or a material, so no duplicated graphic API
    // resources are created.
    protected bindSourceDrawable(): void {
        if (this._renderer && this._sourceDrawable && !this._sourceDrawable.ready) {
            this._sourceDrawable.bindRenderer(this._renderer);
        }
    }

    // Keeps the per item selection state arrays in sync with the source drawable, that
    // may change its items after the instance has been created.
    protected updateItemStateSize(): void {
        const itemCount = this.itemCount;
        while (this._colorCodes.length < itemCount) {
            this._colorCodes.push(Color.Black());
            this._selectedItems.push(false);
        }
        if (this._colorCodes.length > itemCount) {
            this._colorCodes.length = itemCount;
            this._selectedItems.length = itemCount;
        }
    }
}
