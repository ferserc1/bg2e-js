import AppController from "bg2e-js/ts/app/AppController.ts";
import Bg2KeyboardEvent, { SpecialKey } from "bg2e-js/ts/app/Bg2KeyboardEvent.ts";
import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Material from "bg2e-js/ts/base/Material.ts";
import Texture, { TextureRenderTargetAttachment, TextureTarget } from "bg2e-js/ts/base/Texture.ts";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import { createCube, createSphere } from "bg2e-js/ts/primitives/index.ts";
import MaterialRenderer from "bg2e-js/ts/render/MaterialRenderer.js";
import PolyListRenderer from "bg2e-js/ts/render/PolyListRenderer.js";
import WebGLPolyListRenderer from "bg2e-js/ts/render/webgl/PolyListRenderer.js";
import RenderBuffer from "bg2e-js/ts/render/RenderBuffer.ts";
import RenderState from "bg2e-js/ts/render/RenderState.ts";
import Renderer from "bg2e-js/ts/render/Renderer.ts";
import Shader from "bg2e-js/ts/render/Shader.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import ShaderProgram from "bg2e-js/ts/render/webgl/ShaderProgram.ts";
import WebGLSkySphere from "bg2e-js/ts/render/webgl/SkySphere.js";
import { webgl } from "bg2e-js/ts/render/webgl/index.ts";

const g_code = {
    webgl: {
        vertex: `precision mediump float;

        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 texCoord;
        
        varying vec2 fragTexCoord;
        varying vec3 fragWorldPosition;
        varying vec3 fragWorldNormal;

        uniform mat4 mWorld;
        uniform mat4 mView;
        uniform mat4 mProj;
        uniform mat3 mNormalMatrix;

        void main() {
            fragTexCoord = texCoord;

            gl_Position = mProj * mView * mWorld * vec4(position, 1.0);

            fragWorldPosition = (mWorld * vec4(position, 1.0)).xyz;
            fragWorldNormal = mNormalMatrix * normal;
        }`,

        fragment: `precision mediump float;
       
        varying vec2 fragTexCoord;
        varying vec3 fragWorldPosition;
        varying vec3 fragWorldNormal;
        
        uniform samplerCube uCube;
        uniform vec3 uWorldCameraPosition;
        
        void main() {
            vec3 worldNormal = normalize(fragWorldNormal);
            vec3 eyeToSurfaceDir = normalize(fragWorldPosition - uWorldCameraPosition);
            vec3 direction = reflect(eyeToSurfaceDir, worldNormal);

            gl_FragColor = textureCube(uCube, direction);
            //gl_FragColor = vec4(direction * 0.5 + 0.5, 1.0);
        }`
    }
}

export default class CubeMapTextureShader extends Shader {
    private _cameraPosition : Vec;
    private _program: ShaderProgram | null = null;
    private _cubeMapTexture: Texture | null = null;
    private _cameraPositionInitialized: boolean = false;

    constructor(renderer: Renderer) {
        super(renderer);

        // This shader is compatible with WebGL renderer
        if (!(renderer instanceof WebGLRenderer)) {
            throw new Error("shader.PresentTextureShader: invalid renderer. This shader is compatible with WebGLRenderer");
        }

        this._cameraPosition = new Vec(0,0,0);
    }

