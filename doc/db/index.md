# bg2e-db

Module file loading API. Provides a plugin-based system for loading 3D models, textures, materials and scene files from disk or network.

## Overview

The db module uses a two-level architecture:

1. **Plugins** declare which file extensions and resource types they handle via `supportedExtensions`
2. A **global plugin database** routes load calls by extension to the matching plugin

Plugins are registered at startup. The `Loader` class maintains a cache and delegates to plugins based on file extension.

```js
import Loader, { registerLoaderPlugin } from 'bg2e-js/ts/db/Loader.ts';
import VitscnjLoaderPlugin from 'bg2e-js/ts/db/VitscnjLoaderPlugin.ts';
import ObjLoaderPlugin from 'bg2e-js/ts/db/ObjLoaderPlugin.ts';

registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "dist/" }));
registerLoaderPlugin(new ObjLoaderPlugin());

const loader = new Loader();
const root = await loader.loadNode("../resources/test-scene.vitscnj");
```

## Plugin database

The plugin database maps file extensions and resource types to plugins. There are two databases: one for reading (used by the `Loader`) and one for writing (not documented — the write API is deprecated).

- [loader-plugin.md](loader-plugin.md) — `LoaderPlugin` base class for reading plugins
- [bg2-loader-plugin.md](bg2-loader-plugin.md) — Loads `.bg2` and `.vwglb` models
- [obj-loader-plugin.md](obj-loader-plugin.md) — Loads `.obj` text files  
- [vitscnj-loader-plugin.md](vitscnj-loader-plugin.md) — Loads `.vitscnj` scene files
- [obj-parser.md](obj-parser.md) — OBJ text file parser (internal tool used by `ObjLoaderPlugin`)
- [loader.md](loader.md) — `Loader` class, facade for loading resources
