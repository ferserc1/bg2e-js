# PolyListRenderer

Wraps a [`PolyList`](../base/PolyList.md) for rendering. One PolyListRenderer instance per PolyList instance manages the vertex and index buffers that represent the geometry data.

```ts
import PolyListRenderer from "bg2e-js/ts/render/PolyListRenderer.js";

const polyList = createSphere(0.5);
const renderer = myRenderer.factory.polyList(polyList);
```

## Properties (Read)

| Property | Type | Description |
|----------|------|-------------|
| `polyList` | PolyList | The wrapped geometry data. |
| `renderer` | Renderer | The base renderer (WebGLRenderer) managing this PolyListRenderer. |

## Methods

### init(): void

Initializes the internal buffers (vertexBuffer, indexBuffer). Called once on creation. No action needed by default — called automatically by the WebGL implementation.

### refresh(): void

Updates internal buffers when the PolyList data changes (e.g., vertices, normals are added). Call after the polylist is modified.

```ts
polyList.addVertexPositions([...]);
renderer.refresh();  // Re-upload updated vertex data to GPU
```

### bindBuffers(): void

Binds the PolyList's vertex and index buffers to the current WebGL context, setting up all attribute pointers (positions, normals, texture coords). Called by `RenderState.draw()` before drawing.

### draw(): void

Issues the WebGL draw call (`drawElements` for indexed, or `drawArrays`). Called by `RenderState.draw()`.

### destroy(): void

Releases all GPU resources (vertex and index buffers). Call when removing objects from the scene.

```ts
renderer.destroy();  // Destroys the PolyListRenderer
polyList._renderer = null;  // Clear the reference to allow disposal of the PolyList too
```