    async load() {
        const { gl } = this.renderer as WebGLRenderer;

        this._program = new ShaderProgram(gl, "DefaultPresentTextureShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();
    }

    set cubeMapTexture(cm) {
        this._cubeMapTexture = cm;

        // If necesary, initialize the texture renderer
        if (cm && !cm.renderer) {
            this.renderer.factory.texture(cm);
        }
    }

    get cubeMapTexture() {
        return this._cubeMapTexture;
    }

    // Call this function once each frame
    updateCameraPosition({
        viewMatrix = null,
        cameraMatrix = null,
        cameraPosition = null
    } : {
        viewMatrix?: Mat4 | null,
        cameraMatrix?: Mat4 | null,
        cameraPosition?: Vec | null
    }) {
        if (cameraPosition) {
            this._cameraPosition = new Vec(cameraPosition);
        }
        else if (cameraMatrix) {
            this._cameraPosition = Mat4.GetPosition(cameraMatrix).xyz;
        }
        else if (viewMatrix) {
            this._cameraPosition = Mat4.GetPosition(Mat4.GetInverted(viewMatrix)).xyz;
        }
        else {
            throw new Error("Update camera position: you must specify viewMatrix, cameraMatrix or cameraPosition");
        }
        this._cameraPositionInitialized = true;
    }

    setup(
        plistRenderer: PolyListRenderer,
        materialRenderer: MaterialRenderer,
        modelMatrix: Mat4,
        viewMatrix: Mat4,
        projectionMatrix: Mat4
    ) {
        if (!this._cameraPositionInitialized) {
            console.warn("Warning: camera position not set in cubemap shader. Serious performance impact!");
            this._cameraPosition = Mat4.GetPosition(Mat4.GetInverted(viewMatrix)).xyz;
        }
        if (!this._program) {
            throw new Error("CubeMapTextureShader: shader program not loaded");
        }
        if (!this.cubeMapTexture) {
            throw new Error("CubeMapTextureShader: cubemap texture not set");
        }
        const renderer = this.renderer as WebGLRenderer;
        const { gl } = renderer;

        renderer.state.shaderProgram = this._program;
        
        const normalMatrix = Mat4.GetInverted(modelMatrix);
        normalMatrix.traspose();
        this._program.uniformMatrix4fv('mWorld', false, modelMatrix);
        this._program.uniformMatrix4fv('mView', false, viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, projectionMatrix);
        this._program.uniformMatrix3fv('mNormalMatrix', false, normalMatrix.mat3);
        this._program.uniform3fv('uWorldCameraPosition', this._cameraPosition);

        const webglTexture = this.cubeMapTexture.renderer.getApiObject();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTexture);

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uCube', 0);

        this._program.positionAttribPointer((plistRenderer as WebGLPolyListRenderer).positionAttribParams("position"));
        this._program.normalAttribPointer((plistRenderer as WebGLPolyListRenderer).normalAttribParams("normal"));
        this._program.texCoordAttribPointer((plistRenderer as WebGLPolyListRenderer).texCoord0AttribParams("texCoord"));
    }
}



class MyAppController extends AppController {
    private _animation: boolean = true;
    private _alpha: number = 0;
    private _cameraMatrix: Mat4 = Mat4.MakeIdentity()
    private _cameraPosition: Vec = new Vec(0,0,0);
    private _projectionMatrix: Mat4 = Mat4.MakeIdentity();
    private _cube: PolyListRenderer | null = null;
    private _cubeWorldMatrix: Mat4 = Mat4.MakeIdentity();
    private _sphere: PolyListRenderer | null = null;
    private _sphereWorldMatrix: Mat4 = Mat4.MakeIdentity();
    private _material: MaterialRenderer | null = null
    private _skySphere: WebGLSkySphere | null = null;
    private _cubemapTexture: Texture | null = null
    private _renderBuffer: RenderBuffer | null = null;
    private _shader: CubeMapTextureShader | null = null
    private _renderStates: RenderState[] = [];
    private _environmentUpdated: boolean = false;

