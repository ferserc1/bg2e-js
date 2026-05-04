# Loader

Main facade for loading resources. Maintains a cache keyed by path and resource type, and dispatches to registered plugins based on file extension.

```js
import Loader from 'bg2e-js/ts/db/Loader';
```

See also: [about.md](about.md), [loader-plugin.md](loader-plugin.md)

## Basic usage

```js
import Loader, { registerLoaderPlugin } from 'bg2e-js/ts/db/Loader.ts';
import VitscnjLoaderPlugin from 'bg2e-js/ts/db/VitscnjLoaderPlugin.ts';
import ObjLoaderPlugin from 'bg2e-js/ts/db/ObjLoaderPlugin.ts';

registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "dist/" }));
registerLoaderPlugin(new ObjLoaderPlugin());

const loader = new Loader();
const root = await loader.loadNode("../resources/test-scene.vitscnj");
```

## Constructor

**`Loader(canvas?: Canvas \| null)`** — Creates a loader associated with a canvas. Falls back to the global first canvas if omitted.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `canvas` | `Canvas` (get) | The canvas associated with this loader. |
| `currentPath` | `string` (get/set) | Base path used for resolving relative resource paths. Loaders change this automatically when processing nested resources (e.g., `VitscnjLoaderPlugin` sets it to the directory of the scene file). |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `clearCache()` | — | Wipes the resource cache. Call when resources on disk have changed and stale data must be invalidated. |
| `findCache(path, type)` | `any` | Checks if a resource of the given `ResourceType` is cached for the specified path. Returns `undefined` if not found. |
| `loadResource(path, type)` | `Promise\<any\>` | Core load method: resolves path against `currentPath`, checks cache, delegates to the matching registered plugin by file extension. |
| `loadPolyList(path)` | `Promise\<PolyList\>` | Convenience method for loading PolyList resources. |
| `loadDrawable(path)` | `Promise\<any\>` | Convenience method for loading Drawable resources. |
| `loadDrawableBuffer(buffer, format, dependencies)` | `Promise\<any\>` | Convenience method for loading Drawable from an ArrayBuffer (used by drag-and-drop). |
| `loadNode(path)` | `Promise\<any\>` | Convenience method for loading a Node tree from `.vitscnj` scene files. |
| `loadTexture(path)` | `Promise\<Texture\>` | Convenience method for loading texture assets. |
| `loadMaterial(path)` | `Promise\<any\>` | Convenience method for loading material assets. |
| `setupModelDropZone(dropZone, fileFormats, cb)` | — | Sets up drag-and-drop loading for models on a DOM element. Accepts an array of file formats (e.g., `["bg2","vwglb"]`) and a callback that receives the loaded Drawable for each dropped file. See example below. |

## Drag and drop example

```js
import Loader from 'bg2e-js/ts/db/Loader.ts';

const loader = new Loader();
loader.setupModelDropZone(document.body, ["bg2", "vwglb"], drawable => {
    const modelNode = new Node("Dropped model");
    modelNode.addComponent(drawable);
    this.sceneRoot.appendChild(modelNode);
});
```
