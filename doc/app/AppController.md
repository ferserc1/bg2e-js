# AppController

The `AppController` is used to handle the initialization and the life cycle of the application. The class we will use as `AppController` will be a derivative of this one, either defined entirely by the programmer, or one of the predefined ones in the graphic engine.

Defines a series of functions that can be overwritten to handle application events. It also defines properties that are used to access other important elements of the application.

## Event handler functions

They are overwritten in the `AppController` derived class to handle the event associated to each function. The `init()` function is called after initializing the renderer, so at this point it is ready to process drawing API calls. The `frame(delta)` and `display()` functions are called during the application loop. Depending on the frame update mode that is set in `MainLoop`, these functions will be called continuously, or only when explicitly required. The `reshape(width,height)` function will be called at the window resize event, or when explicitly requested through the `mainLoop` instance. All other functions are called in response to user input events.

- `init()`
- `reshape(width,height)`
- `frame(delta)`
- `display()`
- `destroy()`
- `keyDown(evt)`
- `keyUp(evt)`
- `mouseUp(evt)`
- `mouseDown(evt)`
- `mouseMove(evt)`
- `mouseOut(evt)`
- `mouseDrag(evt)`
- `mouseWheel(evt)`
- `touchStart(evt)`
- `touchMove(evt)`
- `touchEnd(evt)`

See the documentation on user events to learn more about how to handle them:

- [`MouseEvent`](MouseEvent.md)
- [`KeyboardEvent`](KeyboardEvent.md)
- [`TouchEvent`](TouchEvent.md)

## Properties

They provide access to important elements of the application, which may be needed during program execution:

- `mainLoop` (read) [main application loop](MainLoop.md). Generally, access to the main loop is needed to request a frame redraw (`postRedisplay()`) or to request a viewport rescale (`postReshape()`).
- `canvas` (read) is the [`app.Canvas`](Canvas.md) instance, linked with the above `mainLoop`. Normally you need access to the canvas to take screenshots through the `screenshot(fmt,w,h)` function.
- `renderer` (read) is the [`render.Renderer`](../render/Renderer.md) instance. Access to the renderer is very important to perform almost all initialization and drawing operations.
- `viewport` (read) returns an object containing the canvas width, height and aspect ratio: `{ width, height, aspectRatio }`.

