# GizmoComponent

```ts
import GizmoComponent from "bg2e-js/ts/manipulation/GizmoComponent.js";
```

Marker component (`typeId: "Gizmo"`). A node needs both a `Transform` and a `GizmoComponent` for [`GizmoManager`](GizmoManager.md) to consider it eligible to show a gizmo when it becomes the resolved selection. If the resolved selection itself lacks these components but its immediate parent has both, `GizmoManager` falls back to the parent's gizmo instead (see [`resolveTargetNode()`](GizmoManager.md#resolvetargetnode-node--null)):

```ts
node.addComponent(new Transform());
node.addComponent(new GizmoComponent());
```

It carries no other behavior — `GizmoManager` only checks for the component's *presence* (`node.component("Gizmo")`), not any of its properties. It must be registered once, typically via `registerComponents()`:

```ts
import { registerComponents } from "bg2e-js/ts/scene/index.js";
registerComponents(); // registers "Gizmo" (and every other built-in component type)
```

## Constructor

```ts
constructor()
```

## Properties

### enabled: boolean

Default `true`. Serialized (`deserialize`/`serialize`) alongside the component. It is provided as a per-node toggle for application code (e.g. hide a scene-graph-defined `Gizmo` without removing the component), but note that `GizmoManager`'s current node-resolution logic does not read this flag itself — to actually hide the gizmo for a specific node at runtime, remove the `GizmoComponent`, or disable `GizmoManager` globally with `gizmoManager.disable()`.

## Methods

Standard `Component` overrides: `clone()`, `assign(other)`, `serialize(sceneData, writer)`, `deserialize(sceneData, loader)`.
