# bg2 engine render package

It provides the APIs needed to generate graphs from bg2 engine data structures. This package contains two sets of APIS:

- Low level APIs: these are the APIs that interact directly with the specific rendering technology. There can be as many sets of low-level APIs as there are rendering technologies available. For example, there is a rendering API for WebGL 1, but another one could be added for WebGL 2 or for WebGPU.
- High level APIs: these are APIs independent of the underlying rendering layer, working with native structures of the graphics engine and without going into implementation details. 

The high-level APIs provide a front end to access the specific low-level APIs that you want to use for a given application. Thus, the workflow to create a bg2 engine application consists of:
  * Determine which rendering technology we are going to use: with this we determine which set of low-level APIs we want to use, based on their availability.
  * Load or create data structures and scene objects: these data structures are independent of the rendering part, they are only used to store the data we want to represent.
  * Use the high-level APIs to render the scene from the loaded data structures.

## Renderer

The [`Renderer`](Renderer.md) class is an abstract class that provides the access to all low-level rendering commands. By creating a concrete implementation of `Renderer`, we are specifying which low-level API to use. For example, if we create a `webgl.Renderer` object, the low-level API we will use will be that of `WebGL`.

The programmer of a bg2 engine application only interacts with the `Renderer` class to create an instance and store it. The `renderer` object that has been created will be used by the high-level APIs to access the rendering-specific APIs. Exceptionally, we can use the APIs of a `renderer` object to access the low-level APIs, but note that the resulting code will only work for that particular rendering technology.

## Rendering APIs

**[WebGL](webgl/index.md):** Contains the low-level APIs for rendering using WebGL.

