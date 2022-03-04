import { getEventTouches } from "./Canvas";


export const createTouchEvent = (evt,mainLoop) => {
    const touches = getEventTouches(evt,mainLoop);
    return new TouchEvent(touches, evt);
}

export default class TouchEvent extends EventBase  {
    constructor(touches,event) {
        super();
        this.touches = touches;
        this.event = event;
    }
}
