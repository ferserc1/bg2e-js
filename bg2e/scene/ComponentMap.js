
import Component from "./Component";

function syncArray() {
    this._array = [];
    for (const type in this._obj) {
        const c = this._obj[type];
        this._array.push(c);
    } 
}

export default class ComponentMap {
    constructor(node) {
        this._node = node;
        this._obj = {};
        this._array = [];
    }

    add(comp) {
        const typeId = comp.typeId;
        const existingComp = this._obj[typeId];
        if (existingComp) {
            existingComp._node = null;
            existingComp.removedFromNode(this._node);
        }
        this._obj[typeId] = comp;
        comp._node = this._node;
        comp.addedToNode(this._node);
        syncArray.apply(this);
    }

    remove(compOrType) {
        const typeId = compOrType instanceof Component ? compOrType.typeId : compOrType;
        const existingComp = this._obj[typeId];
        if (existingComp) {
            existingComp._node = null;
            existingComp.removedFromNode(this._node);
            delete this._obj[typeId];
            syncArray.apply(this);
        }
    }

    empty() {
        for (const typeId in this._obj) {
            const comp = this._obj[typeId];
            comp._node = null;
            comp.removedFromNode(this._node);
        }
        this._obj = {};
        this._array = [];
    }

    find(typeId) {
        return this._obj[typeId];
    }

    forEach(cb) {
        return this._array.forEach(cb);
    }

    every(cb) {
        return this._array.every(cb);
    }

    some(cb) {
        return this._array.some(cb);
    }

    map(cb) {
        return this._array.map(cb);
    }

    filter(cb) {
        return this._array.filter(cb);
    }

    clone(parentNode) {
        const result = new Components(parentNode);
        result.assign(this);
        return result;
    }

    // Note: this function clones the components from 'other'
    // instance to this instance.
    // This function doesn't modify this._node reference
    assign(other) {
        this.empty();
        for (const typeId in other._obj) {
            const comp = other._obj[typeId];
            const compClone = comp.clone();
            this._obj[typeId] = compClone;
        }
        syncArray.apply(this);
    }
}