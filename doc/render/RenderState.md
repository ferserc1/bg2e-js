# RenderState

Stores all the elements needed to render an element on screen: instances of [`PolyListRenderer`](PolyListRenderer.md) and ['MaterialRenderer`](MaterialRenderer.md), a [`Shader`](Shader.md) that processes the material and the model, view and projection transformation matrices.

A `RenderState` object contains references to all these objects described above, so it is possible to create an array of `RenderState` objects to render them in a loop.

The following is an example of loading a `Drawable` object, whereby an array of `RenderState` is initialized for rendering.

```javascript
import Loader, { registerLoaderPlugin } from "bg2e/db/Loader";
import Bg2LoaderPlugin from "bg2e/db/Bg2LoaderPlugin";
import { registerComponents } from "bg2e/scene";
import RenderState from "bg2e/render/RenderState";

...
let g_renderStates = [];

async init(renderer) {
    // User defined function to get the shader, projection and view matrixes
    const shader = getTheShader();
    const projectionMatrix = getProjection();
    const viewMatrix = getCameraView();

    registerLoaderPlugin(new Bg2LoaderPlugin());    // Register the Bg2LoaderPlugin
    registerComponents();   // Register scene components. Drawable is a scene component
    const loader = new Loader();
    const drawable = await loader.loadDrawable("resources/cubes.bg2");
    g_renderStates = drawable.items.map({ polyList, material, transform } => {
        const plistRenderer = renderer.factory.polyList(polyList);
        const materialRenderer = renderer.factory.material(material);
        return new RenderState({
            shader,
            plistRenderer,
            materialRenderer,
            modelMatrix: transform,
            viewMatrix,
            projectionMatrix
        })
    });
}

draw() {
    ... // Prepare viewport to draw
    g_renderStates.forEach(rs => rs.draw());
}
```

## Constructor

The `RenderState` constructor supports an object with the necessary parameters. All parameters are optional, as they can be set later. For example, it is possible to reuse the same `RenderState` object list for rendering, where we will only update the projection and view matrices. In this case, we would initialize the `RenderState` with the shader, the renderers for polyList and material and the model matrix.

```js
constructor({
        shader = null,
        polyListRenderer = null,
        materialRenderer = null,
        modelMatrix = Mat4.MakeIdentity(),
        viewMatrix = Mat4.MakeIdentity(),
        projectionMatrix = Mat4.MakeIdentity()
    }) 
```

## Attributes

**`renderState.valid` (read):** Returns true if `renderState` contains the minimum elements required to render the object, that is: shader, polyListRenderer and materialRenderer.

**`renderState.shader` (read/write):**

**`renderState.polyListRenderer` (read/write):**

**`renderState.materialRenderer` (read/write):**

**`renderState.modelMatrix` (read/write):**

**`renderState.viewMatrix` (read/write):**

**`renderState.projectionMatrix` (read/write):**

## Functions

**`draw()`:** Uses the information in the state to setup a draw command.
