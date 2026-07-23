# SelectionHighlight

```ts
import SelectionHighlight from "bg2e-js/ts/manipulation/SelectionHighlight.js";
```

Draws a colored outline around every `PolyList` currently flagged `selected` (that flag is normally set by [`SelectionManager`](SelectionManager.md), but `SelectionHighlight` itself doesn't depend on it — anything that sets `polyList.selected = true` will be outlined).

It works in two passes:

1. Renders every selected `PolyList` as a flat, unlit silhouette into an off-screen texture (reusing `PickSelectionShader`, the same shader `SelectionManager`/`GizmoManager` use for color-picking).
2. Composites that silhouette onto the main framebuffer with an edge-detection shader (`SelectionHighlightShader`) that only draws the outline, leaving already-rendered pixels untouched (`clearBuffers: false`).

`SceneAppController` creates and drives one automatically (see the [Selection and Gizmos Guide](../render/SceneAppController.md#selection-and-gizmos)).

## Constructor

```ts
constructor(renderer: Renderer)
```

## Methods

### init(): Promise\<void\>

Creates the off-screen render target and both shaders. Call once before the first `draw()`.

### setViewportSize(width: number, height: number): void

Resizes the off-screen render target to match the canvas. Call on every resize.

### draw(scene: Node, camera: Camera): void

Renders the silhouette pass over `scene`, then composites the outline onto the current framebuffer. Call once per frame, after the main scene draw, while `scene` still has one or more `PolyList`s with `selected = true`.

### destroy(): void

Releases the off-screen render target/texture.

## Properties

### borderColor: Color

Outline color. Default: opaque red (`[1, 0, 0, 1]`).

```ts
this.selectionHighlight!.borderColor = new Vec(0.0, 0.8, 0.3, 1.0);
```

### borderWidth: number

Outline thickness, in pixels. Default: `3`.

```ts
this.selectionHighlight!.borderWidth = 6;
```
