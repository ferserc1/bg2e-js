# FrameBuffer

The `FrameBuffer` class manages the main display frame buffer for rendering to-screen. It provides simple clear operations for the color and depth buffers.

Access through `renderer.frameBuffer`:

```ts
const fb = myRenderer.frameBuffer;
fb.clear();  // Clear color and depth buffers
```

## Constructor

```ts
private constructor(renderer: Renderer)
```

The frame buffer is created automatically when first accessed via `renderer.frameBuffer` (lazy instantiation).

## clear() — Clear All Buffers

Clears the color and depth buffers (default behavior, same as `clearAll()`):

```ts
fb.clear();  // Equivalent to clear({ color: true, depth: true })
```

## clearColor() — Clear Color Only (with Depth)

Clears the color buffer, leaving the depth buffer untouched:

```ts
fb.clearColor();  // Equivalent to clear({ color: true, depth: false })
```

## clearDepth() — Clear Depth Only (with Color)

Clears both the color and depth buffers:

```ts
fb.clearDepth(): void  // Clear everything (color + depth)
```

## clearStencil() — Clear Stencil Only

Clears the stencil buffer:

```ts
fb.clearStencil();  // Clear just the stencil buffer
```
