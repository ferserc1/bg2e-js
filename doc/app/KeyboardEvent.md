# KeyboardEvent

Saves the data of a keyboard type event.

- `key`: contains the key code (if it is a special key) or the character corresponding to the key pressed.
- `isSpecialKey` (read) returns `true` if the pressed key is a special key.

Special keys are defined in the `SpecialKey` object:

```js
import KeyboardEvent, { SpecialKey } from 'bg2e/app/KeyboardEvent`,
```

```js
const SpecialKey = {
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
}
```

## EventBase

KeyboardEvent extends the `EventBase` class, which defines the `stopPropagation()` function. This function does not work in the same way as the `stopPropagation()` function of native browser events. If we call `stopPropagation()`, it will stop the event propagation chain and also cancel the default behavior of that event. In practice, it is as if we do the following, in the event handler:

```js
function myEventHandler(evt) {
    ...
    evt.stopPropagation();
    evt.preventDefault();
    return false;
}
```