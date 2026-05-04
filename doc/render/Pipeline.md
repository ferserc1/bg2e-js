# Pipeline

The `Pipeline` class defines a set of render state parameters (blend equation, blend functions, depth testing, face culling) that can be activated for groups of draw calls. It is used to manage render passes with the same rendering state, such as opaque and transparent object batches.

The base class is abstract; WebGL implementations are created via `renderer.factory.pipeline()`.

```ts
import Pipeline, { BlendEquation, BlendFunction } from "bg2e-js/ts/render/Pipeline.ts";
```

## Enumerations

### BlendEquation

Defines how RGB color results are combined:

```ts
import { BlendEquation } from "bg2e-js/ts/render/Pipeline.ts";

const eq = BlendEquation.ADD;
```

- `ADD (1)` — Default. Source + Destination (`src + dst`)
- `SUBTRACT (2)` — Source - Destination (`src - dst`)
- `REVERSE_SUBTRACT (3)` — Destination - Source (`dst - src`)

### BlendFunction

Defines blending factors used in calculations:

```ts
import { BlendFunction } from "bg2e-js/ts/render/Pipeline.ts";

const func = BlendFunction.ONE;
```

| Constant | Value | WebGL Equivalent | Formula Factor |
|----------|-------|-----------------|----------------|
| `NULL` | 0 | N/A | Null (not used) |
| `ZERO` | 1 | GL.ZERO | 0.0 |
| `ONE` | 2 | GL.ONE | 1.0 |
| `SRC_COLOR` | 3 | GL.SRC_COLOR | (Rs, Gs, Bs, As) × Cs |
| `ONE_MINUS_SRC_COLOR` | 4 | GL.ONE_MINUS_SRC_COLOR | (1,0,0,0) - Cs |
| `DST_COLOR` | 5 | GL.DST_COLOR | (Rd, Gd, Bd, Ad) × Cs |
| `ONE_MINUS_DST_COLOR` | 6 | GL.ONE_MINUS_DST_COLOR | (1,0,0,0) - Cd |
| `SRC_ALPHA` | 7 | GL.SRC_ALPHA | As × Cs |
| `ONE_MINUS_SRC_ALPHA` | 8 | GL.ONE_MINUS_SRC_ALPHA | (1,0,0,0) - As × Cs |
| `DST_ALPHA` | 9 | GL.DST_ALPHA | Ad × Cs |
| `ONE_MINUS_DST_ALPHA` | 10 | GL.ONE_MINUS_DST_ALPHA | (1,0,0,0) - Ad × Cs |

## BlendState Interface

Specifies all blending parameters:

```ts
interface BlendState {
    enabled: boolean;
    blendEquation: BlendEquation;
    blendFuncSrc: BlendFunction;       // Source RGB function (default: SRC_ALPHA)
    blendFuncDst: BlendFunction;       // Destination RGB function (default: ONE_MINUS_SRC_ALPHA)
    blendFuncSrcAlpha: BlendFunction;  // Source Alpha function (default: SRC_ALPHA)
    blendFuncDstAlpha: BlendFunction;  // Destination Alpha function (default: ONE_MINUS_SRC_ALPHA)
}

interface BlendStateParams {
    enabled?: boolean;
    blendEquation?: BlendEquation;
    blendFuncSrc?: BlendFunction;
    blendFuncDst?: BlendFunction;
    blendFuncSrcAlpha?: BlendFunction;
    blendFuncDstAlpha?: BlendFunction;
}
```

## Properties (Read/Write)

| Property | Type | Description |
|----------|------|-------------|
| `enabled` | boolean | Enable/disable blending. Default: true. |
| `blendEquation` | BlendEquation | RGB blend equation. Default: ADD. |
| `blendFuncSrc` | BlendFunction | Source RGB blend function. Default: SRC_ALPHA (0/1). |
| `blendFuncDst` | BlendFunction | Destination RGB blend function. Default: ONE_MINUS_SRC_ALPHA. |
| `blendFuncSrcAlpha` | BlendFunction | Source Alpha blend function. Default: SRC_ALPHA (0/1). |
| `blendFuncDstAlpha` | BlendFunction | Destination Alpha blend function. Default: ONE_MINUS_SRC_ALPHA. |
| `depthTest` | boolean (read/write) | Enable/disable depth testing per pipeline. |
| `cullFace` | boolean (read/write) | Enable/disable face culling per pipeline. |
| `blendState` | BlendState (read) | Returns the current complete blend state object. |

```ts
pipeline.depthTest = true;   // Enable depth testing (default)
pipeline.cullFace = false;  // Disable face culling for this pipeline
```

## Methods

### constructor(renderer: Renderer)

Creates a new pipeline instance. The renderer must implement the factory methods to create pipelines.

### setBlendState(params: BlendStateParams = {}): void

Sets the blend state from optional parameters. All parameters are optional with defaults:

```ts
pipeline.setBlendState({ enabled: true });  // Enable blending with default functions
// or fully customized:
pipeline.setBlendState({
    enabled: true,
    blendEquation: BlendEquation.ADD,
    blendFuncSrc: BlendFunction.SRC_ALPHA,
    blendFuncDst: BlendFunction.ONE_MINUS_SRC_ALPHA,
    blendFuncSrcAlpha: BlendFunction.ONE,
    blendFuncDstAlpha: BlendFunction.ONE_MINUS_SRC_ALPHA
});
```

### create(): void

Prepares the pipeline for activation. This sets up internal WebGL state. Must be called once after configuration and before `activate()`.

### activate(): void

Applies the pipeline settings to the WebGL context. Enables/disables blending, depth test, face culling and sets blend equations/functions:

```ts
opaquePipeline.activate(); // Activates this pipeline's settings
// ... draw calls ...
transparentPipeline.activate(); // Switch to transparent pipeline
```

## Example Usage

Basic opaque and transparent pipelines:

```ts
const opaquePipeline = renderer.factory.pipeline();
opaquePipeline.setBlendState({ enabled: false });  // No blending for opaque objects
opaquePipeline.create();

const transparentPipeline = renderer.factory.pipeline();
transparentPipeline.setBlendState({ enabled: true });  // Blending for transparent objects
transparentPipeline.create();

// In display():
renderer.frameBuffer.clear();
opaquePipeline.activate();

renderStates.forEach(rs => {
    if (rs.isLayerEnabled(RenderLayer.OPAQUE_DEFAULT)) {
        rs.draw();  // Uses opaquePipeline settings
    } else {
        transparentPipeline.activate();
        rs.draw();  // Uses transparentPipeline settings
    }
});
```
