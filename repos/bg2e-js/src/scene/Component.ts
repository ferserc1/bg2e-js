import Renderer from "../render/Renderer";
import Camera from "./Camera";
import Drawable from "./Drawable";
import LightComponent from "./LightComponent";
import Node from "./Node";
import Transform from "./Transform";

// Type definitions
type ComponentConstructor<T extends Component = Component> = new () => T;

interface ComponentRegistry {
    [typeId: string]: ComponentConstructor;
}

const g_componentClasses: ComponentRegistry = {};

export const registerComponent = <T extends Component>(
    typeId: string,
    componentClass: ComponentConstructor<T>
): void => {
    g_componentClasses[typeId] = componentClass;
};

export const createComponent = (typeId: string): Component | null => {
    const ComponentClass = g_componentClasses[typeId];
    if (ComponentClass) {
        try {
            const compInstance = new ComponentClass();
            return compInstance;
        }
        catch (err: any) {
            if (err.code === -1) {
                throw new Error(`Error in component constructor definition. Check the implementation of the '${ typeId }' component constructor. It should call super('typeId') to configure the component type id.`);
            }
        }
    }
    else {
        console.debug(`Ignoring component with type id='${typeId}'. If this is not expected, check if the component is registered in the component factory.`);
        return null;
    }
    return null;
};

export const deserializeComponent = async (sceneData: any, loader: any): Promise<Component | null> => {
    const componentInstance = createComponent(sceneData.type);
    if (!componentInstance) {
        return null;
    }
    
    await componentInstance.deserialize(sceneData, loader);
    return componentInstance;
};

export default class Component {
    private _node: any = null;
    private _typeId: string;
    protected _renderer: Renderer | null = null;

    constructor(typeId: string) {
        if (!typeId) {
            const e: any = new Error("Invalid typeId specified creating component.");
            e.code = -1;
            throw e;
        }
        this._typeId = typeId;
    }

    get node(): Node { return this._node; }

    get typeId(): string { return this._typeId; }

    clone(): Component {
        throw new Error("Component.clone() not implemented");
    }

    assign(other: Component): void {
        throw new Error("Component.assign() not implemented");
    }

    destroy(): void {
        // Override in subclasses if needed
    }

    addedToNode(node: any): void {
        // Override in subclasses if needed
    }

    removedFromNode(node: any): void {
        // Override in subclasses if needed
    }

    async deserialize(sceneData: any, loader: any): Promise<void> {
        // Override in subclasses if needed
    }

    async serialize(sceneData: any, writer: any): Promise<void> {
        sceneData.type = this.typeId;
    }

    bindRenderer(renderer: Renderer): void {
        if (!(renderer instanceof Renderer)) {
            throw Error("Component.bindRenderer(): invalid renderer. Object is not instance of render.Renderer");
        }

        this._renderer = renderer;
    }

    async init(): Promise<void> {
        // Override in subclasses if needed
    }

    get ready(): boolean {
        return this._renderer !== null;
    }

    get renderer(): Renderer | null {
        return this._renderer;
    }

    // Access to brother components
    component(identifier: string): Component | undefined {
        return this.node.component(identifier);
    }

    get transform(): Transform | undefined {
        return this.component("Transform") as Transform;
    }

    get lightComponent(): LightComponent | undefined {
        return this.component("Light") as LightComponent;
    }

    get drawable(): Drawable | undefined {
        return this.component("Drawable") as Drawable;
    }

    get camera(): Camera | undefined {
        return this.component("Camera") as Camera;
    }

    // Life cycle functions and properties
    get requireWillUpdate(): boolean { 
        return typeof((this as any).willUpdate) === "function";
    }
    
    get requireUpdate(): boolean { 
        return typeof((this as any).update) === "function";
    }
    
    get requireDraw(): boolean { 
        return typeof((this as any).draw) === "function";
    }

    // The following functions can be implemented in component classes to complete the 
    // life cycle functions
    // async init(): Promise<void> {}
    // willUpdate(delta: number): void {}
    // update(delta: number, modelMatrix: any): void {}
    // draw(renderQueue: any, modelMatrix: any): void {}

    // Event callbacks
    keyDown(evt: any): void {}
    keyUp(evt: any): void {}
    mouseUp(evt: any): void {}
    mouseDown(evt: any): void {}
    mouseMove(evt: any): void {}
    mouseOut(evt: any): void {}
    mouseDrag(evt: any): void {}
    mouseWheel(evt: any): void {}
    touchStart(evt: any): void {}
    touchMove(evt: any): void {}
    touchEnd(evt: any): void {}
}
