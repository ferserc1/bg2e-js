
export default class EventBase {
    constructor() {
        this._executeDefault = false;
    }

    get executeDefault() { return this._executeDefault; }
    set executeDefault(d) { this._executeDefault = d; }
}
