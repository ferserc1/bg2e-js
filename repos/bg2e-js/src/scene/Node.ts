import Mat4 from '../math/Mat4';
import ComponentMap from './ComponentMap';
import Component from './Component';
import Renderer from '../render/Renderer';
import Camera from './Camera';

export function bindRenderer(node: Node, renderer: Renderer): void {
    (node as any)._bindedRenderer = renderer;
    node.components.forEach(comp => {
        comp.bindRenderer(renderer);
    });
}

export async function init(node: Node): Promise<void> {
    for (const i in node.components.array) {
        const comp = node.components.array[i];
        if (!(comp as any)._initialized) {
            await comp.init();
            (comp as any)._initialized = true;
        }
    }
    (node as any)._sceneChanged = false;
}

export default class Node {
    private _name: string;
    private _enabled: boolean;
    private _steady: boolean;
    private _components: ComponentMap;
    private _parent: Node | null;
    private _children: Node[];
    private _bindedRenderer?: Renderer;
    private _sceneChanged: boolean = false;

    constructor(name: string = "") {
        this._name = name;
        this._enabled = true;
        this._steady = false;

        this._components = new ComponentMap(this);

        this._parent = null;
        this._children = [];
    }

    get name(): string { return this._name; }
    set name(n: string) { this._name = n; }

    get enabled(): boolean { return this._enabled; }
    set enabled(e: boolean) { this._enabled = e; }

    get steady(): boolean { return this._steady; }
    set steady(s: boolean) { this._steady = s; }

    get components(): ComponentMap { return this._components; }

    get parent(): Node | null { return this._parent; }
    get children(): Node[] { return this._children; }

    clone(cloneChildren: boolean = false): Node {
        const newNode = new Node();
        newNode.assign(this, cloneChildren);
        return newNode;
    }

    assign(other: Node, cloneChildren: boolean = false): void {
        this._name = other.name + "-copy";
        this._enabled = other.enabled;
        this._steady = other.steady;
        this._components.assign(other._components);
        if (cloneChildren) {
            this._children = [];
            other._children.forEach(c => {
                this._children.push(c.clone(cloneChildren));
            });
        }
    }

    destroy(): void {
        this._components.empty();
        this.emptyChildren();
    }

    async deserialize(sceneData: any, loader: any): Promise<void> {
        throw new Error("Node.deserialize() not implemented");
    }

    async serialize(sceneData: any, writer: any): Promise<void> {
        throw new Error("Node.serialice() not implemented");
    }

    addComponent(component: Component): Component {
        this.components.add(component);
        this.setSceneChanged();
        return component;
    }

    component(typeId: string): Component | undefined {
        return this.components.find(typeId);
    }

    removeComponent(component: Component | string): void {
        this.components.remove(component);
        this.setSceneChanged();
    }

    addedToNode(node: Node): void {
        // Override in subclasses if needed
    }

    removedFromNode(node: Node): void {
        // Override in subclasses if needed
    }

    // This attribute returns true if a node or component
    // has been added or removed to this node or any child node
    get sceneChanged(): boolean {
        return this._sceneChanged;
    }

    setSceneChanged(): void {
        this._sceneChanged = true;
        if (this._parent) {
            this._parent.setSceneChanged();
        }
    }

    addChild(node: Node): void {
        if (node._parent) {
            node._parent.removeChild(node);
        }
        node._parent = this;
        this._children.push(node);
        node.addedToNode(this);

        // If this node has been binded to a renderer, we need to bind
        // the same renderer to any node that is added as child
        if (this._bindedRenderer) {
            bindRenderer(node, this._bindedRenderer);
        }

        this.setSceneChanged();
    }

    removeChild(node: Node): void {
        if (node._parent === this) {
            node._parent = null;
            node.removedFromNode(this);
            const index = this._children.indexOf(node);
            if (index !== -1) {
                this._children.splice(index, 1);
                this.setSceneChanged();
            }
            else {
                console.warn(`Scene inconsistency found removing node '${ node.name }' from node '${ this.name }'. The parent node is valid, but the child is not present in the children array.`);
            }
        }
        else {
            throw new Error(`Node.removeChild() - the specified node is not a child of this node.`);
        }
    }

