# bg2e-manipulation Module

The `manipulation` module provides interactive scene-editing tools: clicking to select `PolyList`/`Drawable` objects, drawing a highlight outline around the current selection, and showing draggable translate/rotate/scale gizmos over the selected node.

All three pieces are designed to be driven by [`SceneAppController`](../render/SceneAppController.md), which creates, wires and forwards input events to them automatically. See the [Selection and Gizmos Guide](../render/SceneAppController.md#selection-and-gizmos) for a practical, end-to-end walkthrough (selection modes, enabling/disabling each piece, gizmo configuration, custom gizmo models, custom actions). This module's own pages are API reference.

## Overview

- **[`SelectionManager`](SelectionManager.md)** — GPU color-picking based hit-testing. Tracks the current selection (single or multiple items) and notifies listeners when it changes.
- **[`SelectionMode`](SelectionMode.md)** — enum selecting whether a click selects a single `PolyList` or the whole `Drawable`.
- **[`SelectionHighlight`](SelectionHighlight.md)** — draws a colored outline around whatever `SelectionManager` currently has selected.
- **[`GizmoManager`](GizmoManager.md)** — draws a translate/rotate/scale gizmo over the last (or only) selected node and turns mouse drags into `Transform` edits.
- **[`GizmoComponent`](GizmoComponent.md)** — marker component: a node needs one (plus a `Transform`) to be eligible to show a gizmo.
- **[`GizmoActionLabel`](GizmoActionLabel.md)** — the fixed set of action names (`TranslateX`, `RotateY`, `ScaleZ`, ...) used to identify gizmo handles by `PolyList` name.

## How selection and gizmos relate

`GizmoManager` does not do its own hit-testing against the scene — it reads `SelectionManager.selection` to decide which node's gizmo to draw (the last item in the selection array), so a `SelectionManager` instance is required to construct one. `SelectionHighlight` is fully independent: it only looks at each `PolyList.selected` flag, which `SelectionManager` sets on its current selection.

```
click/drag on scene geometry ──► SelectionManager (picks PolyList/Drawable, sets .selected)
                                        │
                    ┌───────────────────┼───────────────────────┐
                    ▼                                            ▼
          SelectionHighlight                              GizmoManager
     (outlines .selected PolyLists)          (draws + drags handles on the last-selected node)
```

## Internal implementation

These classes are implementation details of `SelectionManager`/`GizmoManager` and are not meant to be used directly by application code — they have no dedicated reference page, but are worth knowing about when reading the source:

- **`SelectionBuffer`** — renders the scene to an off-screen, flat-colored texture (via `PickSelectionShader`) and reads back a single pixel to resolve a click into a `{ polyList, drawable }` pair. Used by `SelectionManager.mouseUp()`.
- **`SelectionIdAssignVisitor`** — a `NodeVisitor` that walks the scene once per pick and assigns a unique `colorCode` to every selectable `PolyList` (or one color per `Drawable` in `SelectionMode.OBJECT`), building the color → element map `SelectionBuffer`'s result is looked up in.
- **`GizmoPickBuffer`** — the gizmo equivalent of `SelectionBuffer`: renders only the shared gizmo `Drawable` (not the scene) to resolve which labeled handle, if any, was hit on `mouseDown`.
- **`GizmoDrawVisitor`** — a `NodeVisitor` used by `GizmoManager.draw()` to draw the shared gizmo `Drawable` at the resolved target node's position, with the fixed on-screen-size model matrix.
