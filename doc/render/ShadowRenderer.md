# ShadowRenderer

The `ShadowRenderer` class handles shadow map rendering. It creates a texture render target that captures depth from the light's perspective, used for shadow mapping in rendered scenes.

## Constructor

```ts
constructor(renderer: Renderer)
```

Creates a renderer with default shadow map render distance (100 units) and debug mode disabled.

## Properties

### renderer
Returns the owning `Renderer` instance.

### size : Vec
Current shadow map resolution (e.g., 1024x1024). Returns a Vec(0, 0) if not created yet.

### shadowMapRenderDistance : number
Distance from the light's target point where the shadow map viewport extends. Controls how far shadows are cast (default: 100 units).

### debug : boolean
Enables or disables debug visualization (spheres and arrows showing camera/light positions).

### depthTexture : Texture | null
Exposes the shadow map's depth texture. Set via `shadowRenderer.depthTexture = ...` (used internally by the render queue to pass depth info to shaders).

## Methods

### create(size?: Vec) : Promise<void>
Creates the shadow map render buffer with the given dimensions.

```ts
await shadowRenderer.create(new Vec(1024, 1024));  // Default size
await shadowRenderer.create(new Vec(512, 512));     // Smaller for performance
```

Internally:
- Creates a color texture (`ShadowMap_WxH`) for the light's shadow map
- Creates a depth texture (`ShadowMapDepth_WxH`) via `DEPTH_ATTACHMENT`  
- Renders the scene from the light's perspective to generate shadows
- Stores results in `_texture` and `_depthTexture`

### setShadowMapRenderDistance(distance: number)
Sets how far the shadow map extends in world units before clipping happens.

### setDebug(enabled: boolean)
Toggles debug visualization mode showing camera/light positions and directions.

### getLightTransform(camera, light) : Mat4
Computes the light's world transform matrix for shadow mapping. The camera and light must be Nodes or provide Camera/LightComponent:

```ts
const transform = shadowRenderer.getLightTransform(skyPlane, camera);  // Works for Node inputs
```

### update(camera, lightComponent, renderQueue) : void
Updates the shadow map from the current light position. Renders scene with the depth shader to generate the shadow texture, then sets it on the light component for use:

```ts
shadowRenderer.update(cam, skyPlane.component.lightComponent, scene.renderQueue);
```

Sets:
- `lightComponent.depthTexture` = shadow map depth texture
- `lightComponent.viewMatrix` = inverted light transform

## Typical Usage Pattern

```typescript
const shadowRenderer = new ShadowRenderer(renderer);
await shadowRenderer.create(new Vec(1024, 1024));

// In the render loop:
shadowRenderer.update(camera, lightComponent, scene.renderQueue);
```