    emptyChildren(): void {
        this._children.forEach(ch => {
            ch._parent = null;
            ch.removedFromNode(this);
        });
        this._children = [];
        this.setSceneChanged();
    }

    haveChild(node: Node): boolean {
        return this._children.indexOf(node) !== -1;
    }

    isAncientOf(node: Node): boolean {
        const isNodeAncient = (node: Node | null, ancient: Node): boolean => {
            if (!node || !ancient) {
                return false;
            }
            else if (node._parent === ancient) {
                return true;
            }
            else {
                return isNodeAncient(node._parent, ancient);
            }
        }
        return isNodeAncient(this, node);
    }

    // Visitor functions
    accept(nodeVisitor: any): void {
        if (!nodeVisitor.ignoreDisabled || this.enabled) {
            nodeVisitor.visit(this);
            this._children.forEach(ch => ch.accept(nodeVisitor));
            nodeVisitor.didVisit(this);
        }
    }

    acceptReverse(nodeVisitor: any): void {
        if (!nodeVisitor.ignoreDisabled || this.enabled) {
            if (this._parent) {
                this._parent.acceptReverse(nodeVisitor);
            }
            nodeVisitor.visit(this);
        }
    }

    async asyncAccept(nodeVisitor: any): Promise<void> {
        if (!nodeVisitor.ignoreDisabled || this.enabled) {
            await nodeVisitor.asyncVisit(this);
            for (const ch in this._children) {
                await this._children[ch].asyncAccept(nodeVisitor);
            }
        }
    }
    
    // Most usual components
    get transform(): Component | undefined {
        return this.component("Transform");
    }

    get lightComponent(): Component | undefined {
        return this.component("Light");
    }

    get drawable(): Component | undefined {
        return this.component("Drawable");
    }

    get camera(): Camera | undefined {
        return this.component("Camera") as Camera;
    }

    frame(delta: number, modelMatrix: Mat4, renderQueue: any): void {
        const willUpdateComponents: Component[] = [];
        const updateComponents: Component[] = [];
        const drawComponents: Component[] = [];
        this._components.forEach(comp => {
            if (comp.requireWillUpdate) {
                willUpdateComponents.push(comp);
            }
            if (comp.requireUpdate) {
                updateComponents.push(comp);
            }
            if (comp.requireDraw) {
                drawComponents.push(comp);
            }
        });

        willUpdateComponents.forEach(comp => (comp as any).willUpdate(delta));
        updateComponents.forEach(comp => (comp as any).update(delta, modelMatrix));
        drawComponents.forEach(comp => (comp as any).draw(renderQueue, modelMatrix));
    }

    keyDown(evt: any): void {
        this._components.forEach(comp => {
            comp.keyDown(evt);
        });
    }
    keyUp(evt: any): void {
        this._components.forEach(comp => {
            comp.keyUp(evt);
        });
    }
    mouseUp(evt: any): void {
        this._components.forEach(comp => {
            comp.mouseUp(evt);
        });
    }
    mouseDown(evt: any): void {
        this._components.forEach(comp => {
            comp.mouseDown(evt);
        });
    }
    mouseMove(evt: any): void {
        this._components.forEach(comp => {
            comp.mouseMove(evt);
        });
    }
    mouseOut(evt: any): void {
        this._components.forEach(comp => {
            comp.mouseOut(evt);
        });
    }
    mouseDrag(evt: any): void {
        this._components.forEach(comp => {
            comp.mouseDrag(evt);
        });
    }
    mouseWheel(evt: any): void {
        this._components.forEach(comp => {
            comp.mouseWheel(evt);
        });
    }
    touchStart(evt: any): void {
        this._components.forEach(comp => {
            comp.touchStart(evt);
        });
    }
    touchMove(evt: any): void {
        this._components.forEach(comp => {
            comp.touchMove(evt);
        });
    }
    touchEnd(evt: any): void {
        this._components.forEach(comp => {
            comp.touchEnd(evt);
        });
    }
}
