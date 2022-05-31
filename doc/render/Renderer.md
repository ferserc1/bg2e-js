# Renderer

`Renderer` is an abstract class that is responsible for storing the rendering API elements necessary for the graphics engine to convert the data structures of the objects in the scene into a 2D image.

During the initialization of a bg2 engine application, an instance of a specific `Renderer` class is created (for example, `webgl.Renderer`). In this way we indicate which API the graphics engine has to use to generate the rendering of the scene. The `Renderer` instance is used to initialize the `app.Canvas` object, which is a wrapper that connects the `<canvas>` element of the DOM tree to the graphics engine. The following code initializes a canvas to be used with the WebGL API:

```js
import Canvas from "bg2e/app/Canvas";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import MainLoop from "bg2e/app/MainLoop";
...

window.onload = async () => {
    // Create the renderer, in this case, a WebGLRenderer
    const renderer = new WebGLRenderer();
    const domCanvas = document.getElementById('gl-canvas');
    const canvas = new Canvas(domCanvas, renderer);

    // Create the main loop and the app controller
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    await mainLoop.run();
}
```

See also: [app.AppController](../app/AppController.md), [app.MainLoop](../app/MainLoop.md).


## Determine the low level API

An instance of a particular `Renderer` class will provide access to the low-level APIs, so when we make use of these APIs, the resulting code will work only for that particular rendering technology. For this reason, it is very common that we have to determine which is the underlying rendering technology of a `renderer` object.

To determine which rendering API is being used by a renderer object, it is sufficient to determine which specific Renderer class the object was created with:

```js
import WebGLRenderer from "bg2e/render/webgl/Renderer"

...

if (myRenderer instanceof WebGLRenderer) {
    console.log("I'm using WebGL to render the scene.");
}
```

## Reference

### Methods

**`async init(canvas)`:** initialize the `Renderer` instance.

**`postReshape(width,height)`:** Post a viewport resizing message in the [`MainLoop`](../app/MainLoop.md) message queue of the application. It must be called after a modification of the canvas dimensions, so that internally the necessary calls to modify the viewport dimensions are generated..

**`postRedisplay()`:** Post a viewport redraw message in the [`MainLoop`](../app/MainLoop.md) message queue of the application. It must be called when we modify the scene, the camera or any element that may cause a change in the final 2D image. If the `MainLoop` is configured to be automatically updated, it is not necessary to call this function, but if it is called, the performance impact is minimal.

### Attributes

**`canvas` (read):** Returns the canvas associated with the renderer.

## Specific Renderer classes

Note: the following "list" (I know, for now it is a one-item list.) will grow as new rendering technologies are integrated into bg2 engine.

- [`webgl.Renderer`](webgl/Renderer.md): WebGL 1.0
