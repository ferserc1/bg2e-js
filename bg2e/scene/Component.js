import Renderer from "../render/Renderer";

const g_componentClasses = {}

export const registerComponent = (typeId,componentClass) => {
    g_componentClasses[typeId] = componentClass;
}

export const createComponent = (typeId) => {
    const ComponentClass = g_componentClasses[typeId];
    if (ComponentClass) {
        try {
            const compInstance = new ComponentClass();
            return compInstance;
        }
        catch (err) {
            if (err.code === -1) {
                throw new Error(`Error in component constructor definition. Check the implementation of the '${ typeId }' component constructor. It should call super('typeId') to configure the component type id.`);
            }
        }
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

export default class Component {
    constructor(typeId) {
        this._node = null;
        if (!typeId) {
            const e = new Error("Invalid typeId specified creating component.");
            e.code = -1;
            throw e;
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

    bindRenderer(renderer) {
        if (!renderer instanceof Renderer) {
            throw Error("Component.bindRenderer(): invalid renderer. Object is not instance of render.Renderer");
        }

        this._renderer = renderer;
    }

    async init() {
        
    }

    get ready() {
        return this._renderer !== null;
    }

    get renderer() {
        return this._renderer;
    }

    // Access to brother components
    component(identifier) {
        return this.node.component(identifier);
    }

    get transform() {
        return this.component("Transform");
    }

    get lightComponent() {
        return this.component("Light");
    }

    get drawable() {
        return this.component("Drawable");
    }

    get camera() {
        return this.component("Camera");
    }

    // Life cycle functions and properties
    get requireWillUpdate() { return typeof(this.willUpdate) === "function" }
    get requireUpdate() { return typeof(this.update) === "function" }
    get requireDraw() { return typeof(this.draw) === "function"; }

    // The following functions can be implemented in component classes to complete the 
    // life cycle functions
    // async init() {}
    // willUpdate(delta) {}
    // update(delta,modelMatrix) {}
    // draw(renderQueue,modelMatrix) {}

    // Event callbacks
    keyDown(evt) {}
    keyUp(evt) {}
    mouseUp(evt) {}
    mouseDown(evt) {}
    mouseMove(evt) {}
    mouseOut(evt) {}
    mouseDrag(evt) {}
    mouseWheel(evt) {}
    touchStart(evt) {}
    touchMove(evt) {}
    touchEnd(evt) {}
}