    async init() {
        if (!(this.renderer instanceof WebGLRenderer)) {
            throw new Error("This example works only with WebGL Renderer");
        }

        this._animation = true;

        this.renderer.state.depthTestEnabled = true;

        // The view matrix will be used to render the cubemap, and also to render the scene
        // The projection matrix will be used only to render the scene
        this._alpha = 0;
        this._cameraMatrix = Mat4.MakeTranslation(0, 1, 5);
        this._cameraPosition = Mat4.GetPosition(this._cameraMatrix);
        this._projectionMatrix = Mat4.MakePerspective(50, this.canvas.viewport.aspectRatio,0.1,100.0);

        // Scene: one cube and one sphere
        this._cube = this.renderer.factory.polyList(createCube(1,1,1));
        this._cubeWorldMatrix = Mat4.MakeIdentity();
        this._material = this.renderer.factory.material(await Material.Deserialize({
            diffuse: [0.4,0.33,0.1,1]
        }));

        this._sphere = this.renderer.factory.polyList(createSphere(0.5));
        this._sphereWorldMatrix = Mat4.MakeIdentity();

        // We're going to render a skybox to the cubemap. This will transform a equirectangular
        // texture into a cube map. The sky sphere contains its own shader to render the
        // texture sphere, but you also can set your own shader. For example, if you want to
        // generate a light environment map, you need to set a shader that blurs the texture
        // TODO: Set predefined shaders to generate PBR cube maps
        this._skySphere = this.renderer.factory.skySphere();
        await this._skySphere?.load('../resources/country_field_sun.jpg');

        // Cubemap resources: we need a RenderBuffer and a Texture
        this._cubemapTexture = new Texture();
        this._cubemapTexture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._cubemapTexture.target = TextureTarget.CUBE_MAP;

        this._renderBuffer = this.renderer.factory.renderBuffer();
        await this._renderBuffer.attachTexture(this._cubemapTexture);
        // This is the size of each cube face
        this._renderBuffer.size = new Vec(256, 256);

        // This sader will be used to render the scene, using the cube map to
        // simulate reflections.
        this._shader = new CubeMapTextureShader(this.renderer);
        await this._shader.load();
        this._shader.cubeMapTexture = this._cubemapTexture;
    }

    reshape(width: number,height: number) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
        this._projectionMatrix = Mat4.MakePerspective(50, this.canvas.viewport.aspectRatio,0.1,100.0);
        this.renderer.canvas.updateViewportSize();
    }


    async frame(delta: number) {
        if (this._animation) {
            this._alpha = this._alpha || 0;
            this._alpha += delta * 0.0001;
        }

        this._cameraMatrix
            .identity()
            .translate(0, 0, 5)
            .rotate(-0.3, 1, 0, 0)
            .rotate(this._alpha * 2, 0, 1, 0);

        this._cubeWorldMatrix.identity()
            .rotate(this._alpha * 2, 0, 1, 0)
            .rotate(this._alpha * 4, 1, 0, 0)
            .translate(1, 0, 0);

        this._sphereWorldMatrix.identity()
            .translate(-1, 0, 0);

        const viewMatrix = Mat4.GetInverted(this._cameraMatrix);
        this._shader?.updateCameraPosition({ cameraMatrix: this._cameraMatrix });

        this._skySphere?.updateRenderState({ viewMatrix, projectionMatrix: this._projectionMatrix });

        this._renderStates = [
            new RenderState({
                polyListRenderer: this._cube,
                materialRenderer: this._material,
                shader: this._shader,
                modelMatrix: this._cubeWorldMatrix,
                viewMatrix: viewMatrix,
                projectionMatrix: this._projectionMatrix
            }),

            new RenderState({
                polyListRenderer: this._sphere,
                materialRenderer: this._material,
                shader: this._shader,
                modelMatrix: this._sphereWorldMatrix,
                viewMatrix: viewMatrix,
                projectionMatrix: this._projectionMatrix
            })
        ];
    }

    display() {
        const { state } = this.renderer;
        state.clear();

        this._skySphere?.draw();

        if (!this._environmentUpdated) {
            console.log("Update cubemap render");
            this._renderBuffer?.update((face,viewMatrix,projectionMatrix) => {
                state.clear();
                this._skySphere?.updateRenderState({
                    viewMatrix: viewMatrix || Mat4.MakeIdentity(),
                    projectionMatrix
                })
                this._skySphere?.draw();
            });
            this._environmentUpdated = true;
        }

        this._renderStates.forEach(rs => rs.draw());
    }

    destroy() {
        this._skySphere?.destroy();
    }

    keyUp(evt: Bg2KeyboardEvent) {
        if (evt.key === SpecialKey.SPACE) {
            this._animation = !this._animation;
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
