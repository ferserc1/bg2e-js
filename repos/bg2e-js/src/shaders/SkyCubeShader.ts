import Mat4 from "../math/Mat4";
import PolyListRenderer from '../render/PolyListRenderer';
import MaterialRenderer from '../render/MaterialRenderer';
import Renderer from "../render/Renderer";
import WebGLRenderer from "../render/webgl/Renderer";
import Shader from "../render/Shader";
import ShaderProgram from "../render/webgl/ShaderProgram";
import WebGLTextureRenderer from "../render/webgl/TextureRenderer";
import WebGLPolyListRenderer from "../render/webgl/PolyListRenderer";

const g_code = {
    webgl: {
        vertex: `precision mediump float;

        attribute vec3 vertPosition;

        uniform mat4 uMVP;

        varying vec3 fragNormal;

        void main() {
            gl_Position = uMVP * vec4(vertPosition,1.0);

            // The normal can be extracted from the position
            // since this shader is designed to be used with
            // a cube centered in 0,0,0
            fragNormal = normalize(vertPosition);
        }
        `,

        fragment: `precision mediump float;
        varying vec3 fragNormal;
        
        uniform samplerCube uCubemap;
        
        void main() {
            gl_FragColor = textureCube(uCubemap, normalize(fragNormal));
        }`
    }
};

export default class SkyCubeShader extends Shader {
    protected _program: ShaderProgram | null = null;

    constructor(renderer: Renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("SkyCubeShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = (this.renderer as WebGLRenderer);

        this._program = new ShaderProgram(gl, "SkyCubeShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();
    }

    setup(
        plistRenderer: PolyListRenderer,
        materialRenderer: MaterialRenderer,
        modelMatrix: Mat4,
        viewMatrix: Mat4,
        projectionMatrix: Mat4
    ) {
        if (!this._program) {
            throw new Error("SkyCubeShader: shader program is not loaded");
        }

        const rend = this.renderer as WebGLRenderer;
        const { gl } = rend;
        rend.state.shaderProgram = this._program;

        const mvp = Mat4.Mult(projectionMatrix, viewMatrix);
        this._program.uniformMatrix4fv('uMVP', false, mvp);

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uCubemap', 0);
        const webglTexture = (materialRenderer.getTextureRenderer('albedoTexture') as WebGLTextureRenderer)?.getApiObject();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTexture);

        this._program.positionAttribPointer((plistRenderer as WebGLPolyListRenderer).positionAttribParams("vertPosition"));
    }

    destroy() {
        if (this._program) {
            ShaderProgram.Delete(this._program);
            this._program = null;
        }
    }
}