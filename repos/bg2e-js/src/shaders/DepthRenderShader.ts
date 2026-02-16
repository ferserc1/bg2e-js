import Shader from "../render/Shader";
import ShaderFunction from "./ShaderFunction";
import ShaderProgram from "../render/webgl/ShaderProgram";
import PolyListRenderer from '../render/PolyListRenderer';
import MaterialRenderer from '../render/webgl/MaterialRenderer';
import Mat4 from "../math/Mat4";
import Renderer from "../render/Renderer";
import WebGLRenderer from "../render/webgl/Renderer";
import WebGLPolyListRenderer from "../render/webgl/PolyListRenderer";
import { getUniformsFunctions, getColorCorrectionFunctions } from "./webgl";

const g_code = {
    webgl: {
        vertex: `precision mediump float;
        attribute vec3 position;
        attribute vec2 texCoord;
        attribute vec2 texCoord2;

        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjMatrix;

        varying vec2 fragTexCoord;
        varying vec2 fragTexCoord2;
        
        void main() {
            fragTexCoord = texCoord;
            fragTexCoord2 = texCoord2;
            gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
        }`,

        fragment: ShaderFunction.GetShaderCode(
            `precision mediump float;

            uniform vec4 uAlbedo;
            uniform float uAlphaCutoff;
            uniform sampler2D uAlbedoTexture;
            uniform vec2 uAlbedoScale;
            uniform int uAlbedoMap;
            
            varying vec2 fragTexCoord;
            varying vec2 fragTexCoord2;
            `,
            [
                new ShaderFunction('void','main','',`{
                    PBRMaterialData mat;
                    mat.albedo = uAlbedo;
                    mat.albedoScale = uAlbedoScale;
                    mat.albedoUVSet = uAlbedoMap;
                    vec4 albedo = sampleAlbedo(uAlbedoTexture, fragTexCoord, fragTexCoord2, mat, 1.8);
                    
                    if (albedo.a < uAlphaCutoff) {
                        discard;
                    }
                    else {
                        float d = gl_FragCoord.z / gl_FragCoord.w;
                        gl_FragColor = vec4(d, d, d, 1.0);
                    }
                }`, [
                    ...getColorCorrectionFunctions(),
                    ...getUniformsFunctions()
                ])
            ])
    }
}

export default class DepthRenderShader extends Shader {
    protected _program: ShaderProgram | null = null;

    constructor(renderer: Renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("DepthRenderShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = (this.renderer as WebGLRenderer);

        this._program = new ShaderProgram(gl, "DepthRenderShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();
    }

    setup(
        plistRenderer: PolyListRenderer,
        materialRenderer: MaterialRenderer,
        modelMatrix: Mat4,
        viewMatrix: Mat4,
        projMatrix: Mat4
    ) {
        if (!this._program) {
            throw new Error("DepthRenderShader: shader program is not loaded");
        }

        const material = materialRenderer.material;
        materialRenderer.mergeTextures();

        const rend = this.renderer as WebGLRenderer;
        rend.state.shaderProgram = this._program;

        this._program.bindMatrix("uModelMatrix", modelMatrix);
        this._program.bindMatrix("uViewMatrix", viewMatrix);
        this._program.bindMatrix("uProjMatrix", projMatrix);
        
        materialRenderer.bindTexture(this._program, "albedoTexture", "uAlbedoTexture", 0);
        materialRenderer.bindColor(this._program, "albedo", "uAlbedo");

        this._program.uniform1i("uAlbedoMap", material.albedoUV);
        this._program.bindVector("uAlbedoScale", material.albedoScale);
        this._program.uniform1f("uAlphaCutoff", material.alphaCutoff);
    
        this._program.positionAttribPointer((plistRenderer as WebGLPolyListRenderer).positionAttribParams("position"));
        this._program.texCoordAttribPointer((plistRenderer as WebGLPolyListRenderer).texCoord0AttribParams("texCoord"));
        this._program.texCoordAttribPointer((plistRenderer as WebGLPolyListRenderer).texCoord1AttribParams("texCoord2"));
    }

    destroy() {
        if (this._program) {
            ShaderProgram.Delete(this._program);
            this._program = null;
        }
    }
}

