# Renderer

`Renderer` is an abstract class that is responsible for storing the rendering API elements necessary for the graphics engine to convert the data structures of the objects in the scene into a 2D image.

During the initialization of a bg2 engine application, an instance of a specific `Renderer` class is created (for example, `webgl.Renderer`). In this way we indicate which API the graphics engine has to use to generate the rendering of the scene. The `Renderer` instance is used to initialize the `app.Canvas` object, which is a wrapper that connects the `<canvas>` element of the DOM tree to the graphics engine. The following code initializes a canvas to be used with the WebGL API:

```js
import Canvas from "bg2e/app/Canvas";
import WebGLRenderer from "bg2e/render/webgl/Renderer";

...

const renderer = new WebGLRenderer();
const domCanvas = document.getElementById('gl-canvas');
const canvas = new Canvas(domCanvas, renderer);
```

