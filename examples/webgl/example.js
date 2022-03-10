import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import * as math from "bg2e/math/functions";
import Canvas from "bg2e/app/Canvas";
import AppController from "bg2e/app/AppController";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Mat4 from "bg2e/math/Mat4";
import ShaderProgram from "bg2e/render/webgl/ShaderProgram";
import VertexBuffer, { BufferTarget } from "bg2e/render/webgl/VertexBuffer";
import { SpecialKey } from "bg2e/app/KeyboardEvent";
import Vec from "bg2e/math/Vec";
import Color from "bg2e/base/Color";

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
    init() {
        if (!this.renderer instanceof WebGLRenderer) {
            throw new Error("This example works only with WebGL Renderer");
        }

        const { gl, state } = this.renderer;

        const extensions = gl.getSupportedExtensions();
        console.log("WebGL Extensions:");
        console.log(extensions);

        state.depthTestEnabled = true;
        state.cullFaceEnabled = true;
        state.cullFace = state.BACK;
        state.frontFace = state.CCW;
        
        this._program = new ShaderProgram(gl);
        this._program.attachVertexSource(vertexShaderCode);
        this._program.attachFragmentSource(fragmentShaderCode);
        this._program.link();
        this._program.useProgram();

        this._vertex = VertexBuffer.CreateArrayBuffer(gl, new Float32Array(boxVertices));
        this._index = VertexBuffer.CreateElementArrayBuffer(gl, new Uint16Array(boxIndices));
        
        this._color = Color.Black();

        // To get the current binded buffers
        // const ab = VertexBuffer.CurrentBuffer(gl,BufferTarget.ARRAY_BUFFER);
        // const eab = VertexBuffer.CurrentBuffer(gl,BufferTarget.ELEMENT_ARRAY_BUFFER);
    }

    reshape(width,height) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
    }

    frame(delta) {
        this._elapsed = this._elapsed || 0;
        this._elapsed += delta / 1000;
        this._angle = this._angle || 0;
        this._worldMatrix = Mat4.MakeIdentity();
        this._viewMatrix = Mat4.MakeLookAt([0, 0, -8], [0, 0, 0], [0, 1, 0]);
        this._projMatrix = Mat4.MakePerspective(45, this.canvas.viewport.aspectRatio, 0.1, 1000.0);

        this._angle += (delta / 1000) * Math.PI / 2;
        this._worldMatrix.rotate(this._angle, 1, 0, 0);
        this._worldMatrix.rotate(this._angle / 4, 0, 1, 0);

        this._color = new Color([
            this._color[0] = math.sin(this._elapsed) + 0.3,
            this._color[1] = math.cos(this._elapsed) + 0.22,
            this._color[2] = math.sin(this._elapsed + 1) + 0.18,
            1
        ]);
    }

    display() {
        const { gl, state } = this.renderer;
        state.viewport = new Vec(this.canvas.width, this.canvas.height);
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
        VertexBuffer.Delete(this._vertex);
        VertexBuffer.Delete(this._index);
    }

    keyUp(evt) {
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
    }
}

window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}
