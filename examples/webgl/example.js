import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import Canvas from "bg2e/app/Canvas";
import AppController from "bg2e/app/AppController";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Mat4 from "bg2e/math/Mat4";
import ShaderProgram from "bg2e/render/webgl/ShaderProgram";
import VertexBuffer, { BufferTarget, BufferUsage } from "bg2e/render/webgl/VertexBuffer";

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

        const { gl } = this.renderer;

        const extensions = gl.getSupportedExtensions();
        console.log("WebGL Extensions:");
        console.log(extensions);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);

        this._program = new ShaderProgram(gl);
        this._program.attachVertexSource(vertexShaderCode);
        this._program.attachFragmentSource(fragmentShaderCode);
        this._program.link();
        this._program.useProgram();

        this._vertex = VertexBuffer.CreateArrayBuffer(gl, new Float32Array(boxVertices));
        this._index = VertexBuffer.CreateElementArrayBuffer(gl, new Uint16Array(boxIndices));
        
        this._program.positionAttribPointer({ name: 'vertPosition', stride: 6, enable: true });
        this._program.colorAttribPointer({ name: 'vertColor', size: 3, stride: 6, offset: 3, enable: true});
        
        this._color = [ 0.9, 1.0, 0.2 ];
        this._r = 1; this._g = 1; this._b = 1;
    }

    reshape(width,height) {
        const { gl } = this.renderer;
        gl.viewport(0, 0, width, height);
    }

    frame(delta) {
        this._angle = this._angle || 0;
        this._worldMatrix = Mat4.MakeIdentity();
        this._viewMatrix = Mat4.MakeLookAt([0, 0, -8], [0, 0, 0], [0, 1, 0]);
        this._projMatrix = Mat4.MakePerspective(45, this.canvas.viewport.aspectRatio, 0.1, 1000.0);

        this._angle += (delta / 1000) * Math.PI / 2;
        this._worldMatrix.rotate(this._angle, 1, 0, 0);
        this._worldMatrix.rotate(this._angle / 4, 0, 1, 0);

        if (this._color[0] > 1) {
            this._r = -1;
        }
        else if (this._color[0] < 0) {
            this._r = 1;
        }
        if (this._color[1] > 1) {
            this._g = -1;
        }
        else if (this._color[1] < 0) {
            this._g = 1;
        }
        if (this._color[2] > 1) {
            this._b = -1;
        }
        else if (this._color[2] < 0) {
            this._b = 1;
        }
        this._color = [
            this._color[0] += delta * this._r * 0.0002,
            this._color[1] += delta * this._g * 0.0003,
            this._color[2] += delta * this._b * 0.00012
        ]
    }

    display() {
        const { gl } = this.renderer;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
 
        this._program.uniformMatrix4fv('mWorld', false, this._worldMatrix);
        this._program.uniformMatrix4fv('mView', false, this._viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, this._projMatrix);
        this._program.uniform3fv('uFixedColor', this._color);

        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    }

    destroy() {
        VertexBuffer.Delete(this._vertex);
        VertexBuffer.Delete(this._index);
    }
}

window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}
