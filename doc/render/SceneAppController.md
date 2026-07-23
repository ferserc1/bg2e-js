# SceneAppController

An `AppController` derivative that wraps a [`SceneRenderer`](SceneRenderer.md) for convenient scene-based rendering. Handles the app lifecycle (init, frame, display) and automatically forwards all input events to the scene renderer.

This is the recommended approach for most applications — it automates init, render queue management and frame rendering.

```ts
import SceneAppController from "bg2e-js/ts/render/SceneAppController.js";

class MyApp extends SceneAppController {
    async init() {
        super.init();  // ← Always call super first

        // Create scene, set environment and camera...
    }
}
```

## Setup Pattern

```ts
const canvas = new Canvas(canvasElem, new WebGLRenderer());
canvas.domElement.style.width = "100vw";
canvas.domElement.style.height = "100vh";

const appController = new MyApp();
// Or: const appController = new SceneAppController(scene);

const mainLoop = new MainLoop(canvas, appController);
await mainLoop.run();  // FrameUpdate.AUTO by default
```

## Constructor (Optional sceneRoot)

Pass a `Node` at construction time to pre-wire the camera and root:

```ts
const sceneRoot = new Node("scene");  // ... add children...

// Camera node added automatically if missing:
const sceneRenderer = myWebGLRenderer.factory.scene();

// Wire up camera and root (automatically updates scene render):
sceneRenderer.bindRender(sceneRoot, nodeWithCamera);

// SceneAppController will use this scene renderer directly:
const app = new MyApp(sceneRoot);

// Or create the controller with a full scene renderer:
const app = new MyApp(sceneRenderer);

// Or just the scene renderer to get started:
const app = new MyApp(); // sceneRoot will be created internally later
```

## Methods

### init() (Override this)

The main initialization hook. Called after `mainLoop.run()` starts and before the first frame:

```ts
async init() {
    super.init();  // Load default shader (PBRLightIBL), load camera, load environment

    const sceneRoot = this.createScene();  // ← Define your custom scene
}
```

