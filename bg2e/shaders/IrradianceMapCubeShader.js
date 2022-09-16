
import Shader from "../render/Shader";
import WebGLRenderer from "../render/webgl/Renderer";
import ShaderProgram from "../render/webgl/ShaderProgram";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
const g_code = {
    webgl: {
        vertex: `precision  mediump float;
        
        attribute vec3 vertPosition;
        
        uniform mat4 uMVP;
        
        varying vec3 fragNormal;

        void main() {
            gl_Position = uMVP * vec4(vertPosition, 1.0);
            fragNormal = normalize(vertPosition);
        }
        `,

        fragment: `precision mediump float;
        varying vec3 fragNormal;
        
        uniform samplerCube uCubemap;
        
        void main() {
            vec3 color = textureCube(uCubemap, normalize(fragNormal)).xyz;
            color.g = 0.0;
            color.b = 0.0;
            gl_FragColor = vec4(color, 1.0);
        }`
    }
};

export default class IrradianceMapCubeShader extends Shader {
    constructor(renderer) {
        super(renderer);

        if (!renderer instanceof WebGLRenderer) {
            throw new Error("IrradianceMapCubeShader: invalid renderer");
        }
    }

    async load() {
        const { gl } = this.renderer;

        this._program = new ShaderProgram(gl, "IrradianceMapCubeShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();
    }

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        const { material } = materialRenderer;
        const { gl } = this.renderer;
        this.renderer.state.shaderProgram = this._program;

        const mvp = Mat4.Mult(viewMatrix, projectionMatrix);
        this._program.uniformMatrix4fv('uMVP', false, mvp);

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uCubemap', 0);
        if (material.diffuse instanceof Vec) {
            throw new Error("Invalid material configuration in SkySphereShader: diffuse component must be a cube map texture");
        }
        const webglTexture = materialRenderer.getTextureRenderer('diffuse').getApiObject();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTexture);

        this._program.positionAttribPointer(plistRenderer.positionAttribParams("vertPosition"));
    }

    destroy() {
        ShaderProgram.Delete(this._program);
        this._program = null;
    }
}