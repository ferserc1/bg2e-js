

const g_componentClasses = {}

export const registerComponent = (typeId,componentClass) => {
    g_componentClasses[typeId] = componentClass;
}

export const createComponent = (typeId) => {
    const ComponentClass = g_componentClasses[typeId];
    if (ComponentClass) {
        return new ComponentClass();
    }
    else {
        throw new Error(`Could not instantiate component: No component found with type id='${typeId}'`)
    }
}

export default class Component {
    constructor() {
        this._node = null;
    }

    get node() { return this._node; }

    clone() {
        throw new Error("Component.clone() not implemented");
    }

    assign(other) {
        throw new Error("Component.assign() not implemented");
    }

    destroy() {

    }

    addedToNode(node) {

    }

    removedFromNode(node) {

    }

    async deserialize(sceneData) {
        throw new Error("Component.deserialize() not implemented");
    }

    async serialize(sceneData) {
        throw new Error("Component.serialice() not implemented");
    }
}

