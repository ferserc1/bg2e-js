# ObjLoaderPlugin

Loads `.obj` text files, parsing geometry into `PolyList[]` arrays. Material library (`.mtl`) files are not supported yet — materials are created with defaults.

```js
import ObjLoaderPlugin from 'bg2e-js/ts/db/ObjLoaderPlugin.ts';

registerLoaderPlugin(new ObjLoaderPlugin());
```

Supported extensions: `["obj"]`

Supported resource types: `PolyList`, `Drawable`

See also: [`about.md`](index.md), [`loader-plugin.md`](loader-plugin.md)

## Usage example

```js
import ObjLoaderPlugin from 'bg2e-js/ts/db/ObjLoaderPlugin.ts';
import Loader, { registerLoaderPlugin } from 'bg2e-js/ts/db/Loader.ts';

registerLoaderPlugin(new ObjLoaderPlugin());

const loader = new Loader();
const polyLists = await loader.loadPolyList("../resources/model.obj");
// const drawable = await loader.loadDrawable("../resources/model.obj");
```

## Notes

- MTL (material library) loading is not implemented yet — see `TODO` comment in the source code
- When loading a Drawable, each PolyList gets a default Material instance with no material parameters set (see `buildDrawable` in the source)
