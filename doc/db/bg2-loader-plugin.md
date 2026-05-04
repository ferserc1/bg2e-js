# Bg2LoaderPlugin

Loads `.bg2` and `.vwglb` model files using the bg2io WASM library.

```js
import Bg2LoaderPlugin from 'bg2e-js/ts/db/Bg2LoaderPlugin.ts';
import Loader, { registerLoaderPlugin } from 'bg2e-js/ts/db/Loader.ts';

registerLoaderPlugin(new Bg2LoaderPlugin({ bg2ioPath: "dist/" }));

const loader = new Loader();
const drawable = await loader.loadDrawable("../resources/cubes.bg2");
```

Supported extensions: `["bg2", "vwglb"]`

Supported resource types: `PolyList`, `Drawable`, `Node`

See also: [about.md](about.md), [loader-plugin.md](loader-plugin.md)

## Constructor

```js
constructor({ bg2ioPath, preferedDrawableFormat, materialImportCallback })
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `bg2ioPath` | `string \| null` | `null` | Path to the bg2io WASM files directory. Pass `"dist/"` or `"./"` when serving from Vite dev server output folders. Only needed if bg2io is not in the default `/bg2io` location. |
| `materialImportCallback` | `(matData: any) => any \| undefined` | — | Callback invoked on each material parsed from the file. Return a modified copy to transform materials at load time, e.g., replace legacy material properties or inject custom shaders. |

## Material Import Callback

The `materialImportCallback` lets you transform material data before it is applied to models. It receives the raw parsed material JSON and returns the modified version:

```js
import Bg2LoaderPlugin from 'bg2e-js/ts/db/Bg2LoaderPlugin.ts';

registerLoaderPlugin(new Bg2LoaderPlugin({
    bg2ioPath: "dist/",
    materialImportCallback: (mat) => {
        // Replace class-based materials with type-based ones
        if (!mat.type && mat.class) {
            mat.type = mat.class;
            delete mat.class;
        }
        return mat;
    }
}));
```

### Notes

- `Bg2LoaderPlugin` lazy-loads the bg2io WASM wrapper and caches it globally
- For file version 1.4 backward compatibility, materials with a `class` property are automatically converted to `type`
- When loading PolyList resources, all polyLists from the file are returned as a single array
