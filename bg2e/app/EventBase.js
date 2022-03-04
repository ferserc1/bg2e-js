
export default class EventBase {
    stopPropagation() {
        this._stopPropagation = true;
    }

    get isEventPropagationStopped() { return this._stopPropagation; }
}
