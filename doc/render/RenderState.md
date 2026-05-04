# RenderState

The `RenderState` class represents a single rendering operation: the combination of a shader, geometry (PolyListRenderer), material (MaterialRenderer), and transformation matrices. It is the fundamental unit of rendering in bg2e render system.

```ts
import RenderState from "bg2e-js/ts/render/RenderState.ts";
```

## Properties (Read)

| Property | Type | Description |
|----------|------|-------------|
| `shader` | Shader \| null | The shader program for this render state. |
| `polyListRenderer` | PolyListRenderer \| null | The geometry renderer associated with this render state. |
| `materialRenderer` | MaterialRenderer \| null | The material renderer associated with this render state. |
| `modelMatrix` | Mat4 | Model transformation matrix (local-to-world). |
| `viewMatrix` | Mat4 | View (camera) matrix. Can be a reference to a shared `Mat4` object that is mutated each frame. |
| `projectionMatrix` | Mat4 | Projection matrix (perspective/orthographic). Can be a reference to a shared `Mat4` object that is mutated each frame. |
| `pipeline` | Pipeline \| null | Optional pipeline to activate before rendering. If not set, no pipeline settings are applied — they must be activated externally. |
| `renderer` | Renderer \| undefined | Returns the underlying renderer from the polyListRenderer. |

## Constructor

```ts
const renderState = new RenderState({
    shader: null,              // Shader instance (required for valid state)
    polyListRenderer: null,  // PolyList renderer wrapper (required for valid state)
    materialRenderer: null,  // Material renderer wrapper (required for valid state)
    modelMatrix: Mat4.MakeIdentity(),  // Model matrix, default identity
    viewMatrix: Mat4.MakeIdentity(),   // View/camera matrix, default identity
    projectionMatrix: Mat4.MakeIdentity(), // Projection matrix, default identity
    pipeline: null               // Optional pipeline for batch settings (blend/state)
});
```

The optional parameters are initialized with `null` or identity matrices. All four properties must be set for the state to be valid (for rendering).

## Properties (Read/Write)

All read/write properties use standard TypeScript getters/setters:

```ts
renderState.shader = myShader;
renderState.modelMatrix.assign(Mat4.MakeTranslation(x, y, z));
// or pass reference for mutation:
renderState.viewMatrix = this._viewMatrix;  // Shared Mat4 reference, updated each frame
```

## Properties (Read)

- **`valid`:** boolean. Returns `true` if shader, polyListRenderer, and materialRenderer are all non-null (required for a valid render state).

## isLayerEnabled(layer: RenderLayer): boolean

Checks whether this render state should be rendered in the given layer mask. Determines which RenderLayer(s) apply based on `polyList.renderLayers` and `material.isTransparent`:

```ts
if (renderState.isLayerEnabled(RenderLayer.OPAQUE_DEFAULT)) { ... }
```

## draw(options?: DrawOptions): void

Executes the render operation. The `DrawOptions` interface supports optional overrides:

```ts
interface DrawOptions {
    overrideShader?: Shader | null;       // Replace the shader for this draw call only
    overrideViewMatrix?: Mat4 | null;     // Use a custom view matrix for this call
    overrideProjectionMatrix?: Mat4 | null;  // Use a custom projection matrix for this call
}
```

Execution steps inside `draw()`:
1. If no active camera is set, skip rendering.
2. Activate the pipeline if one was provided via `setupRenderer()`.
3. Bind vertex/index buffers: `polyListRenderer.bindBuffers()`.
4. Call `shader.setup(this, this, ...)` to bind all uniforms (model/view/projection matrices).
5. Call `polyListRenderer.draw()` to issue draw calls via WebGL API.

The shader's `setup()` method is called with references to the polyListRenderer and materialRenderer, plus (by reference) model, view, and projection matrices:

```ts
rs.draw();  // Standard draw using state's shader + polyListRenderer + materialRenderer

// Or with overrides:
rs.draw({ overrideShader: myCustomShader });  // Custom shader for this call only
```
