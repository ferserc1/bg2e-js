# VitscnjLoaderPlugin

Loads legacy `.vitscnj` and native C++ `.json` scene files. Deserializes node trees with components and recursively loads embedded model resources (`.bg2`/`.vwglb`) via a `Bg2LoaderPlugin` dependency.

```js
import VitscnjLoaderPlugin from 'bg2e-js/ts/db/VitscnjLoaderPlugin.ts';
import { registerComponents } from 'bg2e-js/ts/scene/index.ts';
import Loader, { registerLoaderPlugin } from 'bg2e-js/ts/db/Loader.ts';

// A Canvas/renderer must already exist before constructing Loader.
registerComponents();
registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "dist/" }));

const loader = new Loader();
const root = await loader.loadNode("../resources/test-scene.vitscnj");
```

Supported extensions: `["vitscnj", "json"]`

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

- The document contains a `scene` array of top-level node data objects. Native `.json` documents also require `fileType: "bg2e::scene"`.
- Each node has a `name`, optional `enabled` and `steady` flags, nested `children`, and serializable `components`
- The loader automatically sets its dependencies (`Bg2LoaderPlugin`) which are registered before the scene plugin

## Native lighting and environment

`LightSource` is registered as an alias of `LightComponent`. Its nested `lightData` reads native `type` strings, including `kTypeSun`, and the solar dimensions, source size and shadow sample count. Legacy flat light fields remain accepted. Unknown light types become disabled.

`Environment` reads procedural RGB colors, `skyboxBlur`, `skyboxVisible` and image references (`equirectangularTexture` or `environmentImage`). Relative assets resolve against the scene directory; an empty image selects procedural generation. Native drawable `path` and camera `cameraData` are also supported. The loader restores `currentPath` after success or failure.

See [Environment, Sun and native scene import](../render/Environment.md) for units, association rules, supported images and WebGL requirements.
