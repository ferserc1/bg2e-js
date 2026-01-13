
import Component from "./Component";

interface ComponentObject {
    [typeId: string]: Component;
}

export default class ComponentMap {
    private _node: any;
    private _obj: ComponentObject;
    private _array: Component[];

    private syncArray(): void {
        this._array = [];
        for (const type in this._obj) {
            const c = this._obj[type];
            this._array.push(c);
        } 
    }

    constructor(node: any) {
        this._node = node;
        this._obj = {};
        this._array = [];
    }

    get array(): Component[] {
        return this._array;
    }

    add(comp: Component): void {
        const typeId = comp.typeId;
        const existingComp = this._obj[typeId];
        if (existingComp) {
            (existingComp as any)._node = null;
            existingComp.removedFromNode(this._node);
        }
        this._obj[typeId] = comp;
        (comp as any)._node = this._node;
        comp.addedToNode(this._node);
        this.syncArray();
    }

    remove(compOrType: Component | string): void {
        const typeId = compOrType instanceof Component ? compOrType.typeId : compOrType;
        const existingComp = this._obj[typeId];
        if (existingComp) {
            (existingComp as any)._node = null;
            existingComp.removedFromNode(this._node);
            delete this._obj[typeId];
            this.syncArray();
        }
    }

    empty(): void {
        for (const typeId in this._obj) {
            const comp = this._obj[typeId];
            (comp as any)._node = null;
            comp.removedFromNode(this._node);
        }
        this._obj = {};
        this._array = [];
    }

    find(typeId: string): Component | undefined {
        return this._obj[typeId];
    }

    forEach(cb: (component: Component, index: number, array: Component[]) => void): void {
        return this._array.forEach(cb);
    }

    every(cb: (component: Component, index: number, array: Component[]) => boolean): boolean {
        return this._array.every(cb);
    }

    some(cb: (component: Component, index: number, array: Component[]) => boolean): boolean {
        return this._array.some(cb);
    }

    map<T>(cb: (component: Component, index: number, array: Component[]) => T): T[] {
        return this._array.map(cb);
    }

    filter(cb: (component: Component, index: number, array: Component[]) => boolean): Component[] {
        return this._array.filter(cb);
    }

    clone(parentNode: any): ComponentMap {
        const result = new ComponentMap(parentNode);
        result.assign(this);
        return result;
    }

    // Note: this function clones the components from 'other'
    // instance to this instance.
    // This function doesn't modify this._node reference
    assign(other: ComponentMap): void {
        this.empty();
        for (const typeId in other._obj) {
            const comp = other._obj[typeId];
            const compClone = comp.clone();
            this._obj[typeId] = compClone;
        }
        this.syncArray();
    }
}