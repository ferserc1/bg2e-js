# bg2e.db.Loader

It is used to load resources independently of the type of application (browser, node or electron). Each loader instance maintains a cache of elements that have been loaded, indexed by resource type and by load path. Note that this cache is not shared between loader instances, so two different loaders will load the same resource twice.

Depending on the environment, a loader will load resources in one way or another. For example, in a node application, texture images are loaded as byte arrays, while in a browser they are loaded as an `Image` object (which is the same as a `<img>` DOM element). Note that the data type loaded with `loadTexture` is always [textures](../base/texture.md), but the internal object representing the image will be of one type or another depending on the environment.

```js
import Loader from 'bg2e/db/Loader';

const myLoader = new Loader();
const plistArray = await myLoader.loadPolyList('model.bg2');
const drawable = await myLoader.loadDrawable('model.bg2');
const prefab = await myLoader.loadNode('model.bg2');
const scene = await myLoader.loadNode('myScene.vitscnj');
const textImg = await myLoader.loadTexture('texture.jpg');
const matArray = await myLoader.loadMaterial('materials.bg2mat');
```
