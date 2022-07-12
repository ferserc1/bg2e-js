
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
