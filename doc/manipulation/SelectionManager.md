# SelectionManager

```ts
import SelectionManager, { SelectionChangedData, SelectionChangedCallback } from "bg2e-js/ts/manipulation/SelectionManager.js";
```

Tracks which `PolyList`/`Drawable` objects in a scene are currently selected, based on mouse clicks. Hit-testing is done with GPU color-picking: every selectable `PolyList` is assigned a unique flat color, the scene is rendered off-screen with that color instead of its material, and the pixel under the cursor is read back to resolve the click.

`SceneAppController` creates and drives one automatically (see the [Selection and Gizmos Guide](../render/SceneAppController.md#selection-and-gizmos)); this page documents the class itself for when you need to configure or query it directly, or use it outside `SceneAppController`.

## Constructor

```ts
constructor(renderer: Renderer)
```

## Methods

### init(): Promise\<void\>

Creates the internal `SelectionBuffer` (off-screen picking render target) and `SelectionIdAssignVisitor` (color-assignment visitor). Must be called once, before the first `mouseUp()`.

### setViewportSize(w: number, h: number): void

Resizes the off-screen picking buffer to match the canvas. Call on every resize (`SceneAppController.reshape()` does this automatically).

### clearSelection(): void

Empties the selection, resets `.selected` to `false` on every previously selected `PolyList`, and calls `onSelectionChanged` listeners.

### mouseDown(evt: Bg2MouseEvent): void

Records the pointer-down position. Used by `mouseUp()` to distinguish a click from a drag.

### mouseUp(evt: Bg2MouseEvent): void

Performs the pick **only if the pointer moved less than 2px** since `mouseDown()` — this prevents camera-orbit drags from being misread as (de)selection clicks. When it is a click:

1. Re-runs `SelectionIdAssignVisitor` over `sceneRoot` to (re)assign pick colors (so newly added/removed nodes are always in sync).
2. Renders the scene into the picking buffer and reads back the pixel at the click position.
3. Resolves the pixel to a `{ polyList, drawable }` element (or `null` if the background was hit).
4. Updates `selection` according to `multiSelectMode`:
   - **Single-select** (`multiSelectMode = false`): clicking an item replaces the selection with `[item]`; clicking empty space clears it.
   - **Multi-select** (`multiSelectMode = true`): clicking a new item **adds** it to the selection; clicking an already-selected item **removes** it; clicking empty space does **not** clear the selection.
5. Sets `.selected = true` on the resulting `PolyList`(s) — in `SelectionMode.OBJECT` this is every `PolyList` of the selected `Drawable`(s), which is what `SelectionHighlight` reads to know what to outline.

### touchStart(evt) / touchEnd(evt): void

Reserved for touch-based picking. Currently no-ops — touch input does not yet drive selection.

### onSelectionChanged(id: string, cb: SelectionChangedCallback): void

Registers a callback, keyed by `id`, invoked every time the selection changes (on click, `clearSelection()`, or a `sceneRoot`/`camera`/`selectionMode`/`multiSelectMode` change that implicitly clears it):

```ts
this.selectionManager!.onSelectionChanged("myListener", (selection: SelectionChangedData[]) => {
    selection.forEach(item => console.log(item.drawable.name));
});
```

`SelectionChangedData` is `{ polyList: PolyList; drawable: Drawable }`.

### triggerSelectionChanged(): void

Manually re-invokes all registered `onSelectionChanged` callbacks with the current selection. Rarely needed directly — internal methods already call it whenever the selection actually changes.

### destroy(): void

Releases the off-screen picking buffer/texture.

## Properties

### selection: SelectionChangedData[] (read-only)

The current selection, in click order — the **last** entry is the most recently selected/added item. `GizmoManager` uses `selection[selection.length - 1]` to decide which node to show a gizmo for, so this ordering matters for gizmo behavior in multi-select mode.

### enabled: boolean

Enables/disables picking. Setting it to `false` also clears the current selection.

```ts
this.selectionManager!.enable();
this.selectionManager!.disable();     // equivalent to `enabled = false`
```

### selectionMode: SelectionMode

See [`SelectionMode`](SelectionMode.md). Default: `SelectionMode.POLY_LIST`. Setting it clears the selection (also available as `setSelectionMode(mode)`).

### multiSelectMode: boolean

Default: `false`. Setting it clears the selection (also available as `setMultiSelectMode(mode)`).

### sceneRoot: Node | null

The scene root to hit-test against. Setting it clears the selection.

### camera: Camera | null

The camera used to build the picking view/projection matrices. If not set explicitly, falls back to `Camera.GetMain(sceneRoot)`. Setting it explicitly clears the selection.

## Notes on selectability

Only `PolyList`s with `isSelectable` true (the default) receive a pick color and can be selected — set with the `selectable` setter (`polyList.selectable = false`). Use `Drawable.makeSelectable(bool)` to toggle it for every `PolyList` in a `Drawable` at once, or set `polyList.selectable` on individual items to fine-tune which parts of a model are pickable:

```ts
node.drawable?.makeSelectable(node.name === "Ball"); // only "Ball" nodes are selectable
```
