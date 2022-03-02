
import Component from "./Component";
import Mat4 from "../math/Mat4";

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
            const trx = item.tranform ? new Mat4(item.transform) : null
            this.addPolyList(pl,mat,trx);
        });
    }

    addPolyList(polyList,material,transform = null) {
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
}
