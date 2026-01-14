
export default class EventBase {
    private _stopPropagation: boolean = false;

    stopPropagation() {
        this._stopPropagation = true;
    }

    get isEventPropagationStopped() { return this._stopPropagation; }
}
