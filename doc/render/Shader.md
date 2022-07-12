# Shader

This is the `render` package object in charge of:

- Determining how data from a `PolyListRenderer`, a `MaterialRenderer` and the current transformation matrices are used, to generate a rendering on screen.
- Abstract the specific graphics API used.

For example, we can have a `Shader` that implements PBR to render an object using `WebGL`, and a different shader that performs the same rendering but using `Web GPU`.

Since all objects in the `render` package used in an application must be from the same graphics API, the starting data used with a `Shader` object will always be instances compatible with the selected graphics API.

## Constructor

The `Shader` constructor receives the `Renderer` object. When implementing a shader, the first thing to do is to check that the graphics API of the renderer is the same as the one for which the shader is designed. Optionally, we can also create shaders that support multiple graphics APIs, in this case, we will check the type of the `Renderer` to know in which API we must work.

```js
import WebGLRenderer from 'bg2e/render/webgl/Renderer';
import WebGPURenderer from 'bg2e/render/webgpu/Renderer';

const initWebGLShader = () => {
    // Initialize shader using WebGL API
}

const initWebGPUShader = () => {
    // Initialize shader using Web GPU API
}

class MyShader extends Shader {
    constructor(renderer) {
        super(renderer);

        if (renderer instanceof WebGLRenderer) {
            initWebGLShader.apply(this);
        }
        else if (renderer instanceof WebGPURenderer) {
            initWebGPUShader.apply(this);
        }
        else {
            throw new Error("Invalid renderer API. Valid APIs are WebGL or Web GPU");
        }
    }
}
```

## Functions

**`setup()`**: It is called just before the commands that cause the object to be rendered are invoked, so inside this function we have to prepare the renderer state for this. 

**`destroy()`**: It's called when the shader need to be destroyed.

## Example

The following listing is an example of a Shader for WebGL API that only uses the diffuse color of the material:

```js
import Shader from 'bg2e/render/Shader';
import ShaderProgram from 'bg2e/render/webgl/ShaderProgram';
import Vec from 'bg2e/math/Vec';

class MyShader extends Shader {
    constructor(renderer) {
        super(renderer);

        const vertexShaderCode = 
            `precision mediump float;

            attribute vec3 vertPosition;
            
            uniform mat4 mWorld;
            uniform mat4 mView;
            uniform mat4 mProj;

            void main() {
                gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
            }`;

        const fragmentShaderCode = `
            precision mediump float;

            uniform vec3 uFixedColor;

            void main() {
                gl_FragColor = vec4(uFixedColor, 1.0);
            }`;
        
        const { gl } = renderer;
        this._program = new ShaderProgram(gl, "SimpleColorCombination");
        this._program.attachVertexSource(vertexShaderCode);
        this._program.attachFragmentSource(fragmentShaderCode);
        this._program.link();
    }

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        const material = materialRenderer.material;
        this.renderer.state.shaderProgram = this._program;
        this._program.uniformMatrix4fv('mWorld', false, modelMatrix);
        this._program.uniformMatrix4fv('mView', false, viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, projectionMatrix);

        if (material.diffuse instanceof Vec) {
            this._program.uniform3fv('uFixedColor', material.diffuse.rgb);
        }
        else {
            // If you want to draw a texture, use materialRenderer.getTexture(attribName) to
            // get the render API texture object.
            const webglTexture = materialRenderer.getTexture('diffuse');
            // webglTexture is a WebGL texture object.
        }

        this._program.positionAttribPointer(plistRenderer.positionAttribParams('vertPosition'));
    }

    destroy() {
        ShaderProgram.Delete(this._program);
    }
}

```
