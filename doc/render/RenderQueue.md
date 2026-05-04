# RenderQueue

The `RenderQueue` class manages the rendering queue for different render layers. It organizes draw calls by layer, shader, and pipeline state, enabling efficient batch rendering.

Access through `renderer.renderQueue`:

```ts
const rq = myRenderer.renderQueue;
rq.addPolyList(polyListRenderer, materialRenderer, modelMatrix);
```

## Constructor

```ts
constructor(renderer: Renderer)
```

The render queue is created internally when the renderer initializes it.

## Properties

### viewMatrix / projectionMatrix

Set the current camera matrices used by all queued render states:

```ts
rq.viewMatrix = camera.viewMatrix;
rq.projectionMatrix = camera.projectionMatrix;
```

### lights

Array of light data (light + transform) added via `addLight()`:

```ts
const lights = rq.lights;  // LightData[]
```

### queues

Internal array of `QueueItem` structures, one per render layer:

```ts
const queues = rq.queues;
```

### renderer

Reference back to the owning `Renderer`:

```ts
const renderer = rq.renderer;
```

## Methods

### enableQueue() — Enable a Render Queue for a Layer

Enables (or creates) a render queue entry for the given layer and shader:

```ts
rq.enableQueue(RenderLayer.OPAQUE_DEFAULT, myShader);
```

Optional `EnableQueueOptions` parameter:

- **beginOperation** — Callback invoked before drawing the layer
- **endOperation** — Callback invoked after drawing the layer
- **enabled** — Initial enabled state (default `true`)

For transparent layers, blend state is automatically configured:

```ts
rq.enableQueue(RenderLayer.TRANSPARENT_DEFAULT, transparentShader);
```

### disableQueue() — Disable a Render Queue

Disables the queue for a given layer (sets `enabled` to false):

```ts
rq.disableQueue(RenderLayer.OPAQUE_DEFAULT);
```

> **Note:** The current implementation sets `enabled = true` in the body; this may be a bug.

### isQueueEnabled() — Check Queue Enabled State

```ts
const opaqueActive = rq.isQueueEnabled(RenderLayer.OPAQUE_DEFAULT);
```

### getQueue() — Get Queue Item by Layer

Returns the `QueueItem` for a given layer, or `undefined`:

```ts
const queue = rq.getQueue(RenderLayer.OPAQUE_DEFAULT);
```

### newFrame() — Reset Queue for New Frame

Clears all item queues and lights at the start of each frame:

```ts
rq.newFrame();  // Call once per frame before adding items
```

### addPolyList() — Add a Poly List to the Queue

Adds a poly list rendering entry to the appropriate queue(s) based on layer masks:

```ts
rq.addPolyList(polyListRenderer, materialRenderer, modelMatrix);
```

The pipeline selection is based on whether `polyList.enableCullFace` is true:
- **true** → uses `cullBackFace` pipeline
- **false** → uses `cullFaceDisabled` pipeline

### addLight() — Add a Light

Adds a light entry for shadow mapping. The depth texture is cleared each frame:

```ts
rq.addLight(light, lightTransformMatrix);
```

### draw() — Draw a Layer from the Queue

Executes all render state entries for a given layer:

```ts
rq.draw(RenderLayer.OPAQUE_DEFAULT);
rq.draw(RenderLayer.TRANSPARENT_DEFAULT);
```

Invokes `beginOperation()` before and `endOperation()` after drawing if callbacks are registered. If no queue exists for the layer, a warning is printed:

```
No render queue found for layer N
 ```


