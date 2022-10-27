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
import { RenderLayer } from "bg2e/base/PolyList";
import { createCube, createSphere, createCylinder, createCone, createPlane } from 'bg2e/primitives';

window.Mat4 = Mat4;
window.Vec = Vec;

/*
 * This example shows the use of the utility functions of webgl.MaterialRender 
 * and webgl.ShaderProgram to pass uniform variables and attributes.
 * 
 * The ShaderProgram class contains a series of functions of type bindXX that 
 * allow assigning bg2 engine objects to uniform variables, with automatic data 
 * type detection. Also included is the bindAttribs() function, which allows 
 * setting shader attributes with a single call. Internally, all these functions
 * make use of standard `uniformXX`.
 * 
 * The MaterialRenderer class includes the bindXX functions to bind material
 * attributes to the shader, with automatic type detection. For example, the 
 * `diffuse` attribute can be a texture or a color. These functions facilitate 
 * the binding of these parameters.
 * 
 * See the MyWebGLShader.setup() function
 */

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

            uniform vec4 uFixedColor;
            uniform sampler2D uTexture;

            void main() {
                vec4 texColor = texture2D(uTexture, fragT0Pos);
                gl_FragColor = vec4(texColor.rgb * uFixedColor.rgb, 1.0);
            }`;
        
        const { gl } = renderer;
        this._program = new ShaderProgram(gl, "SimpleColorCombination");
        this._program.attachVertexSource(vertexShaderCode);
        this._program.attachFragmentSource(fragmentShaderCode);
        this._program.link();

    }
    
    async load() {
    }

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        this.renderer.state.shaderProgram = this._program;
        
        this._program.bindMatrix('mWorld', modelMatrix);
        this._program.bindMatrix('mView', viewMatrix);
        this._program.bindMatrix('mProj', projectionMatrix);

        // The MaterialRenderer.bindXX() functions returns true if the material attribute 
        // type matches the bind function, and false in other case. For example: if the 
        // `diffuse` material attribute is a color, the bindTexture() function will return
        // false.
        // If the data type does not match, a default parameter will be passed to the shader.
        // This is the last parameter of the function, which is optional, and has a predefined
        // default value if nothing is passed. For example, the bindTexture function will
        // pass a 2x2 px white texture if the material attribute is a color.
        // In practice, we will always call the functions bindTexture and bindColor or 
        // bindValue. This is because the shader will be prepared to receive both parameters. 
        // The trick is to pass as default value a value that is neutral in the shader, for 
        // this reason bindTexture sends by default a white texture, and bindColor sends a 
        // white color.
        materialRenderer.bindTexture(this._program, 'diffuse', 'uTexture', 0);
        materialRenderer.bindColor(this._program, 'diffuse', 'uFixedColor');
        

        // The bindAttribs function allows you to activate all the atrib variables in a single call and with a much simpler syntax
        this._program.bindAttribs(plistRenderer, { position: 'vertPosition', tex0: 't0Position' })
        
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

        const { state } = this.renderer;

        state.depthTestEnabled = true;
        state.clearColor = Color.Black();

        this._shader = new MyWebGLShader(this.renderer);
        await this._shader.load();

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

        this._plistRenderers.push({
            plistRenderer: this.renderer.factory.polyList(createCube(5,0.5,2)),
            materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                diffuse: [0.8, 0.4, 0.1]
            })),
            transform: Mat4.MakeRotation(45,0,1,0)
        });

        this._plistRenderers.push({
            plistRenderer: this.renderer.factory.polyList(createSphere(0.5)),
            materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                diffuse: [0.3,0.98,0.05]
            })),
            transform: Mat4.MakeTranslation(2, 0, 0)
        });

        this._plistRenderers.push({
            plistRenderer: this.renderer.factory.polyList(createCylinder(1,1)),
            materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                diffuse: [0.3,0.28,0.95]
            })),
            transform: Mat4.MakeTranslation(-2,0,0)
        });

        this._plistRenderers.push({
            plistRenderer: this.renderer.factory.polyList(createCone(1,0.5)),
            materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                diffuse: [0.3,0.98,0.85]
            })),
            transform: Mat4.MakeTranslation(-2,0,-2)
        });

        this._plistRenderers.push({
            plistRenderer: this.renderer.factory.polyList(createPlane(5, 5)),
            materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                diffuse: [0.93,0.98,0.05]
            })),
            transform: Mat4.MakeIdentity()
        });
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
        state.clear();

        this._renderStates.forEach(rs => rs.draw());
    }

    destroy() {
        this._plistRenderers.forEach(plRenderer => plRenderer.destroy());
        this._plistRenderers = [];
        this._shader.destroy();
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
