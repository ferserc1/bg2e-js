# Loader

Main facade for loading resources. Maintains a cache keyed by path and resource type, and dispatches to registered plugins based on file extension.

See [bg2e-db](index.md) and [LoaderPlugin](loader-plugin.md).

## Basic usage

```js
import { db, scene } from 'bg2e-js';

scene.registerComponents();
db.registerLoaderPlugin(new db.VitscnjLoaderPlugin());
db.registerLoaderPlugin(new db.ObjLoaderPlugin());

const loader = new db.Loader(canvas);
const root = await loader.loadNode('/scenes/room.json');
```

## Constructor

**`Loader(canvas?, { wasmBaseUrl?, drawableCache? })`** creates a loader associated with a canvas. It uses the first canvas when the canvas is omitted. Pass a `DrawableCache` to share model resources across scene imports.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `canvas` | `Canvas` (get) | The canvas associated with this loader. |
| `currentPath` | `string` (get/set) | Base path for relative resource paths. Each scene import uses its own directory as the base for nested resources. |

## Drawable cache

The root returned by importing a `.json` or `.vitscnj` scene exposes its cache as `root.drawableCache`. By default each import creates a cache. To select the cache in advance, pass `{ drawableCache: cache }` to `Loader`. The cache retains unused entries until explicitly removed. `Loader.clearCache()` and `Loader.dispose()` manage the loader's own caches and font resources. The application controls drawable cache removal.

```js
import { DrawableCache, DrawableInstance, base, db, math, scene } from 'bg2e-js';

// Use the initialized canvas from your application.
scene.registerComponents();
db.registerLoaderPlugin(new db.VitscnjLoaderPlugin());
const cache = new DrawableCache();
const loader = new db.Loader(canvas, { drawableCache: cache });
const root = await loader.loadNode('/scenes/room.json');
const path = '/models/chair.bg2';
const key = DrawableCache.bg2Key(path);
const resource = cache.find(key) ?? await cache.loadBg2(path, loader);

const chairs = [
    { x: 0, color: [0.78, 0.27, 0.17, 1] },
    { x: 2, color: [0.18, 0.58, 0.75, 1] }
].map(({ x, color }) => {
    const node = new scene.Node('Chair');
    node.addComponent(new scene.TransformComponent(math.Mat4.MakeTranslation(x, 0, 0)));
    const instance = new DrawableInstance(resource);
    instance.items[0].material.albedo = new base.Color(color);
    node.addComponent(instance);
    root.addChild(node);
    return node;
});
```

Use `node.drawableInstance` to access the component. To rebind an existing
component, call `instance.bindResource(resource)`. A new binding starts with the
resource's original appearance. In selection callbacks, `item.drawable` is the
selected component and `item.itemIndex` identifies its submesh.

When the chairs are no longer needed, release their bindings and then remove the
resource if these were its last consumers.

```js
for (const chair of chairs) {
    root.removeChild(chair);
    chair.destroy();
}
const removed = cache.remove(key);
```

Use the same cache to register a model built in code. Manual identifiers are
exact strings chosen by the caller.

```js
import { base, primitives, scene } from 'bg2e-js';

const source = new scene.DrawableComponent('Unit cube');
source.addPolyList(primitives.createCube(1, 1, 1), new base.Material(canvas));
const cube = cache.add('unit-cube', source);
const entry = cache.find('unit-cube'); // same resource as cube
```

| Operation | Result |
| --- | --- |
| `DrawableCache.bg2Key(path, base?)` | Normalized lookup key. The base is a directory. Within a browser, relative directories use the document base URL. Fragments are ignored and queries remain part of the key. |
| `cache.find(key)` | Resident `DrawableResource`, or `undefined` for an absent or still-loading entry. |
| `cache.add(key, drawable)` | Snapshot a prepared Drawable under an exact caller-supplied string. An empty key, invalid Drawable or duplicate key throws. A pending load occupies its key. The source remains editable. |
| `cache.loadBg2(path, loader)` | Load through the registered BG2 plugin. The loader's base supplies the directory for relative references. Requests for the same URL share one promise while loading. Rejected attempts can be retried. |
| `cache.remove(key)` | Returns `true` when the entry is removed. A pending request is invalidated and rejects when it settles. A resident entry with active links, or an absent entry, returns `false`. |
| `cache.clear()` | Removes all entries and invalidates pending requests. If any resident entry has active links, returns `false` and leaves the cache intact. |

A resource reference provides the key, name, submesh count and number of active links. Call `resource.retain()` to protect it while using shared geometry. Read it with `lease.geometry(index)` or get the renderer with `lease.bindGeometry(index, renderer)`. Treat borrowed geometry and decoded image data as read-only. Bind each shared submesh to the same renderer for its lifetime. `lease.createAppearance(index)` gives the caller an editable material and submesh metadata. Call `appearance.material.destroy(true)` for discarded appearance copies and `lease.release()` when done with the resource. Release is idempotent.

A bound `Drawable` keeps an editable copy of the geometry and appearance. `DrawableInstance` shares the resource's geometry and owns its own materials, visibility, names, groups and local submesh transforms. Both hold a link until they change resources, call `releaseResource()` or are destroyed. A cloned instance acquires another link and copies the appearance. Detaching a component or subtree preserves its links so it can be reattached. `Node.destroy()` destroys the node's own components and detaches its children. To dispose an entire tree, destroy its descendants as well, then clear its cache.

The SDK uses JavaScript resource objects and explicit leases. Keeping a resource reference does not count as a link. Successful removal destroys shared WebGL vertex buffers and invalidates that resource reference for new leases. The SDK does not expose native typed usage categories or geometry revisions. Direct `Loader.loadDrawable()` and buffer loads still produce standalone editable drawables.

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `clearCache()` | — | Wipes the resource cache. Call when resources on disk have changed and stale data must be invalidated. |
| `findCache(path, type)` | `any` | Checks if a resource of the given `ResourceType` is cached for the specified path. Returns `undefined` if not found. |
| `loadResource(path, type)` | `Promise\<any\>` | Core load method: resolves path against `currentPath`, checks cache, delegates to the matching registered plugin by file extension. |
| `loadPolyList(path)` | `Promise\<PolyList\>` | Convenience method for loading PolyList resources. |
| `loadDrawable(path)` | `Promise\<any\>` | Convenience method for loading Drawable resources. |
| `loadDrawableBuffer(buffer, format, dependencies)` | `Promise\<any\>` | Convenience method for loading Drawable from an ArrayBuffer (used by drag-and-drop). |
| `loadNode(path)` | `Promise\<any\>` | Convenience method for loading a Node tree from `.vitscnj` or native `.json` scene files. |
| `loadTexture(path)` | `Promise\<Texture\>` | Convenience method for loading texture assets. |
| `loadMaterial(path)` | `Promise\<any\>` | Convenience method for loading material assets. |
| `setupModelDropZone(dropZone, cb)` | — | Loads the first `.bg2` file in a drop and passes its Drawable to the callback. Other dropped files are passed to the loader as dependencies. |

## Drag and drop example

```js
import { scene } from 'bg2e-js';

// Reuse the registered loader and root from the scene setup above.
loader.setupModelDropZone(document.body, drawable => {
    const modelNode = new scene.Node("Dropped model");
    modelNode.addComponent(drawable);
    root.addChild(modelNode);
});
```
