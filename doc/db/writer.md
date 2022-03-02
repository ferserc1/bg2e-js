# bg2e.db.Writer

You can create writers to store elements of the graphics engine. The Writer class is intended to be application type agnostic (browser, node or electron). The writer functions receive a path and the data associated with the resource. The data type of the resource will depend on the resource type and the execution environment. For example, in a browser, an image is represented by an instance of `Image`, which is also an `<img>` DOM element, while in a node application images are byte arrays.

```js
import Writer from 'bg2e/db/Writer';

const myWriter = new Writer();
await myWriter.writePolyList('aPolyList.bg2',polyList);
await myWriter.writeDrawable('aDrawable.bg2',drawable);
await myWriter.writeScene('aPrefab.bg2',prefabNode);
await myWriter.writeScene('aScene.vitscnj',rootNode);
await myWriter.writeTexture('aTexture.jpg',textureImage);
await myWriter.writeMaterial('material.bg2mat',drawable.getMaterial(0));
```

