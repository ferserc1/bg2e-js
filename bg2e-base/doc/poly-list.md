# PolyList

## Introduction

Stores the geometry data of a 3D mesh.

```js
import { PolyList } from 'bg2e-base';

const plist = new PolyList();

list.vertex = [
    1, 0, 0,
    0, 1, 0,
    1, 1, 0
];

plist.normal = [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1
];

plist.texCoord0 = [
    1, 0,
    0, 1,
    1, 1
];

plist.index = [
    0, 1, 2
];

console.log(plist.vertex);
console.log(plist.normal);
console.log(plist.texCoord0);
```

The tangent array is generated automatically using the vertex and texCoord0 arrrays. For that reason, if the mesh does not have texture coordinate information, it will not be possible to generate tangents, and this may cause display problems when using shaders that require tangents (e.g. displacement maps, normal maps or bump maps).

## Reference

### Exported objects

```js
import { BufferType, DrawMode } from 'bg2e-base';
```

**`BufferType`**: Identifies a buffer type. It is not used directly in the PolyList class, but it is used in other elements of the graphics engine, for example, when marking input attributes in a shader.

- `BufferType.VERTEX` Vertex buffer
- `BufferType.NORMAL` Normal buffer
- `BufferType.TEX_COORD_0` Texture coordinates 0 buffer
- `BufferType.TEX_COORD_1` Texture coordinates 1 buffer
- `BufferType.TEX_COORD_2` Texture coordinates 2 buffer
- `BufferType.COLOR` Color buffer
- `BufferType.TANGENT` Tangent buffer
- `BufferType.INDEX` Index buffer

**`DrawMode`**: Used to specify the settings to be used by the graphics engine to draw the geometry contained in the polyList.

- `DrawMode.TRIANGLES`
- `DrawMode.TRIANGLE_FAN`
- `DrawMode.TRIANGLE_STRIP`
- `DrawMode.LINES`
- `DrawMode.LINE_STRIP`

### `PolyList` attributes

#### Metadata attributes

Metadata attributes are used for mesh cataloging and to provide miscellaneous information to the graphics engine or application. They do not influence the display of the object.

**`plist.name`**: (read/write)

**`plist.groupName`**: (read/write)

#### Geometric attributes

Geometric attributes are used to determine the shape of the mesh, and attributes that depend on geometric information, for example, the position in space of vertices in local coordinates, texture coordinates or the drawing mode (`DrawMode`).

**`plist.drawMode`**: (read/write)

**`plist.vertex`**: (read/write)

**`plist.normal`**: (read/write)

**`plist.texCoord0`**: (read/write)

**`plist.texCoord1`**: (read/write)

**`plist.texCoord2`**: (read/write)

**`plist.color`**: (read/write)

**`plist.index`**: (read/write)

**`plist.tangent`**: (read) Gets the tangent array, which is generated from the vertex array, texCoord0 and indexes. It is recommended that you do not use this accessor until you have configured the rest of the arrays. If changes are made to these arrays, and the new array length is the same as the old one, the tangents array must be regenerated (see `rebuildTangents()` function).

**`plist.validTangents`**: (read) Returns true if the tangent array is valid, or false otherwise. The tangent array is invalid when it does not exist, or its size does not match the vertex or texture coordinate arrays. If the tangents are invalid, it will be automatically regenerated the next time the tangents are obtained using the `tangent` attribute.

#### Material attributes

Some display attributes that do not depend on the mesh may be processed in the mesh for efficiency reasons. For example, if a mesh is hidden, it is better not to send any information to the renderer than to ignore the output in the fragment shader. These attributes are stored in the mesh.

**`plist.visible`**: (read/write)

**`plist.visibleToShadows`**: (read/write)


### Functions

**`plist.rebuildTangents()`**: Re-generates the tangents. When the array of vertices and/or texture coordinates is modified, it may happen that the tangents are still valid. To check if the tangents are valid, only three conditions are taken into account: that the tangent array is not `null`, that its size matches the vertex array and that its size matches the texture coordinate array.

However, it may be the case that texture coordinates or vertices are changed, but the size of the array is not changed (for example, if the number of vertices is the same, but the positions change). In this case, the tangent array will remain valid and unchanged, but the tangent information will not be consistent with the new geometry. In these cases, the `rebuildTangents()` function must be called manually.


### Static functions

**`PolyList.ApplyTransform(plist, trx)`**: Modify the vertex, normal and tangent arrays of the `plist` mesh with the transformation matrix `trx`.


