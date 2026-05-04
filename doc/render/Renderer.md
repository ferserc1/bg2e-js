# Renderer

Base class for renderers. Represents the graphics rendering target (typically a canvas). The renderer provides a factory interface to create rendering objects (PolyListRenderer, MaterialRenderer, TextureRenderer, Pipeline, etc.).

The base class defines abstract methods that are implemented by concrete renderers. The current implementation is WebGL-based.

```ts
import Renderer from "bg2e-js/ts/render/Renderer.ts";
```

See also [`webgl/Renderer.js`](../render/webgl/Renderer.js) for the WebGL implementation (`WebGLRenderer`).

## EngineFeatures Enum

Defines supported rendering features:

```ts
import { EngineFeatures } from "bg2e-js/ts/render/Renderer.ts";

const supportsRTT = renderer.supportsFeatures(EngineFeatures.RENDER_TARGET_TEXTURES);
```

- `RENDER_TARGET_TEXTURES (0x1 << 0)` — Supports render-to-texture via WebGL extensions.
- `RENDER_TARGET_FLOAT (0x1 << 1)` — Supports floating-point render targets.
- `RENDER_TARGET_DEPTH (0x1 << 2)` — Supports depth render targets.

## Constructor

```ts
constructor(identifier: string)
```

- `identifier` — A string identifier for the renderer (e.g., "webgl").

## Properties (Read)

- **`frameBuffer`** — Returns the [`FrameBuffer`](FrameBuffer.md) instance associated with this renderer.
- **`canvas`** — Returns the [`Canvas`](../app/Canvas.md) linked to this renderer.
- **`factory`** — Returns a [`RendererFactory`](#renderer-factory) interface for creating rendering objects.

## Methods (WebGL Implementation: `WebGLRenderer`)

```ts
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";

const renderer = new WebGLRenderer();
```

### async init(canvas: Canvas): Promise<void>

Initializes the renderer with a canvas. Creates the WebGL context internally.

### get gl(): WebGLRenderingContext

Returns the raw `WebGLRenderingContext` object (WebGL1). Used for direct WebGL API calls from custom shaders.

### get frameBuffer(): FrameBuffer

Returns the `WebGLFrameBuffer` instance. Use `frameBuffer.clear()` to clear buffers.

### set viewport(vp: Vec) / get viewport(): Vec

Set/get the viewport dimensions. Typically called in `reshape()` and synced with canvas size on every frame update.

### get uniqueId(): string

Returns a unique identifier for this renderer instance (string).

### get typeId(): string

Returns the type name, `"WebGL"`.

### postReshape(width: number, height: number): void

Called when the canvas is resized. Should forward to `renderer.state.viewport = new Vec(width, height)`.

### postRedisplay(): void

Triggers a redraw in the next frame.

### supportsFeatures(feature: number): boolean

Checks if a specific `EngineFeature` is supported. Returns `true/false`.

### getMaximumRenderTargets(): number

Returns the maximum number of simultaneous render targets. Typically 1 for WebGL1.

### clearBuffer(): void

Clears the current frame buffer (equivalent to calling `state.clear()`).

### get state(): State

Returns the [`State`](State.md) object, which provides access to WebGL rendering parameters (clearColor, viewport, depthTestEnabled, etc.).

### get debugMode(): boolean

Returns `true` if WebGL debugging is enabled. Debugging can be enabled by appending `?debug=true` to the URL.

## RendererFactory Interface

The factory creates all rendering-specific objects:

```ts
const factory = renderer.factory;
```

| Method | Returns | Description |
|--------|---------|-------------|
| `factory.polyList(plist)` | [`PolyListRenderer`](PolyListRenderer.md) | Wraps a PolyList with a renderer |
| `factory.material(material)` | [`MaterialRenderer`](MaterialRenderer.md) | Wraps a Material with a renderer |
| `factory.texture(texture)` | [`TextureRenderer`](TextureRenderer.md) | Wraps a Texture for rendering operations |
| `factory.renderBuffer()` | [`RenderBuffer`](RenderBuffer.md) | Creates a new RenderBuffer for RTT/cubemap operations |
| `factory.skySphere()` | [`SkySphere`](SkySphere.md) | Creates a new SkySphere instance |
| `factory.skyCube()` | [`SkyCube`](SkyCube.md) | Creates a new SkyCube instance |
| `factory.environment()` | [`Environment`](Environment.md) | Creates an Environment for IBL |
| `factory.textureMerger()` | [`TextureMergerRenderer`](TextureMergerRenderer.md) | Creates a TextureMerger for merging channels from multiple textures |
| `factory.pipeline()` | [`Pipeline`](Pipeline.md) | Creates a new Pipeline for configuring blend state, depth/cull settings |
| `factory.scene()` | [`SceneRenderer`](SceneRenderer.md) | Creates a new SceneRenderer for scene-graph rendering |
| `factory.shadowRenderer()` | [`ShadowRenderer`](ShadowRenderer.md) | Creates a ShadowRenderer for shadow map generation |

## Abstract Methods (Base class)

The base `Renderer` defines the following methods. Concrete renderers must override them:

- **`polyListFactory(plist: PolyList): PolyListRenderer`** — Creates the renderer wrapper for a polylist.
- **`materialFactory(material: Material): MaterialRenderer`** — Creates the renderer wrapper for a material.
- **`textureFactory(texture: Texture): TextureRenderer`** — Creates a texture renderer wrapper.
- **`renderBufferFactory(): RenderBuffer`** — Creates a render buffer.
- **`skySphereFactory(): SkySphere`** / **`skyCubeFactory(): SkyCube`** — Creates sky geometry instances.
- **`pipelineFactory(): Pipeline`** — Creates a new pipeline.
- **`sceneRendererFactory(): SceneRenderer`** — Creates the scene renderer.
- **`shadowRendererFactory(): ShadowRenderer`** — Creates a shadow renderer.
