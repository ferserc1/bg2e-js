# Environment, Sun and native scene import

`render.Environment.load()` generates a linear HDR sky, GGX specular roughness mips and diffuse irradiance. With an empty `textureUrl`, it generates the procedural sky used by the native SDK. A procedural environment is also the default for scenes without an Environment component.

## Cubemap layout and lighting units

`environmentData` (also `environmentMap`) is one lighting cubemap. `environmentMapSize` defaults to `[512, 512]` and `irradianceMapSize` to `[16, 16]`. Sizes must be square powers of two, with the maximum at least four times the minimum and within the GPU limit. The legacy `specularMapSize` option does not determine roughness levels.

Level 0 holds sky radiance. Intermediate levels hold GGX prefiltering at roughness `level / maxSpecularLod`. `irradianceLod` holds diffuse irradiance; smaller levels complete the chain through 1×1. LODs derive from the endpoint sizes. WebGL convolution stores E/π, whereas native convolution stores E and divides in its BRDF. PBR output retains the native exponential tone curve at exposure 1, gamma 2.2 and neutral brightness/contrast.

Specular prefiltering uses 256 GGX samples and explicit source LOD selected from each sample's probability density and solid angle, matching the native algorithm. The source sky has a separate ordinary mip pyramid for spatial averaging; these mips are never substituted for the output's authored roughness/irradiance levels. This prevents isolated high-energy solar samples from creating bright squares across rough reflections while retaining the disk's HDR radiance at level 0.

PBR texture units remain: 0 albedo, 1 normal, 2 metallic/roughness/emission/height, 3 environment data, 4 lightmap data, 5 BRDF LUT, 6 shadow map; unit 7 is reserved.

## Importing scenes authored in C++

Register the normal components and scene loader, then load the native document directly:

```ts
import Loader, { registerLoaderPlugin } from 'bg2e-js/ts/db/Loader';
import VitscnjLoaderPlugin from 'bg2e-js/ts/db/VitscnjLoaderPlugin';
import { registerComponents } from 'bg2e-js/ts/scene/index';

registerComponents();
registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: 'bg2io/' }));
const sceneRoot = await new Loader().loadNode('/assets/scene.json');
```

The `.json` document must have `fileType: "bg2e::scene"` and a `scene` array. Legacy `.vitscnj` documents remain supported. Native `LightSource` components read nested `lightData`, including `type: "kTypeSun"` (numeric type 6). Native drawable `path` and camera `cameraData` are accepted. Relative image/model references resolve against the scene directory.

Environment fields:

| JSON / component property | Default | Meaning |
| --- | --- | --- |
| `skyHorizonColor` | `[0.55, 0.65, 0.8]` | Linear RGB at the horizon |
| `skyZenithColor` | `[0.06, 0.22, 0.6]` | Linear RGB at the zenith |
| `groundColor` | `[0.04, 0.035, 0.025]` | Linear RGB below the horizon |
| `equirectangularTexture` | `""` | Image reference; `environmentImage` is an input alias |
| `skyboxVisible` / `showSkybox` | `true` | Background visibility; IBL remains active |
| `skyboxBlur` | `0` | Normalized specular roughness for the background, clamped to `[0, 1]` |

Color components must be finite and within `[0, 1]`; alpha is ignored. Missing color fields restore the native defaults. Missing/empty image fields clear an earlier image. Legacy intensity and map-size fields are still read, preserving `0` and `false` where applicable.

Browser-supported SDR images and Radiance `.hdr` RGBE images are supported. HDR scanline RLE and flat/legacy pixels use Y-then-X axes; other axis orders and formats such as EXR are rejected. HDR pixels are uploaded as float32 without sRGB decoding. SDR pixels are decoded once to linear light. Generation, convolution and sampling retain HDR radiance.

## Solar association

Put `LightComponent` with `light.type = LightType.SUN` and `EnvironmentComponent` on the same node. The first Environment in enabled scene traversal is active. Only that component filters its same-node Sun. Disabled ancestors exclude the association; an image environment disables it while retaining solar properties. A Sun elsewhere remains a directional emitter with distance scaling.

World-transformed local **+Z** is the emitted ray direction; its opposite points toward the visible sun. Rotation, including parent transforms, changes solar elevation. Translation does not. World **+Y** defines the horizon.

| Light property | Default | Units |
| --- | --- | --- |
| `solarSize` | `1` | Multiples of the solar radius, 695700 km |
| `solarDistanceMillionKm` | `149.6` | Millions of km |
| `intensity` | Authored value | Existing engine units at 149.6 million km |

Size and distance must be finite and positive. Angular radius is `asin(clamp(solarSize * 0.6957 / solarDistanceMillionKm, 1e-12, 0.999999))`, approximately 0.266 degrees by default. Intensity scales by `(149.6 / solarDistanceMillionKm)^2`.

`evaluateSolarLight()` follows native `base/SolarLight.cpp`: 64 midpoint samples through a 6360 km planet's 60 km atmospheric shell, exponential Rayleigh/aerosol densities and RGB Beer–Lambert transmission. The fraction of the disk above the horizon attenuates direct lighting. Authored color and intensity remain unchanged.

The procedural shader follows native `procedural_sky.frag.glsl`: horizon/zenith/ground colors, daylight, warm twilight and a dim night residual. Sky/specular maps include a footprint-filtered solar disk. Diffuse IBL uses a disk-free sky to avoid duplicating direct solar illumination. The unblurred background uses that disk-free map plus a screen-resolution analytic disk; blurred backgrounds use the filtered specular map. Without a linked Sun, the original fixed procedural sun is retained.

Changes to active colors, image, resolution or solar state regenerate maps at `SceneRenderer.frame()`. Generation is synchronous. `Environment.load()` builds a replacement before publishing it, so a failed build retains the prior resources. Direct users can pass `skyHorizonColor`, `skyZenithColor`, `groundColor` and a derived `solar` state to `load()`; `backgroundMap` and `solar` are available for custom background rendering.

WebGL generation requires `EXT_shader_texture_lod`, `OES_texture_float`, `OES_texture_float_linear` and `WEBGL_color_buffer_float`. Unsupported GPUs report an error rather than clipping the solar disk to an SDR texture.

## Optional soft shadows

```ts
await sceneRenderer.init({ shadowMapSize: 2048, softShadows: true });
// Can also be changed at runtime before the next frame:
sceneRenderer.softShadows = false;
```

The default is hard shadows. Soft shadows use PCSS: a blocker search estimates caster/receiver separation, then depth comparisons filter over the resulting penumbra. Each phase uses `light.shadowSamples` (default 8), bounded to 1–32. A zero/one sample setting or zero source size selects hard shadows. For directional lights, `sourceSize` is an angular radius in **degrees**, matching the native shadow-query implementation. A Sun uses its physical angular radius and ignores the stored `sourceSize`.

This is a raster approximation to native ray-query soft shadows. It applies to the current renderer's **single main directional/Sun shadow map**; it does not add omnidirectional shadow maps or ray tracing. Large kernels are bounded to a quarter of the map's UV extent. Low resolutions, finite shadow-camera coverage and low sample counts can produce aliasing or miss thin blockers. Only the owning light's direct contribution is shadowed; other lights and IBL remain independent.

The lightmap sample (`npm run dev:lightmap`) includes a Soft shadows toggle. Automated CPU checks run with `npm --prefix repos/bg2e-js test`. For GPU checks, start Vite at the repository root and open `/repos/bg2e-js/tests/gpu-environment.html`; it checks HDR preservation, failed regeneration, solar rotation, analytic/blurred sky, PCSS rendering and disabled-environment fallback.
