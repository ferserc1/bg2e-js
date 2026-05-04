# SkySphere

The `SkySphere` class renders a skybox using a sphere mesh, providing an illusion of vast distance. The sphere is extruded toward the camera so its position doesn't affect the visual result (the sky stays at "infinity").

Access through `sceneRenderer.skySphere` on the `SceneAppController`:

```ts
const sky = mySkySphere;
sky.load(myCubemapTexture);
// The scene renderer automatically draws it during its render loop
```

## Constructor

```ts
constructor(renderer: Renderer)
```

Requires a `Renderer` instance. The sphere geometry (128 segments, 32 stacks) is created lazily on first `draw()` call.

## Properties

### renderer
Reference to the owning `Renderer`.

### material
The sky's current `Material` instance. Defaults to a white-colored material if not set explicitly.

### depthTexture
Exposes the `depthTexture` from the shader's internal shadow renderer, if available.

### depthMap
Shorthand: `{ return this.shader?.depthMap; }` — the current shadow map texture.

## Methods

### load(cubemapTexture: Texture, Shader?, shaderParams?)
Loads a cubemap texture and initializes the sky sphere.

```ts
sky.load(myCubimapTexture);  // Uses default SkyCubeShader
sky.load(myCubemapTexture, MyCustomSkyShader, [param1, param2]);
```

- **cubemapTexture** — The cube map to use for the sky
- **Shader?** — Optional custom shader class (defaults to `SkyCubeShader`)
- **shaderParams?** — Parameters passed to the custom shader constructor

### draw()
Draws the sky sphere. The sphere is pushed away from the camera to prevent z-fighting:

```ts
sky.draw();
```

The draw distance is calculated as the sum of far plane (`-camera.far`) and near plane (`near`), multiplied by 10. The sphere then receives directional lights automatically from the renderer's light queue.

### destroy()
Cleans up shader, texture, renderBuffer, and sphere buffers:

```ts
sky.destroy();  // Call before disposing of the renderer
```

## Automatic Behavior

- **Lights** — Receives all directional lights from `renderer.renderQueue.lights` automatically during draw
- **Depth** — The sky sphere is positioned to avoid z-fighting (pushed far from camera)
- **Rotation** — The draw call includes the full view matrix (3x3 rotation component) to keep sky aligned with camera orientation
- **Depth test** — Configured as `GL_GREATER` to render behind most scene objects

## Example Usage

```typescript
import { createSceneApp } from 'bg2e-js';

const app = createSceneApp({ canvasId: 'appCanvas' });
await app.load();

// Load a sky sphere with our cubemap
const skySphere = SkySphere.FromSceneRenderer(app.scene);
await skyCube.load(starCubemapTexture);

// The scene renderer draws the sky sphere automatically
app.render();  // Sky is drawn behind everything in the scene
```
