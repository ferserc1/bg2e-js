import { getMouseEventOffset } from "./Canvas";
import EventBase from "./EventBase";

export const MouseButton = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2,
    NONE: -1
};

export const MouseButtonEventType = {
    NONE: 0,
    UP: 1,
    DOWN: 2
};

export const createMouseEvent = (evt,mainLoop,buttonType) => {
    mainLoop.mouseStatus.pos = getMouseEventOffset(evt, mainLoop.canvas);
    if (buttonType !== MouseButtonEventType.NONE) {
        const buttonStatus = buttonType === MouseButtonEventType.DOWN;
        if (evt.button === MouseButton.LEFT) {
            mainLoop.mouseStatus.leftButton = buttonStatus;
        }
        else if (evt.button === MouseButton.MIDDLE) {
            mainLoop.mouseStatus.middleButton = buttonStatus;
        }
        else if (evt.button === MouseButton.RIGHT) {
            mainLoop.mouseStatus.rightButton = buttonStatus;
        }
    }

    return new MouseEvent(evt.button, mainLoop.mouseStatus.pos.x, mainLoop.mouseStatus.pos.y, 0, evt);
}

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
