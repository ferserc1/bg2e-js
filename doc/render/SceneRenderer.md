# SceneRenderer

The `SceneRenderer` class provides a high-level component for rendering scene graphs. It manages the camera, geometry transformation propagation (up and down), lights, render queue population, frame update/clean-up, per-layer draw calls and shadow map rendering.

```ts
import SceneRenderer from "bg2e-js/ts/render/SceneRenderer.js";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
```

## Example Usage (Low-Level)

```ts
const sceneRoot = new Node("root");  // Create scene graph root (see documentation for scene package)
const camera = new Node("Camera");
camera.addComponent(new CameraComponent());

sceneRoot.addChild(camera);
// ... add meshes, lights ...

const sceneRenderer = myRenderer.factory.scene();  // Create from factory
await sceneRenderer.init();                         // Initialize renderer

// In the frame callback:
await sceneRenderer.bindRenderer(sceneRoot);
await sceneRenderer.frame(sceneRoot, delta);

// In the display callback:
sceneRenderer.draw();  // Renders all layers
```

## Methods (Read)

### async init({ shadowMapSize, softShadows } = {}): Promise<void>

Initializes the scene renderer. Loads shaders and registers render queues for standard layers (`OPAQUE_DEFAULT`, `TRANSPARENT_DEFAULT`).

### async frame(sceneRoot: Node, delta: number): Promise<void> | void

Prepares the scene for drawing. Processes the render queue, transforms propagation (up + down passes through nodes), per-layer rendering and updates global shader state.

Parameters:
- `sceneRoot` — The root Node of the scene graph to render.
- `delta` — Time delta in milliseconds since last frame (for camera animations in user scripts, e.g. `orbitCamera`).

### draw(): void | Promise<void>

Draws the main shadow map, the visible skybox, and the opaque and transparent queues.

### async setEnvironment(env: Environment): Promise<void> | void

Sets the fallback environment for IBL and propagates it to the shader. `await env.load(...)` already generates its maps:

```ts
await sceneRenderer.setEnvironment(environment); // After await environment.load(...)
```

## Methods (Event Handlers)

Override these methods in app controllers to forward user input events:

### onKey(evt): void | Promise<void>

Calls `dispatchKeyDown(evt)` on the root node. Used for key press events. Override to handle specific keys before event propagation runs (`super.onKey(evt)` then custom handling or `return` to stop).

### onKeyUp(evt): void | Promise<void>

Calls `dispatchKeyUp(evt)` on the root node.

### onMouseDown(evt): void | Promise<void>

Calls `dispatchMouseDown(evt)` on the root node.

### onMouseUp(evt): void | Promise<void>

Calls `dispatchMouseUp(evt)` on the root node.

### onMouseMove(evt): void | Promise<void>

Calls `dispatchMouseMove(evt)` on the root node. Override to stop propagation for drag operations (`return super.onMouseMove(evt);`).

### onMouseDrag(evt): void | Promise<void>

Calls `dispatchMouseDrag(evt)` on the root node. Override to stop propagation for drag operations.

### onMouseWheel(evt): void | Promise<void>

Calls `dispatchMouseWheel(evt)` on the root node. Override to stop propagation for wheel operations.

### onTouchStart(evt): void | Promise<void>

Calls `dispatchTouchStart(evt)` on the root node. For touch screen devices.

### onTouchMove(evt): void | Promise<void>

Calls `dispatchTouchMove(evt)` on the root node.

### onTouchEnd(evt): void | Promise<void>

Calls `dispatchTouchEnd(evt)` on the root node.

## Properties (Read)

| Property | Type | Description |
|----------|------|-------------|
| `layerOpacity` | `{ [key: string]: number } \| undefined` | Per-layer opacity map. Returns `undefined` by default (no attenuation). Set this to enable depth-based transparency for layers. |

```ts
sceneRenderer.layerOpacity = { opacity: 0.5 }; // Attenuate all layers by 50%
```

## Environment synchronization and soft shadows

`shadowMapSize` accepts a number or a two-component `Vec` (default 1024×1024). `softShadows` defaults to `false` and can also be changed on the renderer before the next `frame()`. PCSS uses the main directional/Sun light's source angle and `shadowSamples`; it does not add point-light shadow maps.

The first Environment in enabled scene traversal overrides the fallback passed to `setEnvironment()`. Removing or disabling it restores the fallback. Active procedural colors, source image and solar changes regenerate resources synchronously during `frame()`. A scene without direct lights can still render IBL. Call `draw()` after the awaited frame preparation.

See [Environment](Environment.md) for same-node Sun association, HDR generation, prefiltering and shadow limitations.
