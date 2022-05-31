# webgl.State

Provides access to the WebGL state. The `state` object is linked to the `<canvas>` element when the [`webgl.Renderer`](Renderer.md) object is initialized.

## Constants

The `webgl.State` object constants are equivalent to the `WebGL` constants. In fact, they are just a light layer that allows you to get the actual values of the `WebGL` constants directly. The constants in `webgl.State` are used by the `webgl.State` functions.

### Front and back polygon face

**`CW`**
**`CCW`**
**`FRONT`**
**`BACK`**
**`FRONT_AND_BACK`**

## Attributes

**`renderer` (read):** Returns the [`Renderer`](Renderer.md) object associated with this `state` instance.

**`gl` (read):** Returns the `WebGL` context associated with this `state`.

**`viewport` (read/write):** Gets or sets the viewport rectangle.

**`maxViewportDims` (read):** Returns the maximum viewport size.

**`clearColor` (read/write):** Gets or sets the clear color.

**`clearDepth` (read/write):** Gets or sets the depth value.

**`clearStencil` (read/write):** Gets or sets the stencil value.

**`frontFace` (read/write):** Gets or sets the front face used (see `CW` and `CCW` constants).

**`cullFace` (read/write):** Gets or sets the current cull face (see `FRONT`, `BACK` and `FRONT_AND_BACK` constants).

**`depthTestEnabled` (read/write):** Gets or sets the depth test activation state (`boolean`).

**`cullFaceEnabled` (read/write):** Gets or sets the cull face activation state (`boolean`).

**`shaderProgram` (read/write):** Gets or sets the current [shader program](ShaderProgram.md) object (Note that this object is not a native `WebGL` program object, but an instance of the  [ShaderProgram](ShaderProgram.md) class). You can use this attribute to set or get the current shader program, or you can also use the `ShaderProgram.useProgram()` function to set the current program, and the static function `ShaderProgram.GetShaderProgram()` to get the current program. All these approaches are equivalent. Once a shaderProgram has been bound to a state, there is no "unbind" operation. The only way to change the current program is to bind a new one, or to delete the bound one.

## Functions

**`clear({ color = true, depth = true, stencil = false })`:** Clear the framebuffers with the `clearColor`, `clearDepth` and `clearStencil` current values, depending on the `color`, `depth` and `stencil` parameters.

