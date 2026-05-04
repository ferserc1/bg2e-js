# TextureMergerRenderer

The `TextureMergerRenderer` class composes multiple input textures into a single merged texture output. It creates its own render buffer and uses the `TextureMergerShader` to combine textures per-channel.

## Constructor

```ts
constructor(renderer: Renderer)
```

Creates the internal `TextureMergerShader` (singleton via `GetUnique()`), a merged output texture, and attaches it to a render buffer.

## Properties

### renderer
The owning `Renderer` instance.

### dirty : boolean
Indicates whether the merged texture needs regeneration. Set to `true` automatically whenever a channel texture is modified via `setTexture()`.

### mergedTexture : Texture
The output texture containing the merged result. Uses `COLOR_ATTACHMENT_0` with `UNSIGNED_BYTE` format and `REPEAT` wrap mode.

### isComplete : boolean
Forwarded from the shader's `isComplete` flag. Indicates if all required textures are loaded and valid.

## Methods

### setTexture(tex: Texture, channel: TextureChannel, dstChannel?: TextureChannel)
Sets the source texture for a specific input channel and specifies which destination channel the data should map to.

```ts
// Set R channel from a grayscale texture, outputting to channel A
renderer.setTexture(grayTex, TextureChannel.R, TextureChannel.A);

// Set G channel from another texture, outputting to channel R
renderer.setTexture(colorTex, TextureChannel.G, TextureChannel.R);

// Set all four channels to create ARGB output
merger.setTexture(rTex, TextureChannel.R);              // defaults to dst R
merger.setTexture(gTex, TextureChannel.G);              // defaults to dst G  
merger.setTexture(BTex, TextureChannel.B);              // defaults to dst B
merger.setTexture(aTex, TextureChannel.A, TextureChannel.A);  // explicit alpha mapping
```

If `tex` is null, throws an error. Automatically marks the merger as dirty.

### update()
Regenerates the merged texture if dirty. Internally calls `renderer.presentTexture()` twice (a workaround as noted in the source code):

```ts
merger.update();  // Only renders if dirty is true
```

The implementation:
1. Calls `update()` on the internal render buffer with a draw callback
2. Calls `presentTexture` twice — once with clears and once without (debug note about why this is needed)
3. Resets dirty flag on completion

## Internal RenderBuffer Usage

A render buffer is automatically created and attached to `mergedTexture`. The merger reuses this buffer for each update cycle, which is why two passes are needed.

## Typical Usage Pattern

```typescript
const merger = new TextureMergerRenderer(renderer);

merger.setTexture(alphaTexture, TextureChannel.R, TextureChannel.A);
merger.update();  // Generates merged result

// Access the output
const resultTex = merger.mergedTexture;
```
