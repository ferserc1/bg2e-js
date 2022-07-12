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

**`getTexture(attribName)`**: Returns the texture object of the concrete graphics API to be used in a shader. For example, in WebGL, this function must return a texture object. The `attribName` parameter is the name of the parameter in the material that contains the texture. 

It is important to note that the requested attribute may not contain a texture. For example, in a material, if the `diffuse` attribute is requested, it may contain a texture, but also a color. If the attribute doesn't contains a texture object, this function should return `null`. This behavior is implemented in the `getTexture()` base class, so you can use it to determine if the attribute is a texture.

```js
getTexture(materialAttribute) {
    const texture = super.getTexture(materialAttribute);
    if (texture) {
        if (texture.dirty) {
            getWebGLTexture(this.renderer.gl,texture);
        }
        return texture._apiObject;
    }
}
```

**`deleteTextures()`**: is invoked when it is necessary to delete all the textures contained in the material.

