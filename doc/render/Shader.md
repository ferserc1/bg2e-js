# Shader

Abstract base class for all render shaders. Each shader encapsulates a GLSL program (vertex + fragment programs) and the uniform/attribute binding logic needed for rendering.

Subclass this class to implement custom shaders:

- **`load()`**: Called once during initialization. Set up program resources, load textures etc.
- **`setup(polyListRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix)`**: Called every frame before rendering. Bind uniforms (matrices, lights etc.), textures and geometry attribute pointers.
- **`destroy()`**: Called during cleanup to release WebGL resources (delete GL programs etc.).

## Example: Custom Shader

```ts
import Shader from "bg2e-js/ts/render/Shader.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import ShaderProgram from "bg2e-js/ts/render/webgl/ShaderProgram.js";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import type PolyListRenderer from "bg2e-js/ts/render/PolyListRenderer.js";
import type MaterialRenderer from "bg2e-js/ts/render/MaterialRenderer.js";

class MyCustomShader extends Shader {
    private _program: ShaderProgram | null = null;

    constructor(renderer: Renderer) {
        super(renderer);

        const vertexCode = `...`;  // Vertex shader source code
        const fragmentCode = `...`; // Fragment shader source code

        this._program = new ShaderProgram(gl, "MyShader");
    }

    async load() {
        // Load any textures or resources the shader needs
    }

    setup(
        ply: PolyListRenderer,
        mr: MaterialRenderer,
        modelMatrix: Mat4,
        viewMatrix: Mat4,
        projectionMatrix: Mat4
    ): void {
        const renderer = this.renderer as WebGLRenderer;
        const { gl } = renderer;

        renderer.state.shaderProgram = this._program;  // Select the shader program

        // Bind uniforms
        this._program!.uniformMatrix4fv('mWorld', modelMatrix);
        this._program!.uniformMatrix4fv('mView', viewMatrix);
        this._program!.uniformMatrix4fv('mProj', projectionMatrix);

        // Bind material textures
        const texRenderer = mr.getTextureRenderer("albedoTexture");  // Material attribute name
        if (texRenderer) {
            texRenderer.activeTexture(0);  // Set texture unit
            texRenderer.bindTexture();     // Bind the texture
        }

        // Bind vertex attributes from polyListRenderer
        this._program!.positionAttribPointer(
            ply.positionAttribParams("vertPositions")  // Pass attribute name from vertex shader
        );

        gl.drawElements(gl.TRIANGLES, polyList.indexBuffer.numIndices, 0);
    }

    destroy() {
        if (this._program) {
            ShaderProgram.Delete(this._program);
        }
    }
}
```

## Base Class Properties (Read)

| Property | Type | Description |
|----------|------|-------------|
| `renderer` | Renderer | The base renderer (e.g. WebGLRenderer) instance this shader belongs to. |

## Abstract Methods

All must be overridden in the subclass:

- **`async load(): Promise<void>`** — Called during initialization. Load any required resources (textures etc.).
- **`setup(polyListRenderer: PolyListRenderer, materialRenderer: MaterialRenderer, modelMatrix: Mat4 = new Mat4(), viewMatrix: Mat4 = new Mat4(), projectionMatrix: Mat4 = new Mat4()): void`** — Called every frame before rendering. Bind all uniforms, textures and attribute pointers.
- **`destroy(): void`** — Called during cleanup to release WebGL shader resources (delete GL programs etc.).

## Using a Shader with RenderState

```ts
// Create and load the shader:
const shader = new MyCustomShader(renderer);
await shader.load();

// Use it in a render state:
const rs = new RenderState({
    shader,                    // ← your custom shader
    polyListRenderer: pr,     // Geometry wrapper
    materialRenderer: mr,      // Material wrapper
    modelMatrix: Mat4.MakeIdentity(),
    viewMatrix: viewMat,       // Reference - will be mutated per frame
    projectionMatrix: projMat  // Reference - will be updated per frame
});
```

## Pre-built Shaders

Shaders are built separately from the render package in `shaders/`. To use pre-built shader classes:

```ts
import PBRLightIBLShader from "bg2e-js/ts/shaders/PBRLightIBLShader.ts";
import BasicDiffuseColorShader from "bg2e-js/ts/shaders/BasicDiffuseColorShader.ts";
import TextureMergerShader from "bg2e-js/ts/shaders/TextureMergerShader.ts";
```

These are designed to work with specific render states and pipelines. Refer to the sample code for proper usage patterns:
- [`samples/18_pbr_ibl/src/main.ts`](../../../samples/18_pbr_ibl/src/main.ts) — PBR with IBL + lights
- [`samples/12_render_to_texture/src/main.ts`](../../../samples/12_render_to_texture/src/main.ts) — Render-to-texture with a shader
