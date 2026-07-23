# SelectionMode

```ts
import SelectionMode from "bg2e-js/ts/manipulation/SelectionMode.js";
```

Enum controlling the granularity of a `SelectionManager` click: whether it picks an individual `PolyList` or the whole `Drawable` it belongs to.

```ts
enum SelectionMode {
    OBJECT = 0,
    POLY_LIST = 1
}
```

- **`POLY_LIST`** (default) — each `PolyList` in the scene gets its own unique pick color, so clicking one part of a multi-mesh `Drawable` selects only that `PolyList`.
- **`OBJECT`** — every selectable `PolyList` belonging to the same `Drawable` shares one pick color, so a click anywhere on the `Drawable` selects it as a whole (all its `PolyList`s end up in the resulting selection).

## Usage

```ts
this.selectionManager!.selectionMode = SelectionMode.OBJECT;
```

Setting `SelectionManager.selectionMode` clears the current selection, since the previously assigned pick colors are no longer valid under the new mode.
