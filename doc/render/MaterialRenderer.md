# MaterialRenderer

Wraps a [`Material`](../base/Material.md) for rendering. One material renderer per material instance manages the material data binding to shaders during render operations.

```ts
import MaterialRenderer from "bg2e-js/ts/render/MaterialRenderer.js";

const material = await Material.Deserialize({
    diffuse: [0.4, 0.3, 0.1],
    roughness: 0.5,
    metallic: 0.8
});
const matRenderer = myRenderer.factory.material(material);
```

## Properties (Read)

| Property | Type | Description |
|----------|------|-------------|
| `renderer` | Renderer | The base renderer (WebGLRenderer). |
| `material` | Material | The wrapped material with its properties and textures. |

## getTextureRenderer(materialAttribute: keyof Material): TextureRenderer \| null

Returns a `TextureRenderer` if the specified material attribute (e.g., "albedoTexturer", normalMap, roughness) is a texture. Returns null otherwise or if the attribute is not a texture:

```ts
const texRenderer = matRenderer.getTextureRenderer("albedoTexture");
if (texRenderer) {
    texRenderer.activeTexture(0);
    texRenderer.bindTexture();
}
```
