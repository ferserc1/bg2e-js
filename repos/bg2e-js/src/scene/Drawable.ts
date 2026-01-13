
import Component from "./Component";
import Mat4 from "../math/Mat4";
import PolyList from "../base/PolyList";
import Material from "../base/Material";
import VitscnjLoaderPlugin, { DrawableFormat } from "../db/VitscnjLoaderPlugin";
import Renderer from "../render/Renderer";

interface DrawableItem {
    polyList: PolyList;
    material: Material;
    transform: Mat4;
    polyListRenderer?: any; // PolyListRenderer
    materialRenderer?: any; // MaterialRenderer
}

interface DrawableSceneData {
    name: string;
    [key: string]: unknown;
}

interface LoadedDrawable {
    name: string;
    items: DrawableItem[];
}

export default class Drawable extends Component {
    private _name: string;
    private _items: DrawableItem[];
    constructor(name?: string) {
        super("Drawable");
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
    }

    removePolyList(plist: PolyList): void {
        this._items = this._items.filter(item => item.polyList != plist);
    }

    destroy(): void {

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

    async deserialize(sceneData: DrawableSceneData, loader: any): Promise<void> {
        const tryload = async (drawablePath: string): Promise<LoadedDrawable | null> => {
            try {
                const result = await loader.loadDrawable(drawablePath);
                return result;
            }
            catch (err: any) {
                if (!/not found/i.test(err.message)) {
                    console.error(err);
                }
                return null;
            }
        }

        const drwFormat = VitscnjLoaderPlugin.PreferredDrawableFormat();
        const drw = drwFormat === DrawableFormat.BG2
            ? (await tryload(sceneData.name + '.bg2') || await tryload(sceneData.name + '.vwglb'))
            :   (await tryload(sceneData.name + '.vwglb') || await tryload(sceneData.name + '.bg2'));

        if (!drw) {
            throw new Error(`Drawable.deserialize(): could not load drawable with name ${sceneData.name}`);
        }
        drw.items.forEach(({polyList,material,transform}) => this.addPolyList(polyList,material,transform));
        this.name = drw.name;
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
