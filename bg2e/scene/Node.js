import Mat4 from '../math/Mat4';
import ComponentMap from './ComponentMap';

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
    }

    component(typeId) {
        return this.components.find(typeId);
    }

    addedToNode(node) {

    }

    removedFromNode(node) {

    }

    addChild(node) {
        if (node._parent) {
            node._parent.removeChild(node);
        }
        node._parent = this;
        this._children.push(node);
        node.addedToNode(this);
    }

    removeChild(node) {
        if (node._parent === this) {
            node._parent = null;
            node.removedFromNode(this);
            const index = this._children.indexOf(node);
            if (index !== -1) {
                this._children.splice(index, 1);
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

    frame(delta, modelMatrix, renderQueue) {
        const updateComponents = this._componentMap.filter(comp => comp.requireUpdate);
        const drawComponents = this._componentMap.filter(comp => comp.requireDraw);

        updateComponents.forEach(comp => comp.update(delta, modelMatrix));
        drawComponents.forEach(comp => comp.draw(renderQueue));
    }
}
