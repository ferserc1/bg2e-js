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

const g_mouseButtons = [false,false,false];
export const leftMouseButton = () => {
    return g_mouseButtons[0];
}

export const middleMouseButton = () => {
    return g_mouseButtons[1];
}

export const rightMouseButton = () => {
    return g_mouseButtons[2];
}

export const clearMouseButtons = () => {
    g_mouseButtons[0] = false;
    g_mouseButtons[1] = false;
    g_mouseButtons[2] = false;
}

export const setMouseButton = (event, status) => {
    switch (event.button) {
    case MouseButton.LEFT:
        g_mouseButtons[0] = status;
        break;
    case MouseButton.MIDDLE:
        g_mouseButtons[1] = status;
        break;
    case MouseButton.RIGHT:
        g_mouseButtons[2] = status;
        break;
    }
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
