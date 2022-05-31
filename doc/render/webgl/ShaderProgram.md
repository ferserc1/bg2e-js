# webgl.ShaderProgram

Provides a wrapper for `WebGL` elements that work with shaders and programs. Within this API there are functions to create, compile and link shaders in a program, delete the program, pass uniform variables, set the program in use within the current state and get the program bound to the state.

## Exported objects

**`ShaderType`:** Define a shader source type.

- `ShaderType.VERTEX`
- `ShaderType.FRAGMENT`

```js
import ShaderProgram, { ShaderType } from 'bg2e/render/webgl/ShaderProgram'
```

## Constructor

**`constructor(gl, name = "")`**

The `ShaderProgram` constructor internally creates a `program` object of `WebGL`, which will remain in an invalid state until it is initialized. It receives as parameter the render context of `WebGL` and an optional name, which can be used for debugging.

## Attributes

**`program` (read):** Returns the native `WebGL` program object associated with the `ShaderProgram` instance. This is the `program` object created in the `ShaderProgram` constructor.

**`name` (read):** Returns the `name` of the `ShaderProgram` instance, that is specified in the class constructor.

## Functions

**`static GetShaderProgram(glProgram)`:** From a `program` object native to `WebGL`, returns the instance of the `ShaderProgram` object that created it. It will only work with `program` objects that have been created inside the `ShaderProgram` constructor, that is, if we create a program directly with the native API of the browser, and we try to obtain the `ShaderProgram` object associated to it, this function will return `undefined`.

**`static Delete(shaderProgram)`:** Removes the internal `WebGL` objects associated with the `shaderProgram` object passed as a parameter.

**`attachSource(src,type)`:** Attach a shader source to the program. The type of the shader (vertex or fragment) is specified by the `type` attribute, and must be an element of the `ShaderType` object. This function creates a shader from a source code, compiles it and  attaches it to the program. The `src` parameter is a string containing the source code of the shader. Throws an exception if there are errors in the shader source code.

**`attachVertexSource(src)`:** Internally it uses `attachSource` to add a vertex shader. The only advantage of using this function is that it is not necessary to use the `ShaderType` object to specify the type, which will be of type `VERTEX`.

**`attachFragmentSource(src)`:** Internally it uses `attachSource` to add a fragment shader. The only advantage of using this function is that it is not necessary to use the `ShaderType` object to specify the type, which will be of type `FRAGMENT`.

**`link()`:** Once all the shaders have been added, we link the whole program with this function. Throws an exception if an error occurs when linking the program.

**`useProgram()`:** Sets the current program as active in the `WebGL` state. This function is equivalent to [state.shaderProgram](State.md) setter.

**`getAttribLocation(name)`:** Gets the location of the attribute with the name `name`.  This function is used internally within `ShaderSource`. Normally it is not necessary to use this function, since internally the `ShaderProgram` object takes care of keeping track of locations and indexing them to its name by using the `vertexAttribPointer` function.

**`getUniformLocation(name)`:** Gets the location of the uniform variable with the name `name`.  This function is used internally within `ShaderSource`. Normally it is not necessary to use this function, since internally the `ShaderProgram` object takes care of keeping track of uniform locations and indexing them to its name by using the `uniform*` and `uniformMatrix*` functions.

**`vertexAttribPointer(name,size,format,normalize,stride,offset)`:** Configures an attribute to be used with the currently bound vertex buffer.

**`enableVertexAttribArray(name):`** Activates an attribute to be used by the linked shader in the state.

### Configure and set vertex attributes

The following functions internally make use of `vertexAttribPointer` and `enableVertexAttribArray` to set the attributes of a shader. The reason why there are several forms (`positionAttribPointer`, `normalAttribPointer`, `texCoordAttribPointer` and `colorAttribPointer`) of the same function is that the default parameters of each function are predefined to match as closely as possible the most typical parameters for each type of attribute. For example, generally a vertex attribute of normal will have a size of 3.

**`positionAttribPointer({ name, stride, size = 3, offset = 0, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT })`**

**`normalAttribPointer({ name, size = 3, stride, offset = 0, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT })`**

**`texCoordAttribPointer({ name, stride, offset, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT })`**

**`colorAttribPointer({ name, size = 4, stride, offset = 0, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT })`**

### Set uniform values

The following functions are equivalent to `WebGL` [`uniform**`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform) and [`unfiromMatrix**`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniformMatrix) APIs.

**`uniformMatrix2fv(name, transpose, value)`**

**`uniformMatrix3fv(name, transpose, value)`**

**`uniformMatrix4fv(name, transpose, value)`**

**`uniform1f(name, v0)`**

**`uniform1fv(name, value)`**

**`uniform1i(name, v0)`**

**`uniform1iv(name, value)`**

**`uniform2f(name, v0, v1)`**

**`uniform2fv(name, value)`**

**`uniform2i(name, v0, v1)`**

**`uniform2iv(name, value)`**

**`uniform3f(name, v0, v1, v2)`**

**`uniform3fv(name, value)`**

**`uniform3i(name, v0, v1, v2)`**

**`uniform3iv(name, value)`**

**`uniform4f(name, v0, v1, v2, v3)`**

**`uniform4fv(name, value)`**

**`uniform4i(name, v0, v1, v2, v3)`**

**`uniform4iv(name, value)`**
