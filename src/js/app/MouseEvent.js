import EventBase from "./EventBase";

export const MouseButton = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2,
    NONE: -1
};

export default class MouseEvent extends EventBase {
		
    constructor(button = MouseButton.NONE, x=-1, y=-1, delta=0,event=null) {
        super();

        this.button = button;
        this.x = x;
        this.y = y;
        this.delta = delta;
        this.event = event;
    }
}
