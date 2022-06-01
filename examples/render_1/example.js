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
import Loader, { registerLoaderPlugin } from "bg2e/db/Loader";
import Bg2LoaderPlugin from "bg2e/db/Bg2LoaderPlugin";
import { registerComponents } from "bg2e/scene";

const vertexShaderCode = 
`precision mediump float;

attribute vec3 vertPosition;
attribute vec3 normPosition;
attribute vec2 t0Position;

varying vec3 fragNormal;
varying vec2 fragT0Pos;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
    fragNormal = normPosition * 0.5 + 0.5;
    fragT0Pos = t0Position;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
`;

const fragmentShaderCode = `
precision mediump float;

varying vec3 fragNormal;
varying vec2 fragT0Pos;

uniform vec3 uFixedColor;

void main() {
    //gl_FragColor = vec4(fragNormal * uFixedColor, 1.0);
    gl_FragColor = vec4(fragT0Pos, 0.0, 1.0);
}
`;

class MyAppController extends AppController {
    async init() {
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
        
        this._program = new ShaderProgram(gl, "SimpleColorCombination");
        this._program.attachVertexSource(vertexShaderCode);
        this._program.attachFragmentSource(fragmentShaderCode);
        this._program.link();

        state.shaderProgram = this._program;

        registerLoaderPlugin(new Bg2LoaderPlugin({ bg2ioPath: "dist" }));
        registerComponents();
        const loader = new Loader();
        const plists = await loader.loadPolyList("../resources/cubes.bg2");
        this._plistRenderers = plists.map(plist => {
            return this.renderer.factory.polyList(plist);
        });
        
        this._color = Color.Black();

        // To get the current binded buffers
        // const ab = VertexBuffer.CurrentBuffer(gl,BufferTarget.ARRAY_BUFFER);
        // const eab = VertexBuffer.CurrentBuffer(gl,BufferTarget.ELEMENT_ARRAY_BUFFER);
    }

    reshape(width,height) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
        this.renderer.canvas.updateViewportSize();
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
            this._color[0] = math.abs(math.sin(this._elapsed) * 0.5 - 0.5),
            this._color[1] = math.abs(math.cos(this._elapsed) * 0.5 - 0.5),
            this._color[2] = math.abs(math.sin(this._elapsed + 1) * 0.5 - 0.5),
            1
        ]);
    }

    display() {
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
        
        this._plistRenderers.forEach(plRenderer => {
            this._program.positionAttribPointer(plRenderer.positionAttribParams("vertPosition"));
            this._program.normalAttribPointer(plRenderer.normalAttribParams("vertNormal"));
            this._program.texCoordAttribPointer(plRenderer.texCoord0AttribParams("t0Position"));
            plRenderer.draw();
        })
    }

    destroy() {
        VertexBuffer.Delete(this._vertex);
        VertexBuffer.Delete(this._index);
        ShaderProgram.Delete(this._program);
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

        if (evt.key === "KeyP") {
            const shaderProgram = this.renderer.state.shaderProgram;
            console.log(shaderProgram.name);
        }
    }
}

window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    canvas.domElement.style.width = "100vw";
    canvas.domElement.style.height = "100vh";
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}
