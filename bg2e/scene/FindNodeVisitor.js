import NodeVisitor from "./NodeVisitor";

export default class FindNodeVisitor extends NodeVisitor {
    constructor() {
        super();

        this._name;
        this._result = [];
        this._hasComponents = [];
    }

    set name(n) {
        this._name = n;
    }

    get name() {
        return this._name;
    }

    get result() {
        return this._result;
    }

    clear() {
        this._result = [];
    }

    hasComponents(components) {
        if (!Array.isArray(components)) {
            components = [components];
        }
        this._hasComponents = components;
    }

    visit(node) {
        let add = false;
        if (typeof(this._name) === "string") {
            add = this._name === node.name;
        }
        else if (this._name instanceof RegExp) {
            add = this._name.test(node.name);
        }
        else {
            add = true;
        }

        add = add && this._hasComponents.some(compId => node.component(compId));
        if (add) {
            this._result.push(node);
        }
    }
}