
# Material

Stores the data of a material.

```js
import Material from 'bg2e/base/Material';

const m = new Material();
```

## Objects

```js
import {
    MaterialType,
    MaterialAttributeNames
} from 'bg2e-base';
```

**`MaterialType`**:

- `MaterialType.PBR`: default material type.

**`MaterialAttributeNames`**: Contiene la lista de nombres de atributo de material.

- `MaterialAttributeNames.type`
- `MaterialAttributeNames.diffuse`
- `MaterialAttributeNames.diffuseScale`
...

### Attribute types

Some material attributes are of native JavaScript types, but others are of concrete types. We can summarize all attribute types in the following categories:

- `color-texture`: The attribute can only contain a [`Color`](color.md) or a [`Texture`](texture.md).
- `vector`: The attribute can only contain a ['bg2e-math.Vec'](../../bg2e-math/doc/vector.md) object, and more specifically, a vector of two elements. In the case of a material, this type is only used in `size` attribute, and the size in a material will always be 2D.
- `color`: The attribute can only contain a [`Color`](color.md) object.
- `value-texture`: The attribute can contain a native JavaScript `number` value or a [`Texture`](texture.md).
- `primitive`: The attribute can contain other primitive JavaScript types, specifically, `number` or `boolean`.

This type distinction is mainly used to serialize and deserialize texture attributes (see section on [serialize/deserialize protocol](serialization.md)).

It is possible to query the types that correspond to each texture attribute by using the objects `ColorTextureAttributes`, `ValueTextureAttributes`, `VectorAttributes`, `ColorAttributes` y `PrimitiveTypeAttributes`

```js
import {
    ColorTextureAttributes,
    ValueTextureAttributes,
    VectorAttributes,
    ColorAttributes,
    PrimitiveTypeAttributes
} from 'bg2e-base';

console.log("Color-texture attributes: ");
console.log(ColorTextureAttributes);
console.log("ValueTextureAttributes :");
console.log(ValueTextureAttributes);
...
```

## Attributes

The interpretation given to each of the attributes of a material depends on the material type and the renderer. The material type is simply a text string that identifies it with a name, but it is the renderer that will interpret this data to generate the appearance of the objects.

In general, all attributes of a material are optional. For example, there are material types that only use color or texture.

What does not change is the data that is stored in the material. Each attribute can be of one or more types. For example, the color of the object is obtained with the `diffuse` attribute, which can be a [`Color`](color.md) or a [`Texture`](texture.md).


**`material.type`**: (read/write) Set the `MaterialType`

**`material.diffuse`**: (read/write) `color-texture`
 
**`material.diffuseScale`**: (read/write) `vector`

**`material.diffuseUV`**: (read/write) `primitive (number)`

**`material.alphaCutoff`**: (read/write) `primitive (number)`

**`material.isTransparent`**: (read/write) `primitive (boolean)`

**`material.metallic`**: (read/write) `value-texture`

**`material.metallicChannel`**: (read/write) `primitive (number)`

**`material.metallicScale`**: (read/write) `vector`

**`material.metallicUV`**: (read/write) `primitive (number)`

**`material.roughness`**: (read/write) `value-texture`

**`material.roughnessChannel`**: (read/write) `primitive (number)`

**`material.roughnessScale`**: (read/write) `vector`

**`material.roughnessUV`**: (read/write) `primitive (number)`

**`material.fresnel`**: (read/write) `color`

**`material.lightEmission`**: (read/write) `value-texture`

**`material.lightEmissionChannel`**: (read/write) `primitive (number)`

**`material.lightEmissionScale`**: (read/write) `vector`

**`material.lightEmissionUV`**: (read/write) `primitive (number)`

**`material.ambientOcclussion`**: (read/write) `value-texture`

**`material.ambientOcclussionChannel`**: (read/write) `primitive (number)`

**`material.ambientOcclussionUV`**: (read/write) `primitive (number)`

**`material.normal`**: (read/write) `color-texture`

**`material.normalScale`**: (read/write) `vector`

