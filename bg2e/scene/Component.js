
import LifeCycle from "./LifeCycle";

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

export const deserializeComponent = async (sceneData,loader) => {
    const componentInstance = createComponent(sceneData.type);
    await componentInstance.deserialize(sceneData,loader);
    return componentInstance;
}

export default class Component extends LifeCycle {
    constructor(typeId) {
        super();

        this._node = null;
        if (!typeId) {
            throw new Error("Invalid typeId specified creating component");
        }
        this._typeId = typeId;
    }

    get node() { return this._node; }

    get typeId() { return this._typeId; }

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

    async deserialize(sceneData,loader) {
    }

    async serialize(sceneData,writer) {
        sceneData.type = this.typeId;
    }
}

