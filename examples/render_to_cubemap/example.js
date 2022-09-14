import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import Canvas from "bg2e/app/Canvas";
import AppController from "bg2e/app/AppController";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Vec from "bg2e/math/Vec";
import Mat4 from "bg2e/math/Mat4";
import { createCube, createSphere } from "bg2e/primitives";
import Material from "bg2e/base/Material";
import RenderState from "bg2e/render/RenderState";
import BasicDiffuseColorShader from "bg2e/shaders/BasicDiffuseColorShader";
import Texture, { TextureRenderTargetAttachment, TextureTarget, TextureTargetName } from "bg2e/base/Texture";


import Shader from 'bg2e/render/Shader';
import ShaderProgram from 'bg2e/render/webgl/ShaderProgram';

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

        void main() {
            fragTexCoord = texCoord;

            gl_Position = mProj * mView * mWorld * vec4(position, 1.0);

            fragWorldPosition = (mWorld * vec4(position, 1.0)).xyz;
            fragWorldNormal = (mWorld * vec4(normal, 1.0)).xyz;
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
        }`
    }
}

export default class CubeMapTextureShader extends Shader {
    constructor(renderer) {
        super(renderer);

        // This shader is compatible with WebGL renderer
        if (!renderer instanceof WebGLRenderer) {
            throw new Error("shader.PresentTextureShader: invalid renderer. This shader is compatible with WebGLRenderer");
        }
    }

    async load() {
        const { gl } = this.renderer;

        this._program = new ShaderProgram(gl, "DefaultPresentTextureShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();
    }

    set cubeMapTexture(cm) {
        this._cubeMapTexture = cm;

        // If necesary, initialize the texture renderer
        if (!cm.renderer) {
            this.renderer.factory.texture(cm);
        }
    }

    get cubeMapTexture() {
        return this._cubeMapTexture;
    }

    set cameraPosition(p) {
        this._cameraPosition = p;
    }

    get cameraPosition() {
        return this._cameraPosition || new Vec([0, 0, 0]);
    }

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        const { gl } = this.renderer;
        const cameraPosition = new Vec([0, 1, -4]);

        this.renderer.state.shaderProgram = this._program;

        this._program.uniformMatrix4fv('mWorld', false, modelMatrix);
        this._program.uniformMatrix4fv('mView', false, viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, projectionMatrix);
        this._program.uniform3fv('uWorldCameraPosition', cameraPosition.xyz);

        const webglTexture = this.cubeMapTexture.renderer.getApiObject();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTexture);

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uCube', 0);

        this._program.positionAttribPointer(plistRenderer.positionAttribParams("position"));
        this._program.normalAttribPointer(plistRenderer.normalAttribParams("normal"));
        this._program.texCoordAttribPointer(plistRenderer.texCoord0AttribParams("texCoord"));
    }
}



class MyAppController extends AppController {
    async init() {
        if (!this.renderer instanceof WebGLRenderer) {
            throw new Error("This example works only with WebGL Renderer");
        }

        this.renderer.state.depthTestEnabled = true;

        // The view matrix will be used to render the cubemap, and also to render the scene
        // The projection matrix will be used only to render the scene
        this._cameraMatrix = Mat4.MakeTranslation(0, 1, 5);
        this._cameraPosition = Mat4.GetPosition(this._cameraMatrix);
        this._projectionMatrix = Mat4.MakePerspective(50, this.canvas.viewport.aspectRatio,0.1,100.0);

        // We going to render a skybox to the cubemap
        this._skySphere = this.renderer.factory.skySphere();
        await this._skySphere.load('../resources/country_field_sun.jpg');

        this._cube = this.renderer.factory.polyList(createCube(1,1,1));
        this._cubeWorldMatrix = Mat4.MakeIdentity();
        this._material = this.renderer.factory.material(await Material.Deserialize({
            diffuse: [0.4,0.33,0.1,1]
        }));

        this._sphere = this.renderer.factory.polyList(createSphere(0.5));
        this._sphereWorldMatrix = Mat4.MakeIdentity();

        // Cubemap resources: we need a RenderBuffer and a Texture
        this._cubemapTexture = new Texture();
        this._cubemapTexture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._cubemapTexture.target = TextureTarget.CUBE_MAP;

        // This shader and the cube well be used to render the generated cubemap as a
        // reflection
        this._shader = new CubeMapTextureShader(this.renderer);
        await this._shader.load();
        this._shader.cameraPosition = this._cameraPosition;
        this._shader.cubeMapTexture = this._cubemapTexture;

        this._renderBuffer = this.renderer.factory.renderBuffer();
        await this._renderBuffer.attachTexture(this._cubemapTexture);
        // This is the size of each cube face
        this._renderBuffer.size = new Vec(512, 512);

    }

    reshape(width,height) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
        this._projectionMatrix = Mat4.MakePerspective(50, this.canvas.viewport.aspectRatio,0.1,100.0);
        this.renderer.canvas.updateViewportSize();
    }


    frame(delta) {
        this._alpha = this._alpha || 0;
        this._alpha += delta * 0.0001;

        this._cameraMatrix
            .identity()
            .translate(0, 0, 5)
            .rotate(this._alpha * 2, 0, 1, 0);

        this._cameraPosition = Mat4.GetPosition(this._cameraMatrix);
        this._shader.cameraPosition = this._cameraPosition;
        console.log(this._cameraPosition.toString());

        this._cubeWorldMatrix.identity()
            .rotate(this._alpha, 0, 1, 0)
            .rotate(this._alpha / 2, 1, 0, 0)
            .translate(1, 0, 0);

        this._sphereWorldMatrix.identity()
            //.rotate(this._alpha / 2, 0, 1, 0)
            //.rotate(this._alpha, 1, 0, 0)
            .translate(-1, 0, 0);

        const viewMatrix = Mat4.GetInverted(this._cameraMatrix);
        this._skySphere.updateRenderState({ 
            viewMatrix: viewMatrix,
            projectionMatrix: this._projectionMatrix
        });

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

        this._renderBuffer.update((face,viewMatrix,projectionMatrix) => {
            state.clear();
            this._skySphere.updateRenderState({ viewMatrix, projectionMatrix })
            this._skySphere.draw();
        });

        this._renderStates.forEach(rs => rs.draw());
    }

    destroy() {
        this._skySphere.destroy();
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
