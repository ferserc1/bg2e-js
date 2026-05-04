# BRDFIntegrationMap

The `BRDFIntegrationMap` module exports a base64-encoded PNG image that contains a pre-integrated bi-directional reflectance distribution function (BRDF) lookup table. This texture is used for real-time image-based lighting with microfacet BRDF models, specifically the GGX NDF and Schlick-Disney approximation.

## Export

```typescript
import BRDFIntegrationMap from "./BRDFIntegrationMap";
```

## Usage Pattern

Typically loaded via `Image.FromBase64()` and used as a texture:

```typescript
const brdfIntegrationMap = await Image.FromBase64(BRDFIntegrationMap);
const texture = new Texture({ image: brdfIntegrationMap });
```

The BRDFLUT is then used in rendering shaders for environment mapping, specifically during the rendering of reflective surfaces with image-based lighting. The shader samples the LUT to approximate the result of double surface integrals for the GGX microfacet model.

## Technical Details

- **Format**: PNG
- **Size**: 512x512 pixels (exif pixel dimensions)
- **Color Space**: sRGB IEC61966-2.1
- **Channels**: 3 (Red, Green) — represents the pre-integration result

### LUT Encoding

The 512x512 texture is organized as two halves:
- **Upper half** (rows 0–256): G-channel stores metallic value (vertical), R-channel roughness (horizontal)
- **Lower half** (rows 256–512): Metallic is encoded in the vertical dimension, roughness horizontally

The stored values represent the pre-integrated result of `F * dot(dot(N,L), V)` as a floating point format, suitable for image-based lighting calculations.
