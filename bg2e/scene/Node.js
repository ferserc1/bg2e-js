import Mat4 from '../math/Mat4';
import ComponentMap from './ComponentMap';

export function bindRenderer(node, renderer) {
    node._bindedRenderer = renderer;
    node.components.forEach(comp => {
        comp.bindRenderer(renderer);
    });
}

export async function init(node) {
    for (const i in node.components.array) {
        const comp = node.components.array[i];
        if (!comp._initialized) {
            await comp.init();
            comp._initialized = true;
        }
    }
    node._sceneChanged = false;
}

export default class Node {
    constructor(name = "") {
        this._name = name;
        this._enabled = true;
        this._steady = false;

        this._components = new ComponentMap(this);

        this._parent = null;
        this._children = [];
    }

    get name() { return this._name; }
    set name(n) { this._name = n; }

    get enabled() { return this._enabled; }
    set enabled(e) { this._enabled = e; }

    get steady() { return this._steady; }
    set steady(s) { this._steady = s; }

    get components() { return this._components; }

    get parent() { return this._parent; }
    get children() { return this._children; }

    clone(cloneChildren=false) {
        const newNode = new Node();
        newNode.assign(this,cloneChildren);
        return newNode;
    }

    assign(other,cloneChildren=false) {
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

    destroy() {
        this._components.empty();
        this.emptyChildren();
    }

    async deserialize(sceneData,loader) {
        throw new Error("Node.deserialize() not implemented");
    }

    async serialize(sceneData,writer) {
        throw new Error("Node.serialice() not implemented");
    }

    addComponent(component) {
        this.components.add(component);
        this.setSceneChanged();
    }

    component(typeId) {
        return this.components.find(typeId);
    }

    addedToNode(node) {

    }

    removedFromNode(node) {

    }

    // This attribute returns true if a node or component
    // has been added or removed to this node or any child node
    get sceneChanged() {
        return this._sceneChanged;
    }

    setSceneChanged() {
        this._sceneChanged = true;
        if (this._parent) {
            this._parent.setSceneChanged();
        }
    }

    addChild(node) {
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

    removeChild(node) {
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

    emptyChildren() {
        this._children.forEach(ch => {
            ch._parent = null;
            ch.removedFromNode(this);
        });
        this._children = [];
        this.setSceneChanged();
    }

    haveChild(node) {
        return this._children.indexOf(node) !== -1;
    }

    isAncientOf(node) {
        const isNodeAncient = (node, ancient) => {
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
        isNodeAncient(this,node);
    }

    // Visitor functions
    accept(nodeVisitor) {
        if (!nodeVisitor.ignoreDisabled || this.enabled) {
            nodeVisitor.visit(this);
            this._children.forEach(ch => ch.accept(nodeVisitor));
            nodeVisitor.didVisit(this);
        }
    }

    acceptReverse(nodeVisitor) {
        if (!nodeVisitor.ignoreDisabled || this.enabled) {
            if (this._parent) {
                this._parent.acceptReverse(nodeVisitor);
            }
            nodeVisitor.visit(this);
        }
    }

    async asyncAccept(nodeVisitor) {
        if (!nodeVisitor.ignoreDisabled || this.enabled) {
            await nodeVisitor.asyncVisit(this);
            for (const ch in this._children) {
                await this._children[ch].asyncAccept(nodeVisitor);
            }
        }
    }
    
    // Most usual components
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

    frame(delta, modelMatrix, renderQueue) {
        const willUpdateComponents = [];
        const updateComponents = [];
        const drawComponents = [];
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
        })

        willUpdateComponents.forEach(comp => comp.willUpdate(delta));
        updateComponents.forEach(comp => comp.update(delta, modelMatrix));
        drawComponents.forEach(comp => comp.draw(renderQueue, modelMatrix));
    }

    keyDown(evt) {
        this._components.forEach(comp => {
            comp.keyDown(evt);
        })
    }
    keyUp(evt) {
        this._components.forEach(comp => {
            comp.keyUp(evt);
        })
    }
    mouseUp(evt) {
        this._components.forEach(comp => {
            comp.mouseUp(evt);
        })
    }
    mouseDown(evt) {
        this._components.forEach(comp => {
            comp.mouseDown(evt);
        })
    }
    mouseMove(evt) {
        this._components.forEach(comp => {
            comp.mouseMove(evt);
        })
    }
    mouseOut(evt) {
        this._components.forEach(comp => {
            comp.mouseOut(evt);
        })
    }
    mouseDrag(evt) {
        this._components.forEach(comp => {
            comp.mouseDrag(evt);
        })
    }
    mouseWheel(evt) {
        this._components.forEach(comp => {
            comp.mouseWheel(evt);
        })
    }
    touchStart(evt) {
        this._components.forEach(comp => {
            comp.touchStart(evt);
        })
    }
    touchMove(evt) {
        this._components.forEach(comp => {
            comp.touchMove(evt);
        })
    }
    touchEnd(evt) {
        this._components.forEach(comp => {
            comp.touchEnd(evt);
        })
    }
}
