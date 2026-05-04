# bg2e-render Module

The `render` module provides the 3D rendering engine and associated utilities for bg2e.

## Overview

The render module consists of several abstractions that work together to render 3D scenes:

- **Renderer** — The top-level rendering target. Implements the WebGL rendering state, viewport, and factory pattern for creating render-specific objects.
- **RendererFactory** — A factory interface that creates PolyListRenderers, MaterialRenderers, TextureRenderers, RenderBuffers, Pipelines, SkySpheres/Cubes, Environments, and SceneRenderers.
- **PolyListRenderer** — Renderer for a PolyList (geometry buffers, vertex/index data). One per PolyList.
- **MaterialRenderer** — Renderer for a Material (material properties bound to the current shader).
- **RenderState** — A render invocation unit: a combination of Shader, PolyListRenderer, MaterialRenderer, and transformation matrices (model/view/projection).
- **Shader** — Base class for custom GLSL shaders. Subclass and implement `load()`, `setup()`, and `destroy()`.
- **Pipeline** — Configureable render pipeline settings (blend states, depth test, cull face). Activates before drawing a group of objects.
- **RenderQueue** — Queue system that batches RenderStates per layer (opaque, transparent) with begin/end callbacks.
- **SceneRenderer** — High-level component that renders a scene graph: processes camera, lights, transforms, and render queue automatically.
- **SceneAppController** — An AppController derivative designed for SceneRenderer-based apps; handles the app lifecycle, input forwarding, and automatic frame rendering.
- **Environment** — Auto-generates cubemap lighting from an equirectangular texture (environmentMap, specularMap, irradianceMap).
- **SkySphere / SkyCube** — Render sky/scene background using spheric/cubemap textures via a sky shader.

## Rendering Flow (Low-level)

The basic rendering loop follows this pattern:

1. Create a `WebGLRenderer` and wrap it in a `Canvas`.
2. For each object to render: create a geometry PolyList, wrap it with `renderer.factory.polyList()`, and a Material wrapped with `renderer.factory.material()`.
3. Create a Shader subclass instance, call `shader.load()`, and pass it to a new `RenderState` along with the renderers, model/view/projection matrices.
4. In the `display()` callback: clear the frame buffer, activate any `Pipeline`, and call `renderState.draw()`.

```ts
import Pipeline, { BlendFunction } from "bg2e-js/ts/render/Pipeline.ts";
import RenderState from "bg2e-js/ts/render/RenderState.ts";

// Create opaque pipeline
const opaquePipeline = renderer.factory.pipeline();
opaquePipeline.setBlendState({ enabled: false });
opaquePipeline.create();

// For each frame, rebuild render states:
renderStates = [];
plistRenderers.forEach((pr) => {
    const rs = new RenderState({
        shader,
        polyListRenderer: pr.plistRenderer,
        materialRenderer: pr.materialRenderer,
        modelMatrix,
        viewMatrix,
        projectionMatrix
    });
    renderStates.push(rs);
});

// In display():
renderer.frameBuffer.clear();

for (const rs of renderStates) {
    if (rs.isLayerEnabled(RenderLayer.OPAQUE_DEFAULT)) {
        opaquePipeline.activate();
    }
    rs.draw();
}
```

## Rendering Flow (Scene-based, Recommended)

For scene-graph based applications:

1. Create a `WebGLRenderer` and wrap it in a `Canvas`.
2. Use `SceneAppController` or create a `SceneRenderer`: build scene nodes with components (Transform, Drawable, Camera, Light).
3. Initialize the `SceneRenderer` with an Environment for PBR lighting.
4. Forward app events (keyDown, mouseDown, mouseDrag, etc.) to `sceneRenderer.onKey...()`, `sceneRenderer.onMouse...()` methods.
5. Call `sceneRenderer.frame(sceneRoot, delta)` in the frame callback and no explicit draw is needed — rendering is automatic.

```ts
import SceneAppController from "bg2e-js/ts/render/SceneAppController.ts";

class MyController extends SceneAppController {
    async init() {
        // ... custom setup
        await this.loadScene(); // or scene.init(sceneRoot)
    }

    protected async frame(delta: number): Promise<void> {
        await super.frame(delta);
        // ... custom frame updates after rendering
    }
}

// Setup:
const canvas = new Canvas(canvasElem, new WebGLRenderer());
const appController = new MyController();
const mainLoop = new MainLoop(canvas, appController);
await mainLoop.run();
```

## Module Structure

- [Renderer](Renderer.md) — Renderer base class, factory pattern, WebGL implementation
- [State](State.md) — WebGL rendering state wrapper (clear color, viewport, depth test)
- [Pipeline](Pipeline.md) — Render pipeline: blend states, depth test, cull face
- [RenderState](RenderState.md) — Single render invocation (shader + geometry + matrices)
- [RenderQueue](RenderQueue.md) — Layer-aware render batching system
- [FrameBuffer](FrameBuffer.md) — Frame buffer clear operations
- [RenderBuffer](RenderBuffer.md) — Texture attachment / render-to-texture management
- [TextureMergerRenderer](TextureMergerRenderer.md) — Merge multiple textures into a single output texture
- [PolyListRenderer](PolyListRenderer.md) — Geometry buffer management for PolyLists
- [MaterialRenderer](MaterialRenderer.md) — Material rendering state per renderer type
- [Shader](Shader.md) — Base class for custom render shaders
- [SceneRenderer](SceneRenderer.md) — High-level scene graph rendering system
- [SceneAppController](SceneAppController.md) — App controller for SceneRenderer-based apps
- [Environment](Environment.md) — Environment map and IBL (environment, specular, irradiance maps)
- [SkySphere](SkySphere.md) — Spherical sky rendering from equirectangular textures
- [SkyCube](SkyCube.md) — Cubemap sky rendering from environment/sky textures

## WebGL Namespace

The `render.webgl` namespace provides direct access to the WebGL-specific implementations:

```ts
import { webgl } from "bg2e-js/ts/render/webgl/index.ts";

// Or import individually:
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import ShaderProgram from "bg2e-js/ts/render/webgl/ShaderProgram.ts";
```
