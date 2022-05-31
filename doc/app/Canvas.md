# Canvas

It is a class that wraps the `<canvas>` HTML element where we want to have the viewport of the scene. It is in charge of binding the [`render.Renderer`](../render/Renderer.md) object to the HTML canvas, launching the `Renderer` initialization and providing some utilities related to the canvas.

Its constructor receives as a mandatory parameter the HTML element `<canvas>` where we want to draw the scene, and the `Renderer` corresponding to the graphic API we want to use.

```js
import Canvas from 'bg2e/app/Canvas';
import WebGLRenderer from 'bg2e/render/webgl/Renderer';

const myCanvas = new Canvas(document.getElementById('webgl-canvas'), new WebGLRenderer());
```

## Properties

- `mainLoop`: (read) [main application loop](MainLoop.md). Generally, access to the main loop is needed to request a frame redraw (`postRedisplay()`) or to request a viewport rescale (`postReshape()`).
- `renderer`: (read) is the [`render.Renderer`](../render/Renderer.md) instance. Access to the renderer is very important to perform almost all initialization and drawing operations.
- `domElement`: (read) contains the `<canvas>` html element associated with the canvas.
- `width`: (read) returns the current canvas width.
- `height`: (read) returns the current canvas height.
- `viewport`: (read) returns an object containing the canvas width, height and aspect ratio: `{ width, height, aspectRatio }`.

## Functions

- `updateViewportSize()`: El tamaño del canvas en pixeles se define mediante los atributos `width` y `height` del elemento DOM `<canvas>`. No obstante, el tamaño real que se visualiza en el navegador depende también de los estilos CSS. Esta función actualiza el tamaño de los atributos `width` y `height` del `<canvas>` para que coincidan con el tamaño real en píxeles del canvas, una vez aplicados los estilos.

```js
canvas.domElement.style.width = "100vw";
canvas.domElement.style.height = "100vh";
canvas.updateViewportSize();
```

- `screenshot(format, width, height)`: Takes a screenshot of the canvas, with the specified format and size. Supported formats are those supported by the `toDataURL(format)` API of the `<canvas>` HTML element, for example, `image/png`. The screenshot is returned in the form of a data URL, in Base64 format. At the beginning of the return string the format of the image data is specified (`data:image/png;base64....`). If the format of the return string does not match the requested format, it is because the requested format is not supported. In that case, the image is usually returned in `png` format.

