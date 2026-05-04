# State

The `State` class provides a wrapper around the WebGL rendering state for the current context. Access it through `renderer.state`.

```ts
import { webgl } from "bg2e-js/ts/render/webgl/index.ts";

const state = renderer.state;
```

## Properties (Read/Write)

| Property | Type | Description |
|----------|------|-------------|
| `viewport` | `Vec` / `(number, number)` | Set/get the viewport. Use a 2-element Vec or array `[width, height]`. |
| `maxViewportDims` | `Vec` | Maximum supported viewport dimensions (read-only) from WebGL. |
| `clearColor` | `Vec(4)` | Set/get the clear color (RGBA, values 0-1). Write access calls `gl.clearColor()`. |
| `clearDepth` | `number` | Set/get the default depth clear value (0-1). |
| `clearStencil` | `number` | Set/get the default stencil clear value (integer). |
| `depthMask` | `boolean` | Set/get whether depth buffer writes are enabled. |
| `frontFace` | `number` | Set/get the front face orientation. Use constants from this class: `cw`, `ccw`. |
| `cullFace` | `number` | Set/get the culling mode: `gl.FRONT`, `gl.BACK`, or `gl.FRONT_AND_BACK`. |
| `depthTestEnabled` | `boolean` | Enable/disable the depth test. Recommended to set to `true` for 3D scenes. |
| `cullFaceEnabled` | `boolean` | Enable/disable back-face culling. Default is `true`. |
| `blendEnabled` | `boolean` | Enable/disable blending. Note: for per-pipeline blend configuration, use [`Pipeline`](Pipeline.md) instead — this is the global state toggle. |
| `shaderProgram` | `ShaderProgram \| null` | Set/get the currently active shader program in WebGL. Setting this calls `useProgram()`. |
| `CW` | `number` | WebGL constant for clockwise winding order. |
| `CCW` | `number` | WebGL constant for counter-clockwise winding order. |
| `FRONT` | `number` | WebGL constant for front face culling mode. |
| `BACK` | `number` | WebGL constant for back face culling mode. |
| `FRONT_AND_BACK` | `number` | WebGL constant for both faces culling mode. |

## clear()

Clear the color, depth and/or stencil buffers:

```ts
state.clear({ color = true, depth = true, stencil = false }: { color?: boolean; depth?: boolean; stencil?: boolean }): void
```

Equivalent to calling `renderer.frameBuffer.clear()`. Use it when you need all three buffers cleared:

```ts
state.clear();
// or selectively:
state.clear({ color: true, depth: false });
```

## Properties (Read)

- **`renderer`** — Returns the [`Renderer`](../render/Renderer.md) object this state belongs to.
- **`gl`** — Returns the webGLRenderingContext directly. This gives access to raw WebGL functions from custom shaders.
