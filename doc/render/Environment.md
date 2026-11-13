# Environment

`Environment.load({ textureUrl, environmentMapSize: [512, 512], irradianceMapSize: [16, 16] })`
creates one lighting cubemap, exposed as `environmentData` (also `environmentMap`).
Sizes must be square powers of two; the maximum must be at least four times the
minimum and fit the GPU cubemap limit. `specularMapSize` is deprecated and ignored.

Level 0 contains the original environment. Intermediate levels contain GGX
prefiltering with roughness `level / maxSpecularLod`. `irradianceLod` contains
diffuse irradiance; smaller levels complete the chain through 1×1. Both LODs are
computed from the sizes, so 2048/16 and 512/16 need no shader variants.

WebGL 1 requires `EXT_shader_texture_lod`. Generation uses temporary render
targets and GPU copies into individual mip levels. The sky cube explicitly reads
level 0; background drawing is independent of lighting-map generation and may be
replaced by a procedural background in the future.

PBR IBL units: 0 albedo, 1 normal, 2 metallic/roughness/emission/height (RGBA),
3 environment data, 4 lightmap data, 5 BRDF LUT, 6 shadow map. Unit 7 is reserved.

The source format currently remains RGBA8. HDR loading and half-float texture
support are not implemented; LOD metadata and lightmap interpretation do not
encode a component format.

LDR environment images are decoded from sRGB before generating the lighting
cubemap. All stored levels are linear radiance; SkyCubeShader encodes linear
cubemaps back to sRGB for display, while convolution and PBR sampling keep them
linear. The WebGL angular convolution stores E/π, so the BRDF must not divide by π
again. The native float convolution stores E and divides in its BRDF.

PBR output uses the native exponential tone curve (exposure 1) and gamma 2.2.
It tone-maps RGB once and preserves the authored alpha. Its default
brightness and contrast are neutral (0 and 1); these controls are display
adjustments, not sources of ambient light.