**`material.normalUV`**: (read/write) `primitive (number)`

**`material.height`**: (read/write) `value-texture`

**`material.heightChannel`**: (read/write) `primitive (number)`

**`material.heightScale`**: (read/write) `vector`

**`material.heightUV`**: (read/write) `primitive (number)`

**`material.heightIntensity`**: (read/write) `primitive (number)`

**`material.castShadows`**: (read/write) `primitive (boolean)`

**`material.cullFace`**: (read/write) `primitive (boolean)`

**`material.unlit`**: (read/write) `primitive (boolean)`

## Funciones

**`material.clone()`**: Returns a copy of `material`.

**`material.assign(other)`**: Assign the attributes of `other` to `material`.

**`material.serialize(sceneData)`**: see the [serialization/deserialization protocol](serialization.md)

**`material.deserialize(sceneData)`**: see the [serialization/deserialization protocol](serialization.md)

**`material.destroy()`**: Decrements the references of all Texture objects contained in the material.


## Native material imports

`deserialize` resolves texture paths against the declaring document's directory. `deserializeWithDependencies` resolves each source by the dropped file's name. Both accept `isUnlit` with the legacy `unlit` fallback, honor explicit `alphaCutoff: 0`, and use the SDK defaults for omitted numeric values. A material's `visible` flag and its submesh's visibility both apply to drawing. `doubleSided` controls face culling, with the legacy `cullFace` flag as a fallback.

`await original.withOverrides(fields, sceneDirectory)` creates an independent appearance. An omitted texture source keeps the original, `null` clears it, and a filename resolves against the scene directory with fresh sampler defaults. A settings record on its own updates the inherited sampler. The UV set, scale and channel retain their original values until overridden. Copies can share decoded pixels and keep independent textures and sampler state.

The six texture settings records are `albedoTextureSettings`, `normalTextureSettings`, `metalnessTextureSettings`, `roughnessTextureSettings`, `lightEmissionTextureSettings` and `ambientOcclussionSettings`. WebGL supports minification, magnification, mipmaps, horizontal and vertical wrap, and the linear data flag. Clamp-to-border uses clamp-to-edge. The 2D WebGL path uses clamp-to-edge and base-level filtering for non-power-of-two textures in WebGL 1. The 2D samplers have no W axis, and the SDK's WebGL 1 samplers omit per-texture `minLod`, `maxLod` and `bias`.

The PBR renderer stores metalness, roughness, emission and height in a shared RGBA8 texture. It applies each supported inversion to the selected source channel when building that texture. The packed texture has a common filter and wrap state when sampled by the final shader. The basic PBR shader uses UV0 and samples metalness and roughness directly. Native `isSolid` and `refractionFactor` are read as material metadata. The web render queue uses its existing transparency pipeline.

## Baked indirect lighting

Native-compatible JSON uses `indirectTextureMode` (`ao`, `bakedAO`, `bakedGI`),
`ambientOcclussion`, `ambientOcclussionUV`, `ambientOcclussionScale`,
`ambientOcclussionChannel` and `ambientOcclussionSettings` (`color: 2` for linear,
`mipmaps: false` to disable mipmaps). The historical spelling is intentional.
Missing mode defaults to scalar AO. Baked modes sample RGB from the selected UV set
and ignore the channel selector. Importing a baked map or applying settings to it
forces linear interpretation. A mode-only override retains the inherited sampler.
Baked AO multiplies
indirect lighting; baked GI multiplies diffuse indirect lighting and sheen while
preserving specular and direct lighting. Missing maps use neutral white.

Lightmap data is bound independently of the RGBA8 material pack, allowing future
floating-point formats without changing its interpretation. Height occupies the
pack alpha but height mapping remains a shader TODO. Native `lightEmission` is a
numeric intensity; its source texture is `lightEmissionTexture`.

BG2 files store V in the legacy convention. The native mesh loader converts V
to `1 - V`, while the browser keeps the stored UVs and flips image rows in its
image loader. These are equivalent: baked maps must not receive an additional
upload flip. No gamma decoding is applied to baked multipliers.
