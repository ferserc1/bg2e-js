# webgl.VertexBuffer

Stores a vertex buffer that can then be passed as an attribute to a shader.

```js
import VertexBuffer { BufferTarget, BufferUsage } from 'bg2e/render/webgl/VertexBuffer';
...
```

## Constructor

`constructor(gl)`

When creating a vertex buffer, the constructor also creates the `buffer` object of `WebGL`, and if necessary, initializes the objects needed for conversion from `WebGL` internal enumerated types to `BufferTarget` and `BufferUsage` objects (see below).

## Objects

**`BufferTarget`:** Define el target of the buffer

- `BufferTarget.ARRAY_BUFFER`: Buffer containing vertex attributes, such as vertex coordinates, texture coordinate data or vertex color data.
- `BufferTarget.ELEMENT_ARRAY_BUFFER`: Buffer used for element indices.

**`BufferUsage`:** Defines the usage pattern of the data stored in a vertex buffer.

- `BufferUsage.STATIC_DRAW`: The contents are intended to be specified once by the application and used many times.
- `BufferUsage.DYNAMIC_DRAW`: The contents are intended to be respecified repeatedly by the application.
- `BufferUsage.STREAM_DRAW`: The contents are intended to be specified once by the application, and used at most a few times.

## Functions

**`static Delete(buffer)`:** Removes the internal `WebGL` objects associated with the `vertexBuffer` object passed as a parameter.

**`bind(target)`:** Bind the array buffer to the `WebGL` state and the target defined by the `target` parameter.

**`bufferData(target, data, usage, srcOffset = null, length = null)`:** Specify the buffer data. The `target` parameter can be any of the `BufferTarget` object. The `data` parameter must be a valed JavaScript typed array, compatible with the target specified, such as `Float32Array` or `UInt16Array`. The `srcOffset` and `length` parameters describes the configuration of the `data` parameter.

**`static CreateArrayBuffer(gl, data, usage = BufferUsage.STATIC_DRAW)`:** Creates an array buffer associated with the webgl context `gl`, from the data specified by `data` and to give it a use defined by `usage`. The `data` parameter must be a valid JavaScript typed array object, such as `Float32Array` or `Float16Array`. Internally, this function creates a buffer and initialize it using the `bind` and `bufferData` functions.

**`static CreateElementArrayBuffer(gl, data, usage = BufferUsage.STATIC_DRAW)`:** Creates an element array buffer associeted with the webgl context `gl`, from the data specified by `data` and to give it a use defined by `usage`. The `data` parameter must be a valid JavaScript typed array object that can be used to define the element index buffer, such as `UInt16Array` or `Int32Array`. Internally, this function creates a buffer and initialize it using the `bind` and `bufferData` functions.

**`CurrentBuffer(gl, target)`:** Returns the array buffer attached to the `WebGL` stated to the target defined by the `target` parameter, that can be any element of the `BufferTarget` object. 


## Attributes

**`buffer` (read):** a reference to the `WebGL` array buffer object.
