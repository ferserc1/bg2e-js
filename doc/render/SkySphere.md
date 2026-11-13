# SkySphere

`renderer.factory.skySphere()` creates the WebGL implementation for rendering an equirectangular image on an inward-facing sphere. For procedural sky generation and solar association, use [Environment](Environment.md).

```ts
const sky = renderer.factory.skySphere();
await sky.load('/assets/sky.hdr');
sky.updateRenderState({ viewMatrix, projectionMatrix });
sky.draw();
```

## Methods and properties

- `load(imageUrl: string | null, Shader?): Promise<void>` loads an equirectangular image and initializes the shader (default `SkySphereShader`). A null URL creates a black texture; this low-level behavior differs from `Environment.load()`, whose empty source generates a procedural sky.
- `setTexture(imageUrl: string): Promise<void>` replaces the image after initialization, retaining the current shader.
- `linearOutput: boolean` controls SDR-to-linear decoding in the default shader. Environment generation sets it to true. Radiance `.hdr` pixels are already linear and bypass that decoding.
- `updateRenderState({ viewMatrix, projectionMatrix })` prepares drawing using the view matrix's rotation, so camera translation does not move the sky.
- `draw()` renders the prepared sphere through the WebGL subclass, temporarily disabling depth writes. Call `updateRenderState()` first.
- `destroy()` releases the owned texture, shader, material and geometry.

Images may use browser-supported SDR formats or Radiance RGBE `.hdr`. HDR decoding supports scanline RLE and flat/legacy pixels with Y-then-X axes, uploaded as float32 without passing through an SDR canvas. The default sphere shader does not implement the analytic solar disk used by `SceneRenderer`'s cube background.
