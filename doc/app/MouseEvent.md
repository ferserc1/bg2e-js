# MouseEvent

Saves the data of a mouse type event.

- `button`: The mouse button associated with the event. It can be one of the values contained in the `MouseButton` object:

```js
import { MouseButton } from "bg2e/app/MouseEvent";
```

```js
const MouseButton = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2,
    NONE: -1
}
```

- `x`, `y`: The mouse cursor position, relative to the `<canvas>` element associated with the current [`AppController`](AppController.md) object.
- `delta`: The mouse wheel offset, if the event is a `MouseWheel` event.


## EventBase

MouseEvent extends the `EventBase` class, which defines the `stopPropagation()` function. This function does not work in the same way as the `stopPropagation()` function of native browser events. If we call `stopPropagation()`, it will stop the event propagation chain and also cancel the default behavior of that event. In practice, it is as if we do the following, in the event handler:

```js
function myEventHandler(evt) {
    ...
    evt.stopPropagation();
    evt.preventDefault();
    return false;
}
```