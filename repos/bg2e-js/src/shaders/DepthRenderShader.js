import Shader from "../render/Shader";
import ShaderFunction from "./ShaderFunction";
import ShaderProgram from "../render/webgl/ShaderProgram";

const g_code = {
    webgl: {
        vertex: `precision mediump float;
        attribute vec3 position;
        attribute vec2 texCoord;

        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjMatrix;

        varying vec2 fragTexCoord;
        
        void main() {
            fragTexCoord = texCoord;
            gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
        }`,

        fragment: ShaderFunction.GetShaderCode(
            `precision mediump float;
            
            varying vec2 fragTexCoord;
            `,
            [
                new ShaderFunction('void','main','',`{
                    float d = gl_FragCoord.z / gl_FragCoord.w;
                    gl_FragColor = vec4(d, d, d, 1.0);
                }`)
            ])
    }
}

export default class DepthRenderShader extends Shader {
    constructor(renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("DepthRenderShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = this.renderer;

        this._program = new ShaderProgram(gl, "DepthRenderShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();
    }

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projMatrix) {
        const { gl } = this.renderer;
        const { material } = materialRenderer;

        this.renderer.state.shaderProgram = this._program;

        this._program.bindMatrix("uModelMatrix", modelMatrix);
        this._program.bindMatrix("uViewMatrix", viewMatrix);
        this._program.bindMatrix("uProjMatrix", projMatrix);

        this._program.positionAttribPointer(plistRenderer.positionAttribParams("position"));
        this._program.texCoordAttribPointer(plistRenderer.texCoord0AttribParams("texCoord"));
    }
}


