import Shader from "../render/Shader";
import WebGLRenderer from "../render/webgl/Renderer";
import ShaderProgram from "../render/webgl/ShaderProgram";
import Texture, { TextureTargetName } from "../base/Texture";

const g_code = {
    weblg: {
        vertex: `precision mediump float;
        
        attribute vec3 vertPosition;
        attribute vec2 t0Position;
        
        varying vec2 fragT0Pos;
        
        uniform mat4 mView;
        uniform mat4 mProj;
        
        void main() {
            fragT0Pos = t0Position;
            gl_Position = mProj * mView * vec4(vertPosition, 1.0);
        }`,

        fragment: `precision mediump float;
        
        varying vec2 fragT0Pos;
        
        uniform vec3 uTexture;
        
        void main() {
            vec4 texColor = texture2D(uTexture, fragT0Pos);
            gl_FRagColor = vec4(texColor.rgb, 1.0);
        }`
    }
};

export default class SkySphereShader extends Shader {
    constructor(renderer) {
        super(renderer);

        if (!renderer instanceof WebGLRenderer) {
            throw new Error("SkySphereShader: invalid renderer");
        }

        const { gl } = renderer;
        this._program = new ShaderProgram(gl, "SkySphereShader");
        this._program.attachVertexSource(g_code.weblg.vertex);
        this._program.attachFragmentSource(g_code.weblg.fragment);
        this._program.link();
    }

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        const { material } = materialRenderer;
        const { gl } = this.renderer;
        this.renderer.state.shaderProgram = this._program;

        this._program.uniformMatrix4fv('mView', false, viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, projectionMatrix);

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uTexture', 0);
        if (material.diffuse instanceof Vec) {
            throw new Error("Invalid material configuration in SkySphereShader: diffuse component must be a texture");
        }
        const webglTexture = materialRenderer.getTextureRenderer('diffuse').getApiObject();
        const target = TextureTargetName[material.diffuse.target];
        gl.bindTexture(gl[target], webglTexture);
        
        this._program.positionAttribPointer(plistRenderer.positionAttribParams("vertPosition"));
        this._program.texCoordAttribPointer(plistRenderer.texCoord0AttribParams("t0Position"));
    }

    destroy() {
        ShaderProgram.Delete(this._program);
    }
}
