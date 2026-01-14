import { getEventTouches } from "./Canvas";
import EventBase from "./EventBase";

export const createTouchEvent = (evt: any, mainLoop: any): TouchEvent => {
    const touches = getEventTouches(evt,mainLoop.canvas);
    return new TouchEvent(touches, evt);
}

export default class TouchEvent extends EventBase {
    touches: any;
    event: any;

    constructor(touches: any, event: any) {
        super();
        this.touches = touches;
        this.event = event;
    }
}
