# GizmoActionLabel

```ts
import GizmoActionLabel, { GizmoActionLabels } from "bg2e-js/ts/manipulation/GizmoActionLabel.js";
```

The fixed set of gizmo handle/action names. A `GizmoActionLabel` value **must match the `name` of a `PolyList`** in a gizmo `Drawable` (see [`GizmoManager.setGizmoDrawable()`](GizmoManager.md#setgizmodrawabledrawable-drawable-void)) for that `PolyList` to become a draggable, interactive handle — `PolyList`s with any other name are still drawn, but ignored by hit-testing.

```ts
enum GizmoActionLabel {
    TranslateX = "TranslateX",
    TranslateY = "TranslateY",
    TranslateZ = "TranslateZ",
    TranslateXY = "TranslateXY",
    TranslateXZ = "TranslateXZ",
    TranslateYZ = "TranslateYZ",
    RotateX = "RotateX",
    RotateY = "RotateY",
    RotateZ = "RotateZ",
    Scale = "Scale",
    ScaleX = "ScaleX",
    ScaleY = "ScaleY",
    ScaleZ = "ScaleZ"
}
```

| Label | Meaning |
| --- | --- |
| `TranslateX` / `TranslateY` / `TranslateZ` | Move along a single local axis. |
| `TranslateXY` / `TranslateXZ` / `TranslateYZ` | Move freely on a local plane (the two named axes). |
| `RotateX` / `RotateY` / `RotateZ` | Spin around a single local axis. |
| `Scale` | Uniform scale (all three axes together). |
| `ScaleX` / `ScaleY` / `ScaleZ` | Scale along a single local axis. |

`GizmoActionLabels` is the same set as a plain `string[]` (`Object.values(GizmoActionLabel)`), used internally to test whether an arbitrary `PolyList.name` is a recognized handle.

## Usage

Naming a mesh's `PolyList` with one of these values is what makes it a handle when building a custom gizmo `Drawable`:

```ts
const cube = createCube(1, 1, 1);
cube.name = GizmoActionLabel.TranslateXZ; // clicking/dragging this mesh will translate on the local XZ plane
```

Also used as the key when overriding the default behavior of an action:

```ts
this.gizmoManager!.setAction(GizmoActionLabel.TranslateX, ({ node, transform, translation }) => {
    // custom TranslateX behavior
});
```
