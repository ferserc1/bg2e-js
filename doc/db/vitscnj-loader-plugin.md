# VitscnjLoaderPlugin

Loads `.vitscnj` scene files. Deserializes node trees with components and recursively loads embedded model resources (`.bg2`/`.vwglb`) via a `Bg2LoaderPlugin` dependency.

```js
import VitscnjLoaderPlugin from 'bg2e-js/ts/db/VitscnjLoaderPlugin.ts';
import Loader, { registerLoaderPlugin } from 'bg2e-js/ts/db/Loader.ts';

registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "dist/" }));

const loader = new Loader();
const root = await loader.loadNode("../resources/test-scene.vitscnj");
```

Supported extensions: `["vitscnj"]`

Supported resource types: `Node`

See also: [`about.md`](index.md), [`loader-plugin.md`](loader-plugin.md)

## Constructor

```js
constructor({ bg2ioPath, preferedDrawableFormat, materialImportCallback })
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `bg2ioPath` | `string \| null` | `"/bg2io"` | Path to the bg2io WASM files directory. |
| `preferedDrawableFormat` | `"vwglb" \| "bg2"` | `"bg2"` | Preferred drawable format for loading embedded resources like `.vwglb` or `.bg2`. Sets a global preference accessible via `VitscnjLoaderPlugin.PreferredDrawableFormat()`. |
| `materialImportCallback` | `(matData: any) => any \| undefined` | — | Same callback as in `Bg2LoaderPlugin`, applied to materials loaded from bg2/vwglb resources within the scene. |

## Static methods

**`VitscnjLoaderPlugin.PreferredDrawableFormat()`**: Returns the global preferred drawable format value (`"bg2"` or `"vwglb"`).

## Scene structure notes

- The scene file contains an array of top-level node data objects
- Each node has a `name`, optional `enabled` and `steady` flags, nested `children`, and serializable `components`
- The loader automatically sets its dependencies (`Bg2LoaderPlugin`) which are registered before the scene plugin
