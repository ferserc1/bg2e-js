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
    DELETE: "Delete"
};

export default class KeyboardEvent extends EventBase {
    static IsSpecialKey(event) {
        return SpecialKey[event.code]!=null;
    }
    
    constructor(key,event) {
        super();
        this.key = key;
        this.event = event;
    }
    
    isSpecialKey() {
        return KeyboardEvent.IsSpecialKey(this.event);
    }
}
