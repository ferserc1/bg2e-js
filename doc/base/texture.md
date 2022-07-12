
# Texture

## Introduction

Stores the properties of a texture and provides the tools to serialize and deserialize these properties.

```js
import Texture, {
    TextureDataType,
    TextureWrap,
    TextureFilter,
    TextureWrapName,
    TextureFilterName,
    TextureDataTypeName
} from 'bg2e/base/Texture';

const t = new Texture();
t.dataType = TextureDataType.IMAGE;
t.fileName = "test.jpg";
t.size.x = 128;
t.size.y = 128;
t.wrapModeXY = TextureWrap.REPEAT;
t.minFilter = TextureFilter.LINEAR;
t.magFilter = TextureFilter.NEAREST_MIPMAP_LINEAR;
```

The `bg2e-base.Texture` class does not perform any loading of data associated with the texture, it only stores the data from which this loading can be performed. To effectively load the data into a usable texture, the corresponding framework of the graphics engine must be used.

The `bg2e-base.Texture` implements the [serialization/deserialization protocol](serialization.md).

## Reference

### Reference count

Textures can be used in more than one place, that is why texture objects contain a reference counter. Whenever we use a texture object, we must keep the counter updated to make sure that the textures in the graphical API are deleted correctly.

**`texture.references` (read):** Returns the current number of references of the texture.

**`incReferences()`:** Increases the references by one unit.

**`decReferences()`:** Decrements the references in one unit.

The object responsible for counting the references is the one containing the texture, for example, the [material](material.md).

### Objects

```js
import {
    TextureDataType,
    TextureWrap,
    TextureFilter,
    TextureTarget,
    ProceduralTextureFunction,
    TextureDataTypeName,
    TextureWrapName,
    TextureFilterName,
    TextureTargetName,
    ProceduralTextureFunctionName
} from 'bg2e/base/Texture';
```

They define properties of some texture attributes: data type, texture wrap, texture filter, etc. They are numeric values, which correspond to a name. When serializing the data, the name is used in `string` format, and internally in the graphics engine its numeric value is used. The specific meaning of each type of attribute depends on the renderer.


**`TextureDataType`**: Defines how to process the texture internal data:

- `NONE`: The texture does not contain any data.
- `IMAGE`: Image from a file.
- `IMAGE_DATA`: Image from a data string, in base64 format.
- `CUBEMAP`: Cubemap from a file.
- `CUBEMAP_DATA`: Cubemap from a base64 string.
- `VIDEO`: Video from a file.
- `PROCEDURAL`: Procedurally generated image.

**`TextureWrap`**:

- `REPEAT`
- `CLAMP`
- `MIRRORED_REPEAT`

**`TextureFilter`**:

- `NEAREST_MIPMAP_NEAREST`
- `LINEAR_MIPMAP_NEAREST`
- `NEAREST_MIPMAP_LINEAR`
- `LINEAR_MIPMAP_LINEAR`
- `NEAREST`
- `LINEAR`

**`TextureTarget`**:

- `TEXTURE_2D`
- `CUBE_MAP`
- `POSITIVE_X_FACE`
- `NEGATIVE_X_FACE`
- `POSITIVE_Y_FACE`
- `NEGATIVE_Y_FACE`
- `POSITIVE_Z_FACE`
- `NEGATIVE_Z_FACE`

**`ProceduralTextureFunction`**:

- `PLAIN_COLOR`
- `RANDOM_NOISE`
- `DYNAMIC_CUBEMAP`

For each texture attribute class there is another class with the same name and suffix `Name`, which is used to obtain the name of the corresponding attribute as a text string:

```js
console.log("Mag filter: ", TextureFilterName[t2.magFilter]);
```

**`TextureDataTypeName`**:

**`TextureWrapName`**:

**`TextureFilterName`**:

**`TextureTargetName`**:

**`ProceduralTextureFunctionName`**:

### Properties

**`texture.dirty`** (read) if true, some attributes of the texture has changed. This flag is used by the renderer system to determine if the API texture object must to be updated.

**`texture.dataType`** (read/write) sets or gets the texture data type.

**`texture.wrapModeX`** (read/write) sets or gets the texture wrap mode for the horizontal axis.

**`texture.wrapModeY`** (read/write) sets or gets the texture wrap mode for the vertical axis.

**`texture.wrapModeXY`** (write) sets the texture wrap mode for horizontal and vertical axis.

**`texture.magFilter`** (read/write) sets or gets the magnification filter.

**`texture.minFilter`** (read/write) sets or gets the minification filter.

**`texture.target`** (read/write) sets or gets the texture target.

**`texture.size`** (read/write) sets or gets the texture size. When it is used as setter, you can use any array-like parameter with at least two components. When it is used as getter, the returning value will be a 2D [`bg2e-math.Vec` vector](../../bg2e-math/doc/vector.md).

**`texture.fileName`** (read/write) sets or gets the texture file name.

**`texture.proceduralFunction`** (read/write) sets or gets the procedural function to use.

**`texture.proceduralParameters`** (read/write) sets or gets the procedural function parameters to use. The procedural function parameters must be a plain JSON object.

### Functions

**`texture.clone()`**: create a copy of `texture`.

**`texture.assign(t2)`**: assign the properties of `t2` to `texture`.

**`texture.setUpdated(updated=true)`** Used to mark a texture as updated. This attribute is used to update the `dirty` attribute. In normal circumstances, you shouldn't use this function.

**`serialize(sceneData)`**: see [serialization/deserialization protocol](serialization.md).

**`deserialize(sceneData)`**: see [serialization/deserialization protocol](serialization.md).

**`loadImageData(refresh = true)`**: It's used to load the native browser image object from the texture data (a file path, URL or procedural texture). This function is called automatically by the [`MaterialRenderer`](../render/MaterialRenderer.md) object. You can call it explicitly if you want to reload the image data for any reason.
