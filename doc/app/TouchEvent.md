# TouchEvent

Saves the data of a touch type event.

- `touches`: an array of all the touch points in the screen. Each touch element contains the following data:

```js 
{
    identifier
    x
    y
    force
    rotationAngle
    radiusX
    radiusY
}
```
The `x` and `y` coordinates in the touch points are relative to the `<canvas>` element.

## EventBase

TouchEvent extends the `EventBase` class, which defines the `stopPropagation()` function. This function does not work in the same way as the `stopPropagation()` function of native browser events. If we call `stopPropagation()`, it will stop the event propagation chain and also cancel the default behavior of that event. In practice, it is as if we do the following, in the event handler:

```js
function myEventHandler(evt) {
    ...
    evt.stopPropagation();
    evt.preventDefault();
    return false;
}
```