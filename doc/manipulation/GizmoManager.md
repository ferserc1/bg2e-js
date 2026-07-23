# GizmoManager

```ts
import GizmoManager, { GizmoActionParams, GizmoActionCallback } from "bg2e-js/ts/manipulation/GizmoManager.js";
```

Draws a translate/rotate/scale gizmo over the currently selected node and turns mouse drags on its handles into edits of that node's `Transform` component. It requires a [`SelectionManager`](SelectionManager.md) instance (injected in the constructor) to resolve *which* node to show a gizmo for — it does not do its own scene-wide hit-testing for that.

`SceneAppController` creates and drives one automatically (see the [Selection and Gizmos Guide](../render/SceneAppController.md#selection-and-gizmos) for a full practical walkthrough); this page documents the class API in detail.

## Constructor

```ts
constructor(renderer: Renderer, selectionManager: SelectionManager)
```

## Setup

### init(): Promise\<void\>

Must be called once before use (`SceneAppController` does this for you). It:

1. Builds the **default gizmo**: a procedural unit cube (`primitives/cube.ts`) whose single `PolyList` is named `GizmoActionLabel.TranslateXZ` — so out of the box, dragging the gizmo translates the node on its local XZ plane.
2. Loads `GizmoShader` (an unlit, albedo-only shader with a global alpha uniform) and sets up a `RenderQueue` on `RenderLayer.GIZMO_DEFAULT` with alpha blending enabled, for transparent gizmo rendering.
3. Creates the internal `GizmoDrawVisitor` and `GizmoPickBuffer` (see [module internals](index.md#internal-implementation)).

### sceneRoot: Node | null

The scene root passed to `draw()`/used to resolve `camera` — set this once after `init()` (mirrors `SelectionManager.sceneRoot`).

### camera: Camera | null

The camera used for gizmo drawing/picking math. Falls back to `Camera.GetMain(sceneRoot)` if not set explicitly.

### setViewportSize(w: number, h: number): void

Resizes the internal gizmo pick buffer. Call on every resize.

## The shared gizmo Drawable

`GizmoManager` keeps a **single** `Drawable` and reuses it for whichever node currently needs a gizmo — it is not duplicated per node in the scene.

### setGizmoDrawable(drawable: Drawable): void

Replaces the shared gizmo model with a custom one. Every `PolyList` in `drawable` is:

- Forced onto `RenderLayer.GIZMO_DEFAULT | RenderLayer.GIZMO_PICK` (overriding whatever layers it had).
- Assigned a unique flat `colorCode` for hit-testing (same mechanism `SelectionManager` uses).
- Forced to `enableCullFace = true`, regardless of its source material — this guarantees back faces are always culled on gizmo geometry, even for models loaded from files whose material JSON doesn't specify a `cullFace` flag (which would otherwise select the "cull disabled" render pipeline).

Any `PolyList` whose `name` matches a [`GizmoActionLabel`](GizmoActionLabel.md) becomes an interactive, draggable handle; `PolyList`s with other names are drawn but never picked. A gizmo `Drawable` can contain any subset of the labels — you don't need to provide all thirteen.

```ts
const drawable = new Drawable("Gizmo");
drawable.addPolyList(translateXHandle, material);
drawable.addPolyList(rotateYHandle, material);
this.gizmoManager!.setGizmoDrawable(drawable);
```

### loadGizmo(url: string, labelMap?: Partial\<Record\<string, GizmoActionLabel\>\>\>): Promise\<void\>

Utility that loads a `Drawable` from a model file (`.bg2`/`.vwglb`, same as `Loader.loadDrawable()`) and installs it via `setGizmoDrawable()`. Model files are typically authored without their `PolyList`s named after a `GizmoActionLabel`, so the optional `labelMap` renames them — keyed by each `PolyList`'s **original** name — to make the loaded handles interactive:

```ts
// PlaneGizmo.bg2 has a single PolyList named "Cube.0010"
await this.gizmoManager!.loadGizmo("../resources/PlaneGizmo.bg2", {
    "Cube.0010": GizmoActionLabel.TranslateXZ
});
```

Note that the referenced model file's loader plugin (e.g. `Bg2LoaderPlugin`) must already be registered — `registerLoaderPlugin(new VitscnjLoaderPlugin())`, done once for `.vitscnj` scene loading, also registers `Bg2LoaderPlugin` as a dependency, so a plain `.bg2`/`.vwglb` load usually works without extra setup.

### gizmoDrawable: Drawable | null (read-only)

The currently installed gizmo `Drawable` (default cube, or whatever was last passed to `setGizmoDrawable()`/`loadGizmo()`).

## Actions

### setAction(label: GizmoActionLabel, cb: GizmoActionCallback): void

Overrides the callback invoked while dragging the handle named `label`. Callbacks receive "distilled" parameters — world-space matrices/vectors, never raw mouse/viewport data — so they can be written without knowing anything about screen-space math:

```ts
type GizmoActionParams = {
    node: Node;
    transform: Transform;
    translation?: Vec; // Translate* — world-space delta for this frame
    axis?: Vec;         // Rotate* — world-space unit axis
    angle?: number;      // Rotate* — delta angle (radians) for this frame
    scale?: Vec;         // Scale* — per-axis multiplicative factor for this frame
};
type GizmoActionCallback = (params: GizmoActionParams) => void;
```

Only the fields relevant to the label being dragged are populated (e.g. a `Translate*` callback only ever receives `translation`). Each callback call carries one frame's worth of incremental delta, not a cumulative total — apply it on top of the node's current `transform.matrix`.

```ts
this.gizmoManager!.setAction(GizmoActionLabel.TranslateX, ({ transform, translation }) => {
    if (!translation) return;
    console.log("moved by", translation.x, translation.y, translation.z);
    // still apply the default behavior, or implement your own:
});
```

#### Default action behavior

If you don't override a label, `GizmoManager` ships with these defaults for every label of that kind:

- **Translate\* (`TranslateX/Y/Z/XY/XZ/YZ`)** — converts the world-space `translation` into the node's parent local space (using the parent's world rotation only, ignoring its scale) and adds it to `transform.matrix`'s translation component.
- **Rotate\* (`RotateX/Y/Z`)** — converts `axis` into the node's parent local space, rotates `transform.matrix` by `angle` around it, then restores the original position — so the node spins in place instead of orbiting around its parent's origin.
- **Scale (`Scale/ScaleX/Y/Z`)** — post-multiplies `transform.matrix` by a scale matrix built from `scale` (only the relevant axis/axes differ from `1` for the single-axis labels).

### isInteracting: boolean (read-only)

`true` from the moment a gizmo handle is hit on `mouseDown()` until the matching `mouseUp()`. `SceneAppController` reads this to stop forwarding mouse events to the rest of the scene graph while a drag is in progress — see [Selection and Gizmos Guide § Input event gating](../render/SceneAppController.md#input-event-gating-during-a-drag).

## Node resolution

### resolveTargetNode(): Node | null

Returns the node whose gizmo should currently be shown, or `null`. It starts from `selectionManager.selection[selection.length - 1].drawable.node` — i.e. the **last item added to the selection** — which covers both cases the API needs: with a single selected item, "the last item" is simply that item; with `SelectionManager.multiSelectMode = true`, the gizmo automatically follows whichever object was most recently added to the selection.

That node is returned directly if it has both a `Transform` and a `Gizmo` ([`GizmoComponent`](GizmoComponent.md)) component. Otherwise, its immediate parent is checked for the same pair of components; if the parent qualifies, the parent node is returned instead, so selecting a child of a group node still lets the group be manipulated through its own gizmo. If neither the node nor its parent qualifies, `resolveTargetNode()` returns `null` and no gizmo is shown.

## Drawing

### computeGizmoMatrix(node: Node, viewMatrix: Mat4): Mat4

Computes the world matrix used to place and size the gizmo at `node`: `Transform.GetWorldMatrix(node)` with its scale replaced by a fixed value derived from the node's distance to the camera (`viewMatrix`) and `fixedScreenSize`, so the gizmo keeps a **constant apparent size on screen** regardless of camera distance. Exposed publicly because it's also needed to interpret click/drag screen coordinates against the gizmo's actual on-screen geometry.

### draw(sceneRoot: Node, camera: Camera): void

Call once per frame, after the main scene draw. Resolves the target node; if there is none (or the manager is `disabled`), draws nothing. Otherwise:

1. Draws the shared `Drawable` at the target node, using the fixed-scale matrix from `computeGizmoMatrix()`.
2. Clears **only the depth buffer** (`renderer.frameBuffer.clearDepth()`, not the color buffer) so the gizmo is drawn on top of the already-rendered scene without erasing it, then draws with alpha blending — giving the "always visible, semi-transparent overlay" look.

## Input handling

`GizmoManager` performs its own GPU color-pick (via the internal `GizmoPickBuffer`, scoped to just the gizmo `Drawable`, not the whole scene) to detect which handle, if any, was clicked.

### mouseDown(evt: Bg2MouseEvent): void

If enabled and a target node is resolved, computes the gizmo matrix and picks at `(evt.x, evt.y)`. If a labeled handle was hit, starts a drag: an intersection plane is chosen appropriate to the action (a camera-facing plane through the handle's axis for single-axis translate/scale; a world-aligned plane for two-axis translate; the axis-normal plane for rotate; a view-facing plane for uniform scale), and the ray-plane hit point is stored as the drag's reference point.

### mouseDrag(evt: Bg2MouseEvent): void

If a drag is active, re-intersects the current mouse ray with the stored plane (this ray-plane intersection is what makes gizmo dragging track the cursor precisely, rather than using less accurate screen-delta heuristics) and calls the action callback for the active label with this frame's incremental delta (`translation`, or `axis`+`angle`, or `scale`, depending on the label).

### mouseUp(evt: Bg2MouseEvent): void

Ends the active drag (`isInteracting` becomes `false`).

## Other properties

### enabled: boolean

Default `true`. Setting it to `false` also cancels any active drag. `enable()`/`disable()` are shorthands for setting it.

```ts
this.gizmoManager!.disable(); // hide the gizmo and ignore its mouse events
this.gizmoManager!.enable();
```

### transparency: number

Default `0.85`. Alpha applied to the gizmo material while drawing (forwarded to the `GizmoShader`'s alpha uniform).

```ts
this.gizmoManager!.transparency = 0.75;
```

### fixedScreenSize: number

Default `0.15`. Scale factor controlling the gizmo's constant on-screen size (see `computeGizmoMatrix()`) — larger values make the gizmo appear bigger on screen at any given camera distance.

```ts
this.gizmoManager!.fixedScreenSize = 0.2;
```

### destroy(): void

Releases the internal gizmo pick buffer/texture.
