
import Component from "./Component";
import Mat4 from "../math/Mat4";
import PolyList from "../base/PolyList";
import Material from "../base/Material";

export default class Drawable extends Component {
    constructor(name) {
        super("Drawable");
        this._name = name || "";
        this._items = [];
    }

    get name() {
        return this._name;
    }

    set name(n) {
        this._name = n;
    }

    get valid() {
        return this._items.length>0 && this._items.every(item => item.polyList !== null && item.material !== null);
    }

    get items() {
        return this._items;
    }

    clone() {
        const result = new Drawable();
        result.assign(this);
        return result;
    }

    assign(other) {
        this.destroy();
        this._name = other._name;
        this._items = [];
        other._items.forEach(item => {
            const pl = item.polyList.clone();
            const mat = item.material.clone();
            const trx = new Mat4(item.transform);
            this.addPolyList(pl,mat,trx);
        });
    }

    addPolyList(polyList,material,transform = Mat4.MakeIdentity()) {
        if (!polyList instanceof PolyList) {
            throw new Error("Error adding polyList to drawable object: polyList is not an instance of PolyList");
        }
        if (!material instanceof Material) {
            throw new Error("Error adding polyList to drawable object: material is not an instance of Material");
        }
        if (!transform instanceof Mat4) {
            throw new Error("Error adding polyList to drawable object: transform is not an instance of Mat4");
        }
        this._items.push({ polyList, material, transform });
    }

    removePolyList(plist) {
        this._items = this._items.filter(item => item.polyList != plist);
    }

    destroy() {

    }

    addedToNode(node) {

    }

    removedFromNode(node) {

    }

    async deserialize(sceneData,loader) {
        throw new Error("Drawable.deserialize() not implemented");
    }

    async serialize(sceneData,writer) {
        await super.serialize(sceneData,writer);
        throw new Error("Drawable.serialice() not implemented");
    }

    draw(renderQueue,modelMatrix) {
        const { renderer } = renderQueue;
        this._items.forEach(({polyList,material,transform}) => {
            renderQueue.addPolyList(
                renderer.factory.polyList(polyList),
                renderer.factory.material(material),
                Mat4.Mult(modelMatrix,transform));
        });
    }
}
