import Node
 from "./Node";
export default class NodeVisitor {
    private _ignoreDisabled: boolean;

    constructor() {
        this._ignoreDisabled = true;
    }

    get ignoreDisabled() { return this._ignoreDisabled; }
    set ignoreDisabled(i) { this._ignoreDisabled = i; }

    visit(node: Node) {}
    didVisit(node: Node) {}
}
