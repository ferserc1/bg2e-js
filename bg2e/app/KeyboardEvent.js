import EventBase from "./EventBase";

export const SpecialKey = {
    BACKSPACE: "Backspace",
    TAB: "Tab",
    ENTER: "Enter",
    SHIFT: "Shift",
    SHIFT_LEFT: "ShiftLeft",
    SHIFT_RIGHT: "ShiftRight",
    CTRL: "Control",
    CTRL_LEFT: "ControlLeft",
    CTRL_LEFT: "ControlRight",
    ALT: "Alt",
    ALT_LEFT: "AltLeft",
    ALT_RIGHT: "AltRight",
    PAUSE: "Pause",
    CAPS_LOCK: "CapsLock",
    ESCAPE: "Escape",
    PAGE_UP: "PageUp",
    PAGEDOWN: "PageDown",
    END: "End",
    HOME: "Home",
    LEFT_ARROW: "ArrowLeft",
    UP_ARROW: "ArrowUp",
    RIGHT_ARROW: "ArrowRight",
    DOWN_ARROW: "ArrowDown",
    INSERT: "Insert",
    DELETE: "Delete",
    SPACE: "Space"
};

export const createKeyboardEvent = (evt) => {
    const code = SpecialKey[evt.code] != null ? evt.keyCode : evt.code;
    return new KeyboardEvent(code, evt);
}

export default class KeyboardEvent extends EventBase {
    static IsSpecialKey(event) {
        return SpecialKey[event.code]!=null;
    }
    
    constructor(key,event) {
        super();
        this.key = key;
        this.event = event;
    }
    
    get isSpecialKey() {
        return KeyboardEvent.IsSpecialKey(this.event);
    }
}
