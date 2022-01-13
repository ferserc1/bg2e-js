import EventBase from "./EventBase";

export default class TouchEvent extends EventBase  {
    constructor(touches,event) {
        super();
        this.touches = touches;
        this.event = event;
    }
}