This method:
1. Sets default state on the renderer (`enableDepth`, `viewport` synced to canvas, clear color dark gray).
2. Binds key/mouse input handlers: `keydown`, `keyup`, `mousedown`, `mousemove`, `dragstart`, `wheel`.
3. Initializes the scene renderer (load camera, load environment, set render root + cameras).
4. Initializes `SelectionManager`, `SelectionHighlight` and `GizmoManager` (in that order — see [Selection and gizmos](#selection-and-gizmos) below).

## Selection and gizmos

`SceneAppController` wires up three collaborating pieces from the [`manipulation` module](../manipulation/index.md): [`SelectionManager`](../manipulation/SelectionManager.md) (click-to-select), [`SelectionHighlight`](../manipulation/SelectionHighlight.md) (outline the selection) and `GizmoManager` (draggable translate/rotate/scale handles on the selection). This section is a practical, task-oriented guide to using them together through `SceneAppController`; see each class's own reference page for the full API. The samples [`23_selection`](../../samples/23_selection), [`30_bounding_box`](../../samples/30_bounding_box) and [`31_gizmo_manager`](../../samples/31_gizmo_manager) are working, runnable versions of what's shown here (`pnpm dev:selection`, `pnpm dev:bounding_box`, `pnpm dev:gizmo_manager`).

### Enabling and disabling each piece

Each piece is created — or not — once, during `init()`, based on a `*Enabled` getter you can override (like `createCamera()`/`setCamera()`, this follows the "override a getter, read the instance" pattern). This is a **startup** decision, not a live toggle:

```ts
class MyApp extends SceneAppController {
    get selectionManagerEnabled() { return true; }   // default: true
    get selectionHighlightEnabled() { return true; } // default: true
    get gizmoManagerEnabled() { return true; }        // default: true
}
```

- **`this.selectionManager`** — created if `selectionManagerEnabled`. Picks `PolyList`/`Drawable` objects on click.
- **`this.selectionHighlight`** — created if `selectionHighlightEnabled`. Draws an outline around whatever `.selected` flags `selectionManager` set — it has no runtime enable/disable of its own; not calling `selectionHighlight.draw()` (which only happens if it was created) is the only way to turn it off, so use the getter for that.
- **`this.gizmoManager`** — created if `gizmoManagerEnabled` **and** `selectionManagerEnabled` (it resolves its target node from `this.selectionManager.selection`, so without a `SelectionManager` it logs a warning and is left `null`).

Once created, `selectionManager` and `gizmoManager` (but not `selectionHighlight`) additionally expose a **runtime** enabled flag, independent of the getters above — useful for temporarily suspending picking/gizmo interaction without tearing anything down:

```ts
this.selectionManager?.disable(); // stop picking; also clears the current selection
this.gizmoManager?.disable();     // hide the gizmo and ignore its mouse events
this.gizmoManager?.enable();
```

### Selection modes and multi-select

`selectionManager.selectionMode` ([`SelectionMode`](../manipulation/SelectionMode.md)) controls click granularity:

```ts
import SelectionMode from "bg2e-js/ts/manipulation/SelectionMode.js";

this.selectionManager!.selectionMode = SelectionMode.POLY_LIST; // default — selects one mesh part
this.selectionManager!.selectionMode = SelectionMode.OBJECT;    // selects the whole Drawable
```

`selectionManager.multiSelectMode` controls whether a click replaces the selection or accumulates it:

```ts
this.selectionManager!.multiSelectMode = true;
```

- **Single-select** (default) — clicking an item replaces the selection; clicking empty space clears it.
- **Multi-select** — clicking a new item adds it; clicking an already-selected item removes it; clicking empty space leaves the selection untouched.

Not every object needs to be pickable — only `PolyList`s with `isSelectable` true (the default) participate. Restrict selection to specific nodes with `Drawable.makeSelectable()`:

```ts
findVisitor.result.forEach(node => {
    node.drawable?.makeSelectable(node.name === "Ball"); // ground stays unselectable, balls don't
});
```

React to selection changes anywhere with `onSelectionChanged`:

```ts
this.selectionManager!.onSelectionChanged("myApp", (selection) => {
    selection.forEach(item => console.log(item.drawable.name));
});
```

Style the outline drawn by `selectionHighlight`:

```ts
this.selectionHighlight!.borderColor = new Vec(0.0, 0.8, 0.3, 1.0);
this.selectionHighlight!.borderWidth = 6;
```

### The gizmo system

For a node to display a gizmo when selected, it needs both a `Transform` and a [`GizmoComponent`](../manipulation/GizmoComponent.md):

```ts
import GizmoComponent from "bg2e-js/ts/manipulation/GizmoComponent.js";

node.addComponent(new Transform());
node.addComponent(new GizmoComponent());
```

`GizmoManager` draws a single **shared** gizmo `Drawable` (a plain cube by default, wired to the `TranslateXZ` action) — never one per node — reused for whichever gizmo-eligible node is currently resolved as the target. Target resolution always follows **the last item added to the selection**: with a single selected item that's simply that item; with `selectionManager.multiSelectMode = true`, the gizmo follows whichever object was most recently added.

```ts
this.selectionManager!.multiSelectMode = true; // gizmo follows the last-added item
```

Basic configuration:

```ts
this.gizmoManager!.transparency = 0.75;     // alpha applied to the gizmo material (default 0.85)
this.gizmoManager!.fixedScreenSize = 0.2;   // constant on-screen size, independent of camera distance (default 0.15)
```

#### Custom gizmo models

Replace the default cube with any `Drawable` — programmatic or loaded from a file. A custom `Drawable` can contain any subset of the `GizmoActionLabel` names as `PolyList` names (`TranslateX/Y/Z`, `TranslateXY/XZ/YZ`, `RotateX/Y/Z`, `Scale`, `ScaleX/Y/Z`, see [`GizmoActionLabel`](../manipulation/GizmoActionLabel.md)) — each labeled `PolyList` becomes a draggable handle for that action, and back-face culling is always forced on for gizmo geometry regardless of the source material:

```ts
this.gizmoManager!.setGizmoDrawable(myDrawable); // any Drawable you already built
```

Or load one from a model file with `loadGizmo()`. Since most modeling tools won't name meshes after a `GizmoActionLabel`, pass a `labelMap` to rename a `PolyList` (keyed by its original name) into one:

```ts
import GizmoActionLabel from "bg2e-js/ts/manipulation/GizmoActionLabel.js";

// PlaneGizmo.bg2's single PolyList is named "Cube.0010" in the source file
await this.gizmoManager!.loadGizmo("../resources/PlaneGizmo.bg2", {
    "Cube.0010": GizmoActionLabel.TranslateXZ
});
```

#### Custom actions

Override what dragging a given handle does with `setAction()`. Callbacks receive distilled, world-space parameters (never raw mouse/viewport data) computed via ray-plane intersection against the handle for maximum drag precision:

```ts
this.gizmoManager!.setAction(GizmoActionLabel.TranslateX, ({ node, transform, translation }) => {
    // translation: Vec — this frame's world-space delta, only set for Translate* labels
    // override the default behavior for one action label
});
```

`Rotate*` callbacks receive `axis`/`angle` instead, and `Scale*`/`Scale` receive `scale`; see [`GizmoManager.setAction()`](../manipulation/GizmoManager.md#setactionlabel-gizmoactionlabel-cb-gizmoactioncallback-void) for the full parameter shape and the built-in default behavior each label falls back to when not overridden.

### Input event gating during a drag

While a gizmo handle is being dragged, mouse events must **not** reach the rest of the scene graph — otherwise components like `OrbitCameraController`/`SmoothOrbitCameraController` would move the camera at the same time the gizmo is being manipulated. `SceneAppController` handles this automatically by checking `gizmoManager.isInteracting` in its mouse handlers:

- **`mouseDown`** — always forwarded to `gizmoManager` first (it performs the hit-test synchronously); only forwarded to `sceneRenderer`/`selectionManager` afterwards if the gizmo did **not** claim the click.
- **`mouseMove` / `mouseDrag` / `mouseWheel`** — forwarded to the scene graph only while `!gizmoManager.isInteracting`; forwarded to `gizmoManager` instead while a drag is active.
- **`mouseUp`** — whether the gizmo was interacting is captured *before* calling `gizmoManager.mouseUp()` (which clears the flag), so the same click that ends a drag is still correctly excluded from `sceneRenderer`/`selectionManager`.

This blocking is scoped exactly to the duration of a gizmo interaction (`isInteracting`) — at every other time, input reaches the scene graph exactly as if `gizmoManager` weren't there.

### frame(delta: number): Promise<void> | void

Called every frame. Updates the view matrix, syncs camera to scene renderer, processes scene input events and calls `sceneRenderer.frame(sceneRoot)`.

Override this to perform animations or updates (e.g., update camera transform, add/remove objects):

```ts
protected async frame(delta: number) {
    await super.frame(delta);  // ← Always call parent first to render scene

    // Update custom properties after rendering
    this._rotation += delta * 0.001;
}
```

### display(): void | Promise<void>

Handles canvas resize events in addition to calling `super.display()`. Override for custom display logic:

```ts
reshape(w: number, h: number) {  // Called before display() during canvas resize
    this.canvas.updateViewportSize();  // Sync DOM element size to WebGL
}
```

### destroy(): void | Promise<void>

Called on `MainLoop.exit()`. Releases scene resources. No custom logic needed unless your app has unique cleanup needs:

```ts
destroy() {
    super.destroy();  // Release scene resources, clear polylist/renderers
}

async exit() {
    await super.exit();  // Calls MainLoop.exit() + cleanup
}

// Or: just return false from key handler to exit.
```

### onKey(evt): void | Promise<void>

Overrides `AppController.onKey(evt)` to forward `dispatchKeyDown(evt)` and `dispatchKeyUp(evt)`. Handle custom keys by calling super then custom handling:

```ts
async onKey(evt: Bg2KeyboardEvent) {  // Also works with keyUp
    await super.onKey(evt);

    if (evt.key === "Escape") {  // Or SpecialKey.ESCAPE
        this.mainLoop.exit();
    }
}
```

### createCamera(): Camera | null (Override this) or use setCamera(camera)

If you override `createCamera()`, it is called during `init()` to add the camera to your scene. Returns a `Camera` node:

```ts
protected createCamera(): Camera {  // Called by init() automatically
    const cam = new Camera();  // or your custom camera implementation

    this.setCamera(nodeWithCamera);  // Required: set scene root and camera for rendering
    return cam;
}

// Or use a pre-existing:
setCamera(nodeWithCamera); // Set after you've built your scene

// Or use an already-created camera node:
setCamera(existingCameraNode);
```

### async createScene(): Node | null (Override this or use loadFromURL / loadScene)

If you want to build the scene programmatically (not from a file), override `createScene()`:

```ts
public async createScene(): Node {
    const root = this.createDefaultScene();  // Gets or creates scene root

    // Add lights:
    const light = new Light();
    await light.deserialize({ ...lightProps });  // Set properties with deserialize()

    const sphereModel = createSphere(0.5);  // Or load via Loader
    let sphereModel: PolyList | null;

    if (!sphereModel) {
        sphereModel = createSphere(0.3);  // Only once! (Reuse it for all instances)
        sphereModel = this.sphereModel;  // Store in this for later reuse
    }

    const diffuse = [0.5, 0.8, 1.0];
    for (let x = -2; x < 2; x++) {
        for (let y = -1.5; y < 1; y++) {
            const roughness = (x + 2) / 4;  // Remap to [0, 1]
            const metallic = (y + 1.5) / 2.5;

            root.addChild(this.createSphere(sphereModel, roughness, metallic, diffuse,
                x * 0.5 + sphereRadius, y * 0.5));
        }
    }

    return root;
}
```

### destroyScene(): void

Override to clean up scene resources (remove nodes, release textures etc.). Called by `destroy()`.

### loadScene(sceneUrl?: string): Promise<void> | void

Loads scene objects (meshes, lights) from a `.vitscnj` file:

```ts
await this.loadScene('../resources/test-scene.vitscnj');
// or with explicit file:
await this.loadScene('../resources/my-scene.vitscnj');  // Optional explicit path
```

This loads meshes, lights and camera from the scene file into `createDefaultScene()`'s root node.

### loadFromURL(url: string, fileFormat?: string): Promise<void> | void

Generic URL-based loading for scene files:

```ts
// Load from a remote or local URL with explicit format hint:
await this.loadFromURL("../resources/my-scene.vitscnj", "vitscn");

// Or with format auto-detection:
await this.loadFromURL('../resources/some-scene.vitscnj');  // Detected as "vitscn" automatically
```

### createDefaultScene(): Node (Override this)

Creates the scene root with default setup. Override to add a custom background, skybox or other defaults:

```ts
protected override createDefaultScene(): Node {
    const root = super.createDefaultScene();  // Calls base to get the properly initialized scene root

    // Add custom background, lighting or other defaults:
    return root;
}
```

### bindRenderer(sceneRoot, camera): Promise<void> | void

Binds the scene root and camera node(s) to the renderer:

```ts
await this.bindRender(sceneRoot);  // Auto-attach cameras by name or by component
```
