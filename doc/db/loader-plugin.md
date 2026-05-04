# LoaderPlugin

Base class for all file loader plugins. Override its properties and methods to support a new file type. See [about.md](about.md) for usage patterns.

```js
import LoaderPlugin from 'bg2e-js/ts/db/LoaderPlugin';
```

## Properties

**`supportedExtensions`**: (override) Array of file extensions recognized by the plugin, e.g. `["obj", "dae"]`.

**`resourceTypes`**: (override) Array of resource types the plugin can load, from `ResourceType`.

**`dependencies`**: Returns plugins this loader depends on. Loaded automatically before the plugin is registered (see `registerLoaderPlugin`). Override to return an array; default returns empty.

## Methods

**`load(path, type, loader)`**: (override) Load a file at the given path into the specified resource type. Receives the owning `Loader` for accessing cache and resolving relative paths.

**`loadBuffer(buffer, format, dependencies, type, loader)`**: (override) Load binary buffer-based files such as drag-and-drop file inputs. `dependencies` holds remaining files from the drop zone not used by this plugin, for resolving relative resources like textures.

**`write(path, data, type, writer)`**: (deprecated) Write a resource to disk. The write API is deprecated and will be removed in a future version.
