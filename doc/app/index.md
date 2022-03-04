# bg2 engine app package

It contains functions and classes to implement a bg2 engine application in browser or Electron.js.

There are four basic elements that need to be defined to create a bg2 engine application. Three of them are from the `app` package and the fourth is from the `render` package:

- `AppController`: is used to handle the initialization and the life cycle of the application. The class we will use as `AppController` will be a derivative of this one, either defined entirely by the programmer, or one of the predefined ones in the graphic engine.
- `Canvas`: is used to link the graphic engine with the `<canvas>` HTML element where we are going to draw the scene.
- `MainLoop`: starts the application lifecycle loop, and links the `AppController` to the `Canvas`.
- `render.Renderer`: is used to define the type of renderer we want to use in the application. For example, a WebGL-based application will use the `bg2e.render.webgl.Renderer` renderer.