
export default class NodeVisitor {
    constructor() {
        this._ignoreDisabled = true;
    }

    get ignoreDisabled() { return this._ignoreDisabled; }
    set ignoreDisabled(i) { this._ignoreDisabled = i; }

    visit(node) {}
    didVisit(node) {}
}
