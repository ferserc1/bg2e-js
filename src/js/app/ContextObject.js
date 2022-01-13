export default class ContextObject {
    constructor(context) {
        this._context = context;
    }
    
    get context() { return this._context; }
    set context(c) { this._context = c; }
}
