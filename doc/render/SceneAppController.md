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
