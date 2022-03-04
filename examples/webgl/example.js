import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import Canvas from "bg2e/app/Canvas";
import AppController from "bg2e/app/AppController";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Mat4 from "bg2e/math/Mat4";

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

void main() {
    gl_FragColor = vec4(fragColor, 1.0);
}
`;

const boxVertices = [
    //top
    -1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
    -1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
    1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
    1.0, 1.0, -1.0,    0.5, 0.5, 0.5,
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

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vertexShader, vertexShaderCode);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            throw new Error(`Error compiling vertex shader: \n${gl.getShaderInfoLog(vertexShader)}`);
        }

        gl.shaderSource(fragmentShader, fragmentShaderCode);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw new Error(`Error compiling fragment shader: \n${gl.getShaderInfoLog(fragmentShader)}`);
        }

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(`Error linking program: \n${gl.getProgramInfoLog(program)}`);
        }
        gl.validateProgram(program);
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            throw new Error(`Error validating program:\n${gl.getProgramInfoLog(program)}`);
        }
        this._program = program;

        const boxVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

        const boxIndexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);
        this._buffers = {
            vertex: boxVertexBufferObject,
            index: boxIndexBufferObject
        };

        this._attribLocations = {
            position: gl.getAttribLocation(program, 'vertPosition'),
            color: gl.getAttribLocation(program, 'vertColor')
        }

        this._uniformLocations = {
            mWorld: gl.getUniformLocation(program, 'mWorld'),
            mView: gl.getUniformLocation(program, 'mView'),
            mProj: gl.getUniformLocation(program, 'mProj')
        }

        gl.vertexAttribPointer(
            this._attribLocations.position,
            3,
            gl.FLOAT,
            false,
            6 * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        gl.enableVertexAttribArray(this._attribLocations.position);

        gl.vertexAttribPointer(
            this._attribLocations.color,
            3,
            gl.FLOAT,
            false,
            6 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(this._attribLocations.color);

        gl.useProgram(this._program);
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
    }

    display() {
        const { gl } = this.renderer;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
 
        gl.uniformMatrix4fv(this._uniformLocations.mWorld, false, this._worldMatrix);
        gl.uniformMatrix4fv(this._uniformLocations.mView, false, this._viewMatrix);
        gl.uniformMatrix4fv(this._uniformLocations.mProj, false, this._projMatrix);

        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    }
}

window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}
