# MaterialRenderer

This object is responsible for loading and managing the specific graphical API objects that are related to the materials.

## Constructor

The `MaterialRenderer` constructor is never invoked directly. Instances of `MaterialRenderer` are created through the factory in [`Renderer`](Renderer.md):

```js
import Material from 'bg2e/base/Material';
...

const material = new Material();
... // Initialize material data
const materialRenderer = myRenderer.factory.material(material);
```

Normally you use `MaterialRenderer` together with [`PolyListRenderer`](PolyListRenderer.md) to create a [`RenderState`](RenderState.md) object:

```javascript
import RenderState from 'bg2e/render/RenderState';
...
const renderStates = [];
const shader = await loadShader();  // render.Shader
...
const myPolyList = await getAPolyList(); // base.PolyList
const myMaterial = getAMaterial();  // base.Material
const viewMatrix = getViewMatrix(); // Mat4
const modelMatrix = getModelMatrix();   // Mat4
const projectionMatrix = getProjectionMatrix(); // Mat4
renderStates.push(new RenderState({
    shader,
    materialRenderer: renderer.factory.material(myMaterial),
    polyListRenderer: renderer.factory.polyList(myPolyList),
    modelMatrix,
    viewMatrix,
    projectionMatrix
}))

...

renderStates.forEach(rs => rs.draw());
```

## Functions

**`getTextureRenderer(attribName)`**: Returns the [`TextureRenderer`](TextureRenderer.md) object associated with the attribute described by `attribName`, assuming it contains a texture. For example, the `diffuse` and `normal` attributes may contain a texture or a color (math.Vec[4]), and the `metallic`, `roughness`, `lightEmission` and `ambientOcclusion` attributes may contain a texture or a numeric value. If the requested attribute does not contain a texture, the `getTextureRenderer()` function will return `null`.

**`deleteTextures()`**: is invoked when it is necessary to delete all the textures contained in the material.

