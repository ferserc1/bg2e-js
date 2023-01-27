
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

    addPolyList(polyList,material,transform = Mat4.MakeIdentity(),r) {
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
        const tryload = async (drawablePath) => {
            try {
                const result = await loader.loadDrawable(drawablePath);
                return result;
            }
            catch (err) {

            }
        }

        const drw = await tryload(sceneData.name + '.bg2') || await tryload(sceneData.name + '.vwglb');
        if (!drw) {
            throw new Error(`Drawable.deserialize(): could not load drawable with name ${sceneData.name}`);
        }
        drw.items.forEach(({polyList,material,transform}) => this.addPolyList(polyList,material,transform));
        this.name = drw.name;
    }

    async serialize(sceneData,writer) {
        await super.serialize(sceneData,writer);
        throw new Error("Drawable.serialice() not implemented");
    }

    bindRenderer(renderer) {
        super.bindRenderer(renderer);
        this._items.forEach(item => {
            item.polyListRenderer = renderer.factory.polyList(item.polyList);
            item.materialRenderer = renderer.factory.material(item.material);
        });
    }

    draw(renderQueue,modelMatrix) {
        if (this.ready) {
            this._items.forEach(({transform,polyListRenderer,materialRenderer}) => {
                renderQueue.addPolyList(
                    polyListRenderer,
                    materialRenderer,
                    Mat4.Mult(modelMatrix,transform));
            });
        }
    }
}
