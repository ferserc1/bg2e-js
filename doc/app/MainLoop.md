# Main Loop

Starts the application lifecycle loop, and links the `AppController` to the `Canvas`. Its constructor receives two mandatory parameters: the [`canvas`](Canvas.md) and the [`AppController`](AppController.md).

## Run the main loop

For the application to start running, the asynchronous method `run()` must be called:

```js
import MainLoop from "bg2e/app/MainLoop";

...
const myMainLoop = new MainLoop(canvas,appController);
await myMainLoop.run();
```

## Frame update mode

The rendering loop can work in two ways: automatic or manual. Automatic mode constantly renders at the highest possible speed allowed by the hardware and the browser. In manual mode, frames are only updated when specifically requested.

The rendering modes are configured with the `updateMode` attribute, passing one of the values defined in the `FrameUpdate` object:

```js
import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";

...
mainLoop.updateMode = FrameUpdate.MANUAL;
await mainLoop.run();
```

The frame update mode can be changed dynamically at runtime.

If the render loop is set to manual mode, the `postRedisplay()` function must be called to enqueue a redraw message in the event loop. It is important to note that multiple calls to `postRedisplay()` made during the same frame will only generate a single redraw of the scene.

- `mainLoop.postRedisplay()`: posts a `redisplay` message in the event loop message queue.

```js
class MyAppController extends AppController {
    ...
    mouseMove(evt) {
        this.mainLoop.postRedisplay();
    }
}
```

- `postRedisplay()`: posts a `reshape` message in the event loop message queue, to force a reshape event.

