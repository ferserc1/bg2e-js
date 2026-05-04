# TextureRenderer

The `TextureRenderer` class is the base class for rendering textures to screen or into frame buffers. It provides template methods that must be implemented by subclasses.

## Constructor

```ts
constructor(renderer: Renderer, texture: Texture)
```

Creates a new texture renderer. Throws if the texture is already owned by another texture renderer (checked via `texture.renderer` property).

## Properties

### renderer
The owning `Renderer` instance.

### texture
The `Texture` being rendered by this renderer. Read-only exposure of the managed texture object.

## Methods

### getApiObject(texture: Texture) : any
Returns the underlying API object (texture identifier) for rendering. Must be overridden by subclasses:

```ts
// Example override in a GL-based subclass:
override getApiObject(texture: Texture): WebGLTexture {
    return this.glTextures.get(texture.id);
}
```

### destroy() : void
Must be overridden to clean up GL resources and remove `texture.renderer` ownership:

```ts
// Example override in a GL-based subclass:
override destroy(): void {
    this.glTextures.delete(this.texture.id);
}
```

## Design Notes

This class uses the Template Method pattern. Subclasses implement:
- `getApiObject()` — API-specific texture lookup for drawing calls
- `destroy()` — cleanup of backend resources and ownership tracking

The base constructor enforces exclusive texture ownership by checking the hidden `texture.renderer` property, ensuring each texture is managed by exactly one renderer.
