# RenderBuffer

The `RenderBuffer` class is the base abstract class for managing render target buffers. It handles texture attachments, size management, and frame buffer operations. Concrete implementations are:
- **`RenderBufferTexture2D`** — for single 2D texture render targets
- **`RenderBufferCubeMap`** — for cube map (6-face) render targets

## Constructor

```ts
constructor(renderer: any, size?: Vec | number[])
```

Creates an uninitialized render buffer with default size 512x512. The actual texture initialization happens via `attachTexture()`.

## Properties

### renderer : Renderer
The owning renderer instance.

### size : Vec
Buffer resolution (width, height). When modified, all attached textures are automatically resized to match.

### type : RenderBufferType
Either `RenderBufferType.TEXTURE` (2D) or `RenderBufferType.CUBE_MAP`. Set automatically on first texture attachment.

### dirty : boolean
True if the buffer has been modified and needs updating. Use `setUpdated(true/false)` to toggle.

### attachments : Record<string, any>
Map of texture attachments keyed by attachment name (e.g., `COLOR_ATTACHMENT_0`). Each value is a `TextureRenderer` instance.

### frameBuffer
Returns the underlying framebuffer object for rendering into this buffer (abstract).

## Methods

### attachTexture(texture: Texture) : Promise<void>
Attaches a texture as a render target. Throws if:
- The attachment slot is already occupied by another texture
- The texture type doesn't match an existing buffer (can't mix 2D and cube maps)
- The buffer is already initialized with a different type

The texture's `renderTargetAttachment` property determines which attachment slot it occupies. After attaching, the texture is marked as `RENDER_TARGET` and resized to match the buffer size.

### detachTexture(texture: Texture) : void
Removes a texture from an attachment slot and deletes the corresponding texture renderer. Throws if:
- No texture is attached to that slot
- The provided texture doesn't match the one actually attached

### getTextureRenderer(attachment: string)
Returns the `TextureRenderer` for a given attachment name.

### getTexture(attachment: string)
Returns the underlying `Texture` for a given attachment name.

### setUpdated(updated: boolean)
Toggles the dirty flag. `true` means "buffer is up to date" (not dirty), `false` means "needs update".

### update(drawFunc: DrawFunc)
Executes a draw function within the buffer's render target. For 2D buffers, calls `beginUpdate()` / `drawFunc` / `endUpdate()`. For cube maps, renders all 6 faces with pre-configured view matrices (looking outward on each axis face).

The draw function receives optional parameters:
```ts
type DrawFunc = (face?: CubeMapFace, viewMatrix?: Mat4, projectionMatrix?: Mat4) => void
```

### saveVertexBufferState() / restoreVertexBufferState()
Saves and restores the bound vertex buffer state (abstract methods, concrete implementations must override).

### readPixels(x, y, width, height) : Uint8Array | undefined
Reads pixel data from the buffer (abstract base returns `undefined`).

## Abstract Methods (must be overridden)

- **beginUpdate(face?)** — Bind the FBO and prepare for rendering into this buffer
- **endUpdate(face?)** — Restore default framebuffer
- **destroy()** — Clean up all resources including FBO and texture renderers
- **frameBuffer** (getter) — Return the WebGL framebuffer object

## RenderBufferType Enum

```ts
enum RenderBufferType {
    UNINITIALIZED = 0,
    TEXTURE = 1,
    CUBE_MAP = 2
}
```

## CubeMapFace Enum

Defines the six faces of a cube map:
- `NONE` — for 2D buffer updates
- `POSITIVE_X`, `NEGATIVE_X` (+X and -X faces)
- `POSITIVE_Y`, `NEGATIVE_Y` (+Y and -Y faces) 
- `POSITIVE_Z`, `NEGATIVE_Z` (+Z and -Z faces)
