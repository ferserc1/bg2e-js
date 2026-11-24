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
import Mat4 from "../math/Mat4";
import PolyList from "../base/PolyList";
import Material from "../base/Material";
import Renderer from "../render/Renderer";
import type Loader from "../db/Loader";
import type { DrawableResource, DrawableResourceLease } from "../db/DrawableCache";
import { getExtension, getFileName, removeExtension } from "../tools/Resource";

interface DrawableItem {
    polyList: PolyList;
    material: Material;
    transform: Mat4;
    polyListRenderer?: any; // PolyListRenderer
    materialRenderer?: any; // MaterialRenderer
}

interface DrawableSceneData {
    name?: unknown;
    path?: unknown;
    resourceName?: unknown;
    [key: string]: unknown;
}

export default class Drawable extends Component {
    private _name: string;
    private _items: DrawableItem[];
    private resourceLease?: DrawableResourceLease;
    private resourceVersion = 0;
    constructor(name?: string, typeId = "Drawable") {
        super(typeId);
        this._name = name || "";
        this._items = [];
    }

    get name(): string {
        return this._name;
    }

    set name(n: string) {
        this._name = n;
    }

    get valid(): boolean {
        return this._items.length>0 && this._items.every(item => item.polyList !== null && item.material !== null);
    }

    get items(): DrawableItem[] {
        return this._items;
    }

    clone(): Drawable {
        const result = new Drawable();
        result.assign(this);
        return result;
    }

    assign(other: Drawable): void {
        if (other === this) return;
        this.destroy();
        this.priority = other.priority;
        this._name = other._name;
        this._items = [];
        other._items.forEach(item => {
            const pl = item.polyList.clone();
            const mat = item.material.clone();
            const trx = new Mat4(item.transform);
            this.addPolyList(pl,mat,trx);
        });
    }

    addPolyList(polyList: PolyList, material: Material, transform: Mat4 = Mat4.MakeIdentity()): void {
        if (!(polyList instanceof PolyList)) {
            throw new Error("Error adding polyList to drawable object: polyList is not an instance of PolyList");
        }
        if (!(material instanceof Material)) {
            throw new Error("Error adding polyList to drawable object: material is not an instance of Material");
        }
        if (!(transform instanceof Mat4)) {
            throw new Error("Error adding polyList to drawable object: transform is not an instance of Mat4");
        }
        this._items.push({ polyList, material, transform });
        polyList.mainDrawable = this;
    }

    removePolyList(plist: PolyList): void {
        const removed = this._items.filter(item => item.polyList === plist);
        this._items = this._items.filter(item => item.polyList != plist);
        if (plist.mainDrawable === this) {
            plist.mainDrawable = undefined;
        }
        if (this.resourceLease && removed.length) {
            plist.destroy();
            for (const material of new Set(removed.map(item => item.material))) {
                if (!this._items.some(item => item.material === material)) material.destroy(true);
            }
        }
    }

    destroy(): void {
        this.releaseResource();
    }

    get resource(): DrawableResource | undefined {
        return this.resourceLease?.resource;
    }

    /** Bind an editable owner to an independent copy of a cached model. */
    bindResource(resource: DrawableResource): void {
        const lease = resource.retain();
        const items: DrawableItem[] = [];
        const renderer = this.renderer;
        try {
            for (let index = 0; index < resource.submeshCount; index++) {
                const polyList = new PolyList();
                polyList.assign(lease.geometry(index));
                const { name, groupName, visible, material, transform } = lease.createAppearance(index);
                Object.assign(polyList, { name, groupName, visible, mainDrawable: this });
                const item: DrawableItem = { polyList, material, transform };
                items.push(item);
                if (renderer) {
                    item.polyListRenderer = renderer.factory.polyList(polyList);
                    item.materialRenderer = renderer.factory.material(material);
                }
            }
        }
        catch (error) {
            try {
                this.destroyResourceItems(items);
            }
            finally {
                lease.release();
            }
            throw error;
        }

        this.releaseResource();
        this.resourceLease = lease;
        this._items = items;
        this.name = resource.name;
    }

    releaseResource(): void {
        this.resourceVersion++;
        if (!this.resourceLease) return;
        const lease = this.resourceLease;
        this.resourceLease = undefined;
        const items = this._items;
        this._items = [];
        try {
            this.destroyResourceItems(items);
        }
        finally {
            lease.release();
        }
    }

    private destroyResourceItems(items: DrawableItem[]): void {
        for (const polyList of new Set(items.map(item => item.polyList))) {
            if (polyList.mainDrawable === this) polyList.mainDrawable = undefined;
            polyList.destroy();
        }
        for (const material of new Set(items.map(item => item.material))) material.destroy(true);
    }

    addedToNode(node: any): void {

    }

    removedFromNode(node: any): void {

    }

    makeSelectable(selectable: boolean = true): void {
        this._items.forEach(({polyList}) => {
            polyList.selectable = selectable;
        })
    }

    async deserialize(sceneData: DrawableSceneData, loader: Loader): Promise<void> {
        const version = ++this.resourceVersion;
        await super.deserialize(sceneData, loader);
        let drawablePath: string;
        if (typeof sceneData.path === "string") {
            if (!sceneData.path) throw new Error("Drawable source path cannot be empty");
            drawablePath = sceneData.path;
        }
        else {
            if (typeof sceneData.name !== "string" || !sceneData.name) {
                throw new Error("Drawable requires a path or a nonempty legacy name");
            }
            const path = sceneData.name.split(/[?#]/, 1)[0];
            const suffix = sceneData.name.slice(path.length);
            drawablePath = `${removeExtension(path)}.bg2${suffix}`;
        }
        if (loader.drawableCache && getExtension(drawablePath).toLowerCase() === "bg2") {
            const resource = await loader.drawableCache.loadBg2(drawablePath, loader);
            if (version !== this.resourceVersion) return;
            this.bindResource(resource);
        }
        else {
            const drw: Drawable = await loader.loadDrawable(drawablePath);
            if (version !== this.resourceVersion) return;
            this.releaseResource();
            drw.items.forEach(({polyList,material,transform}) => this.addPolyList(polyList,material,transform));
        }
        this.name = typeof sceneData.resourceName === "string" ? sceneData.resourceName : removeExtension(getFileName(drawablePath));
    }

    async serialize(sceneData: DrawableSceneData, writer: any): Promise<void> {
        await super.serialize(sceneData,writer);
        throw new Error("Drawable.serialice() not implemented");
    }

    bindRenderer(renderer: Renderer): void {
        super.bindRenderer(renderer);
        this._items.forEach(item => {
            item.polyListRenderer = renderer.factory.polyList(item.polyList);
            item.materialRenderer = renderer.factory.material(item.material);
        });
    }

    draw(renderQueue: any, modelMatrix: Mat4): void {
        if (this.ready) {
            this._items.forEach(({transform,polyListRenderer,materialRenderer}) => {
                renderQueue.addPolyList(
                    polyListRenderer,
                    materialRenderer,
                    Mat4.Mult(transform, modelMatrix));
            });
        }
    }
}
