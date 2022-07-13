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
import Shader from "bg2e/render/Shader";
import Material from "bg2e/base/Material";
import RenderState from "bg2e/render/RenderState";
import Texture, { TextureTargetName, ProceduralTextureFunction } from "bg2e/base/Texture";

window.Mat4 = Mat4;
window.Vec = Vec;

class MyWebGLShader extends Shader {
    constructor(renderer) {
        super(renderer);

        const vertexShaderCode = 
            `precision mediump float;

            attribute vec3 vertPosition;
            attribute vec2 t0Position;
            
            varying vec2 fragT0Pos;

            uniform mat4 mWorld;
            uniform mat4 mView;
            uniform mat4 mProj;

            void main() {
                fragT0Pos = t0Position;
                gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
            }`;

        const fragmentShaderCode = `
            precision mediump float;

            varying vec2 fragT0Pos;

            uniform vec3 uFixedColor;
            uniform sampler2D uTexture;

            void main() {
                vec4 texColor = texture2D(uTexture, fragT0Pos);
                gl_FragColor = vec4(texColor.rgb * uFixedColor, 1.0);
            }`;
        
        const { gl } = renderer;
        this._program = new ShaderProgram(gl, "SimpleColorCombination");
        this._program.attachVertexSource(vertexShaderCode);
        this._program.attachFragmentSource(fragmentShaderCode);
        this._program.link();

        this._whiteTexture = new Texture();
        this._whiteTexture.proceduralFunction = ProceduralTextureFunction.PLAIN_COLOR;
        this._whiteTexture.proceduralParameters = [1,1,1,1];
        this._whiteTexture.size = new Vec(4,4);
        this._whiteTexture.loadImageData();
        this._whiteTextureRenderer = renderer.factory.texture(this._whiteTexture);
    }

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        const material = materialRenderer.material;
        const { gl } = this.renderer;
        this.renderer.state.shaderProgram = this._program;

        this._program.uniformMatrix4fv('mWorld', false, modelMatrix);
        this._program.uniformMatrix4fv('mView', false, viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, projectionMatrix);

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uTexture', 0);
        if (material.diffuse instanceof Vec) {
            const target = TextureTargetName[this._whiteTexture.target];
            gl.bindTexture(gl[target], this._whiteTextureRenderer.getApiObject());
            this._program.uniform3fv('uFixedColor', material.diffuse.rgb);
        }
        else {
            const webglTexture = materialRenderer.getTextureRenderer('diffuse').getApiObject();
            const target = TextureTargetName[material.diffuse.target];
            gl.bindTexture(gl[target], webglTexture);
            this._program.uniform3fv('uFixedColor', new Vec(1,1,1));
        }

        this._program.positionAttribPointer(plistRenderer.positionAttribParams("vertPosition"));
        this._program.texCoordAttribPointer(plistRenderer.texCoord0AttribParams("t0Position"));

        if (!this._checked) {
            this._checked = true;
            if (!this._program.checkInvalidLocations()) {
                console.error("Invalid attrib location names found. This error should produce a lot of WebGL errors. Check that the attribute names match with the attrib location names in your shader.")
            }
        }
    }

    destroy() {
        ShaderProgram.Delete(this._program);
    }
}



class MyAppController extends AppController {
    async init() {
        if (!this.renderer instanceof WebGLRenderer) {
            throw new Error("This example works only with WebGL Renderer");
        }

        const { gl, state } = this.renderer;

        state.depthTestEnabled = true;
        state.cullFaceEnabled = true;
        state.cullFace = state.BACK;
        state.frontFace = state.CCW;

        this._shader = new MyWebGLShader(this.renderer);

        registerLoaderPlugin(new Bg2LoaderPlugin({ bg2ioPath: "dist" }));
        registerComponents();
        const loader = new Loader();
        const drawable = await loader.loadDrawable("../resources/cubes.bg2");
        this._plistRenderers = drawable.items.map(({ polyList, material, transform }) => {
            const plistRenderer = this.renderer.factory.polyList(polyList);
            const materialRenderer = this.renderer.factory.material(material);
            return {
                plistRenderer,
                materialRenderer,
                transform
            }
        });

        this._renderState = new RenderState({
            shader: this._shader
        });
        
        this._color = Color.Black();

        window.cubes = drawable;
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


        this._renderStates = [];
        this._plistRenderers.forEach(({ plistRenderer, materialRenderer, transform }) => {
            this._renderStates.push(new RenderState({
                shader: this._shader,
                materialRenderer: materialRenderer,
                modelMatrix: (new Mat4(transform)).mult(this._worldMatrix),
                viewMatrix: this._viewMatrix,
                projectionMatrix: this._projMatrix,
                polyListRenderer: plistRenderer
            }))
        });
    }

    display() {
        const { state } = this.renderer;
        const clearColor = Color.Sub(Color.White(), this._color);
        clearColor.a = 1;
        state.clearColor = clearColor;
        state.clear();

        this._renderStates.forEach(rs => rs.draw());
    }

    destroy() {
        this._plistRenderers.forEach(plRenderer => plRenderer.destroy());
        this._plistRenderers = [];
        this._shader.destroy();
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
