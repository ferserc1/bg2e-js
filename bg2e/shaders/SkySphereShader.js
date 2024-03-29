import Shader from "../render/Shader";
import ShaderProgram from "../render/webgl/ShaderProgram";
import { TextureTargetName } from "../base/Texture";
import Vec from "../math/Vec";

const g_code = {
    webgl: {
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
        
        uniform sampler2D uTexture;
        
        void main() {
            vec4 texColor = texture2D(uTexture, fragT0Pos);
            gl_FragColor = vec4(texColor.rgb, 1.0);
        }`
    }
};

export default class SkySphereShader extends Shader {
    constructor(renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("PresentTextureShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = this.renderer;
        this._program = new ShaderProgram(gl, "SkySphereShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
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
