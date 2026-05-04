# ObjParser

Parses `.obj` text files into `PolyList[]` arrays, extracting vertex positions (`v`), normals (`vn`), texture coordinates (`vt`), faces (`f`), groups (`g`) and material names (`usemtl`).

```js
import ObjParser from 'bg2e-js/ts/db/ObjParser';

const parser = new ObjParser(objText);
console.log(parser.polyListArray);  // Array of PolyList objects
```

See also: [`about.md`](index.md), [`obj-loader-plugin.md`](obj-loader-plugin.md)

## Constructor

**`ObjParser(objText: string)`**: Initializes the parser with OBJ text content. Tokenizes lines by first character to dispatch parsing (`v` → vertex, `vn` → normal, `vt` → texcoord, `g` → group name, `usemtl` → material name, `s` → smoothing groups), `f` → face/geometry). Supports line continuation with backslash (`\`). Ignores comment lines starting with `#`.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `polyListArray` | `PolyList[]` | Read-only accessor returning the parsed geometry arrays. Each PolyList corresponds to a group or mesh in the OBJ file. |

## Parsing details

- Vertex positions, normals and texture coordinates are stored internally in separate arrays
- Faces define geometry through vertex/normal/texcoord indexing with support for polygons via triangulation 
- Group names from `g` statements are stored in the PolyList's `name` property
- Material names from `usemtl` statements are stored temporarily and can become group/PolyList names if PolyList has no name yet  
- `.mtl` files are parsed but not loaded — `ObjLoaderPlugin` marks MTL loading as a TODO
