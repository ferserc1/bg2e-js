import NodeVisitor from "./NodeVisitor";
import Node from "./Node";

export default class FindNodeVisitor extends NodeVisitor {
    private _name?: string | RegExp;
    private _result: Node[];
    private _hasComponents: string[];

    constructor() {
        super();

        this._name = undefined;
        this._result = [];
        this._hasComponents = [];
    }

    set name(n: string | RegExp | undefined) {
        this._name = n;
    }

    get name(): string | RegExp | undefined {
        return this._name;
    }

    get result(): Node[] {
        return this._result;
    }

    clear(): void {
        this._result = [];
    }

    hasComponents(components: string | string[]): void {
        if (!Array.isArray(components)) {
            components = [components];
        }
        this._hasComponents = components;
    }

    visit(node: Node): void {
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

        add = add && (
            this._hasComponents.some(compId => node.component(compId)) ||
            this._hasComponents.length == 0
        );
        if (add) {
            this._result.push(node);
        }
    }
}