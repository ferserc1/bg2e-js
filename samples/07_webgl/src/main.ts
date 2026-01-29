
import math from 'bg2e-js/ts/math/index.ts';
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Canvas from "bg2e-js/ts/app/Canvas.ts";
import AppController from "bg2e-js/ts/app/AppController.ts";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import ShaderProgram from "bg2e-js/ts/render/webgl/ShaderProgram.ts";
import VertexBuffer from 'bg2e-js/ts/render/webgl/VertexBuffer.js';
import Bg2KeyboardEvent, { SpecialKey } from "bg2e-js/ts/app/Bg2KeyboardEvent.ts";
import Color from "bg2e-js/ts/base/Color.ts";
import WebGLRenderer from 'bg2e-js/ts/render/webgl/Renderer.js';
import { BufferTarget } from 'bg2e-js/ts/render/webgl/VertexBuffer.js';

const vertexShaderCode = 
`precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
    fragColor = vertColor;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
`;

const fragmentShaderCode = `
precision mediump float;

varying vec3 fragColor;

uniform vec3 uFixedColor;

void main() {
    gl_FragColor = vec4(fragColor * uFixedColor, 1.0);
}
`;

const boxVertices = [
    //top
    -1.0, 1.0, -1.0,   0.5, 0.8, 0.5,
    -1.0, 1.0, 1.0,    0.5, 0.8, 0.5,
    1.0, 1.0, 1.0,     0.5, 0.8, 0.5,
    1.0, 1.0, -1.0,    0.5, 0.8, 0.5,
    //left
    -1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
    -1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
    -1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
    -1.0, 1.0, -1.0,   0.75, 0.25, 0.5,
    //right
    1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
    1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
    1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
    1.0, 1.0, -1.0,   0.25, 0.25, 0.75,
    //front
    1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
    1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
    -1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
    -1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
    //back
    1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
    1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
    -1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
    -1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
    //bottom
    -1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
    -1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
    1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
    1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
    ];
    
const boxIndices = [
    //top
    0, 1, 2,
    0, 2, 3,
    //left
    5, 4, 6,
    6, 4, 7,
    // right
    8, 9, 10,
    8, 10, 11,
    //front
    13, 12, 14,
    15, 14, 12,
    //back
    16, 17, 18,
    16, 18, 19,
    //bottom
    21, 20, 22,
    22, 20, 23
];

class MyAppController extends AppController {
    private _program: ShaderProgram | null = null;
    private _vertex: VertexBuffer | null = null;
    private _index: VertexBuffer | null = null;
    private _color: Color = new Color();
    private _elapsed: number = 0;
    private _angle: number = 0;
    private _worldMatrix: Mat4 = Mat4.MakeIdentity();
    private _viewMatrix: Mat4 = Mat4.MakeIdentity();
    private _projMatrix: Mat4 = Mat4.MakeIdentity();

    async init() {
        const { gl, state } = this.renderer;

        const extensions = gl.getSupportedExtensions();
        console.log("WebGL Extensions:");
        console.log(extensions);

        state.depthTestEnabled = true;
        
        this._program = new ShaderProgram(gl, "SimpleColorCombination");
        this._program.attachVertexSource(vertexShaderCode);
        this._program.attachFragmentSource(fragmentShaderCode);
        this._program.link();

        state.shaderProgram = this._program;

        this._vertex = VertexBuffer.CreateArrayBuffer(gl, new Float32Array(boxVertices));
        this._index = VertexBuffer.CreateElementArrayBuffer(gl, new Uint16Array(boxIndices));
        
        this._color = Color.Black();

        // To get the current binded buffers
        // const ab = VertexBuffer.CurrentBuffer(gl,BufferTarget.ARRAY_BUFFER);
        // const eab = VertexBuffer.CurrentBuffer(gl,BufferTarget.ELEMENT_ARRAY_BUFFER);
    }

    reshape(width: number, height: number) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
        this.renderer.canvas.updateViewportSize();
    }

    async frame(delta: number) {
        this._elapsed = this._elapsed || 0;
        this._elapsed += delta / 1000;
        this._angle = this._angle || 0;
        this._worldMatrix = Mat4.MakeIdentity();
        this._viewMatrix = Mat4.MakeLookAt(
            new Vec(0, 0, -8),
            new Vec(0, 0, 0),
            new Vec(0, 1, 0)
        );
        this._projMatrix = Mat4.MakePerspective(
            45,
            this.canvas.viewport.aspectRatio,
            0.1, 1000.0
        );

        this._angle += (delta / 1000) * Math.PI / 2;
        this._worldMatrix.rotate(this._angle, 1, 0, 0);
        this._worldMatrix.rotate(this._angle / 4, 0, 1, 0);

        this._color = new Color([
            this._color[0] = math.abs(math.sin(this._elapsed) * 0.5 - 0.5),
            this._color[1] = math.abs(math.cos(this._elapsed) * 0.5 - 0.5),
            this._color[2] = math.abs(math.sin(this._elapsed + 1) * 0.5 - 0.5),
            1
        ]);
    }

    display() {
        if (!this._program || !this._vertex || !this._index) {
            return;
        }

        const { gl, state } = this.renderer;
        //state.viewport = new Vec(this.canvas.width, this.canvas.height);
        const clearColor = Color.Sub(Color.White(), this._color);
        clearColor.a = 1;
        state.clearColor = clearColor;
        state.clear();
 
        this._program.uniformMatrix4fv('mWorld', false, this._worldMatrix);
        this._program.uniformMatrix4fv('mView', false, this._viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, this._projMatrix);
        this._program.uniform3fv('uFixedColor', this._color.rgb);
        
        this._vertex.bind(BufferTarget.ARRAY_BUFFER);
        this._program.positionAttribPointer({ name: 'vertPosition', stride: 6, enable: true });
        this._program.colorAttribPointer({ name: 'vertColor', size: 3, stride: 6, offset: 3, enable: true});
        this._index.bind(BufferTarget.ELEMENT_ARRAY_BUFFER);
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    }

    destroy() {
        if (this._vertex) VertexBuffer.Delete(this._vertex);
        if (this._index) VertexBuffer.Delete(this._index);
        if (this._program) ShaderProgram.Delete(this._program);
    }

    keyUp(evt: Bg2KeyboardEvent) {
        const { gl } = this.renderer;
        if (evt.key === SpecialKey.ESCAPE) {
            this.mainLoop.exit();
        }

        if (evt.key === "KeyS") {
            const clearColor = this.renderer.state.clearColor;
            const viewport = this.renderer.state.viewport;
            console.log(`Clear color: ${clearColor.toString()}`);
            console.log(`Viewport: ${viewport.toString()}`);
        }

        if (evt.key === "KeyP") {
            const shaderProgram = this.renderer.state.shaderProgram;
            console.log(shaderProgram.name);
        }
    }
}

window.onload = async () => {
    const canvasElem = document.getElementById('gl-canvas') as HTMLCanvasElement;
    if (!canvasElem) {
        console.error("Cannot find canvas element with id 'gl-canvas'");
        return;
    }
    const canvas = new Canvas(canvasElem, new WebGLRenderer());
    canvas.domElement.style.width = "100vw";
    canvas.domElement.style.height = "100vh";
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}
