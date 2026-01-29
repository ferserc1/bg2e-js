import math from "bg2e-js/ts/math/index.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Canvas from "bg2e-js/ts/app/Canvas.ts";
import AppController from "bg2e-js/ts/app/AppController.ts";
import Bg2KeyboardEvent, { SpecialKey } from "bg2e-js/ts/app/Bg2KeyboardEvent.ts";
import Color from "bg2e-js/ts/base/Color.ts";
import Material from "bg2e-js/ts/base/Material.ts";
import PolyList from "bg2e-js/ts/base/PolyList.ts";
import Texture, { ProceduralTextureFunction } from "bg2e-js/ts/base/Texture.ts";
import { RenderLayer } from "bg2e-js/ts/base/PolyList.ts";
import Bg2LoaderPlugin from "bg2e-js/ts/db/Bg2LoaderPlugin.ts";
import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import { createCube, createSphere, createCylinder, createCone, createPlane } from "bg2e-js/ts/primitives/index.ts";
import RenderState from "bg2e-js/ts/render/RenderState.ts";
import Shader from "bg2e-js/ts/render/Shader.ts";
import ShaderProgram from "bg2e-js/ts/render/webgl/ShaderProgram.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";
import PolyListRenderer from "bg2e-js/ts/render/PolyListRenderer.js";
import MaterialRenderer from "bg2e-js/ts/render/MaterialRenderer.js";

(window as any).Mat4 = Mat4;
(window as any).Vec = Vec;

class MyWebGLShader extends Shader {
    private _program: ShaderProgram | null = null;
    private _whiteTexture: Texture | null = null;
    private _whiteTextureRenderer: any = null;
    private _checked = false;

    constructor(renderer: WebGLRenderer) {
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

    }
    
    async load() {
        this._whiteTexture = new Texture();
        this._whiteTexture.proceduralFunction = ProceduralTextureFunction.PLAIN_COLOR;
        this._whiteTexture.proceduralParameters = [1,1,1,1];
        this._whiteTexture.size = new Vec(4,4);
        this._whiteTexture.loadImageData();
        this._whiteTextureRenderer = this.renderer.factory.texture(this._whiteTexture);
    }

    setup(plistRenderer: any, materialRenderer: any, modelMatrix: Mat4, viewMatrix: Mat4, projectionMatrix: Mat4) {
        const material = materialRenderer.material;
        const renderer = this.renderer as WebGLRenderer;
        const { gl } = renderer;
        if (!this._program) {
            return;
        }
        renderer.state.shaderProgram = this._program;

        this._program.uniformMatrix4fv('mWorld', false, modelMatrix);
        this._program.uniformMatrix4fv('mView', false, viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, projectionMatrix);

        let texRenderer = materialRenderer.getTextureRenderer('albedoTexture') || this._whiteTextureRenderer;
        this._program.uniform3fv('uFixedColor', material.albedo.rgb);

        this._program.uniform1i('uTexture', 0);
        texRenderer.activeTexture(0);
        texRenderer.bindTexture();

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
        if (this._program) {
            ShaderProgram.Delete(this._program);
        }
    }
}

class MyAppController extends AppController {
    private _shader: MyWebGLShader | null = null;
    private _plistRenderers: Array<{ plistRenderer: PolyListRenderer; materialRenderer: MaterialRenderer; transform: Mat4 }> = [];
    private _renderStates: RenderState[] = [];
    private _color: Color = Color.Black();
    private _elapsed = 0;
    private _angle = 0;
    private _worldMatrix: Mat4 = Mat4.MakeIdentity();
    private _viewMatrix: Mat4 = Mat4.MakeIdentity();
    private _projMatrix: Mat4 = Mat4.MakeIdentity();

    async init() {
        if (!(this.renderer instanceof WebGLRenderer)) {
            throw new Error("This example works only with WebGL Renderer");
        }

        const { gl, state } = this.renderer;

        state.depthTestEnabled = true;

        this._shader = new MyWebGLShader(this.renderer);
        await this._shader.load();

        registerLoaderPlugin(new Bg2LoaderPlugin({ bg2ioPath: "dist" }));
        registerComponents();
        const loader = new Loader();
        const drawable = await loader.loadDrawable("../resources/cubes.bg2");
        this._plistRenderers = drawable.items.map(({
            polyList, material, transform
        } : { polyList: PolyList, material: Material, transform: Mat4 }) => {
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
        
        this._color = Color.Black();

        (window as any).cubes = drawable;
        console.log(RenderLayer);

        const layer = RenderLayer.LAYER_31 | RenderLayer.LAYER_0;
        console.log(layer & RenderLayer.LAYER_31);
        console.log(layer & RenderLayer.LAYER_0);
        console.log(layer & RenderLayer.LAYER_11);

        const layer2 = RenderLayer.ALL & ~RenderLayer.LAYER_2;
        console.log((layer2 >>> 0).toString(2));
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
            const plist = plistRenderer.polyList;
            const mat = materialRenderer.material;
            console.log(`Add object to render queue: '${plist.name}'. Albedo texture: ${mat.albedoTexture || "none"}`);
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
        if (!this._shader) {
            return;
        }
        const { state } = this.renderer;
        const clearColor = Color.Sub(Color.White(), this._color);
        clearColor.a = 1;
        state.clearColor = clearColor;
        state.clear();

        this._renderStates.forEach(rs => rs.draw());
    }

    destroy() {
        this._plistRenderers.forEach(plRenderer => plRenderer.plistRenderer.destroy());
        this._plistRenderers = [];
        this._shader?.destroy();
    }

    keyUp(evt: Bg2KeyboardEvent) {
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
