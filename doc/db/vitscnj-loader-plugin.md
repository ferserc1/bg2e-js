# VitscnjLoaderPlugin

Loads legacy `.vitscnj` and native C++ `.json` scene files. Deserializes node trees with components and loads referenced `.bg2` models via a `Bg2LoaderPlugin` dependency.

```js
import { db, scene } from 'bg2e-js';

// A Canvas/renderer must already exist before constructing Loader.
scene.registerComponents();
db.registerLoaderPlugin(new db.VitscnjLoaderPlugin());

const loader = new db.Loader(canvas);
const root = await loader.loadNode('/scenes/room.json');
```

Supported extensions: `["vitscnj", "json"]`

Supported resource types: `Node`

See [bg2e-db](index.md) and [LoaderPlugin](loader-plugin.md).

## Constructor

```js
constructor({ bg2ioPath, materialImportCallback })
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `bg2ioPath` | `string \| null` | `null` | Override the loader's WASM directory. The loader defaults to `./bg2io/`. |
| `materialImportCallback` | `(matData: any) => any \| undefined` | — | Same callback as in `Bg2LoaderPlugin`, applied to materials from referenced BG2 models. |

## Scene structure notes

- Both extensions require a `scene` array of top-level node objects. The optional `fileType` must be `"bg2e::scene"`. The version is informational.
- Nodes can supply `name`, `enabled`, `steady`, `children`, and `components`. A malformed top-level entry fails the import. The loader skips malformed child and component entries with a diagnostic.
- The loader automatically sets its dependencies (`Bg2LoaderPlugin`) which are registered before the scene plugin

## Native drawable instances

This abridged example follows the JSON emitted by the C++ writer for a chair with
one polygon list. It shows the first submesh and the material fields relevant to
its texture and color.

```json
{
  "fileType": "bg2e::scene",
  "version": { "major": 1, "minor": 0, "rev": 0 },
  "scene": [
    {
      "type": "Node",
      "name": "West chair",
      "enabled": true,
      "steady": false,
      "components": [
        {
          "type": "Transform",
          "priority": 0,
          "transformMatrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 0, 0, 1]
        },
        {
          "type": "DrawableInstance",
          "priority": 0,
          "path": "models/chair.bg2",
          "rayTracingEnabled": true,
          "submeshes": [
            {
              "name": "Seat",
              "groupName": "Furniture",
              "visible": true,
              "transform": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0.25, 0, 1],
              "material": {
                "albedo": [0.78, 0.27, 0.17, 1],
                "albedoTexture": "textures/chair-west.png",
                "normalTexture": null
              }
            }
          ]
        }
      ],
      "children": []
    }
  ]
}
```

The instance can load its BG2 independently of any `Drawable` owner. For
`/scenes/room.json`, its model resolves to `/scenes/models/chair.bg2` and the
override image resolves to `/scenes/textures/chair-west.png`. Inherited material
images resolve relative to the BG2 directory, `/scenes/models/` in this example.
Explicit `null` clears a texture assignment. An omitted field keeps the
original value.

`submeshes[i]` corresponds to polygon list `i` in the BG2, in file order.
Names and groups are metadata. A length mismatch produces a diagnostic.
Missing or invalid entries use the originals and surplus entries are ignored.
The column-major submesh matrix is applied after the geometry and before the
node's world transform. A complete C++ export has already accounted for the
transforms baked into its published BG2 geometry.

If the model or a required image fails, the loader logs the node and reference.
The component remains accessible through `node.drawableInstance`, exposes
`path` and `loadError`, and draws when preparation succeeds. After restoring
the files, call `await node.drawableInstance.retryResources()` to apply the
authored fields again. The result is `true` when the binding is ready.

The browser imports both reference saves and complete exports. C++ writes
scene documents and BG2 files. The browser ignores ray-tracing fields.

Run `npm run dev:instance_load` to open the standalone native import example.
**Complete export** opens the C++ scene with two colored instances and baked
lightmaps. **Reference save** opens a C++ reference export derived from the same
assets. The green cube has one deliberately offset face and one deliberately
hidden face to illustrate submesh transforms and visibility. **Retry floor**
recovers a simulated first-load failure.

See [the drawable cache and programmatic example](loader.md#drawable-cache)
and [native material imports](../base/material.md#native-material-imports).

## Native lighting and environment

`LightSource` is registered as an alias of `LightComponent`. Its nested `lightData` reads native `type` strings, including `kTypeSun`, and the solar dimensions, source size and shadow sample count. Legacy flat light fields remain accepted. Unknown light types become disabled.

`Environment` reads procedural RGB colors, `skyboxBlur`, `skyboxVisible` and image references (`equirectangularTexture` or `environmentImage`). Relative assets resolve against each scene's directory. An empty image selects procedural generation. Native drawable `path` and camera `cameraData` are also supported.

See [Environment, Sun and native scene import](../render/Environment.md) for units, association rules, supported images and WebGL requirements.
