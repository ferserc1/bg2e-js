import Shader from "../render/Shader";
import ShaderProgram from "../render/webgl/ShaderProgram";

const g_code = {
    webgl: {
        vertex: `precision mediump float;
        
        attribute vec3 vertPosition;
        
        uniform mat4 mWorld;
        uniform mat4 mView;
        uniform mat4 mProj;
        
        void main() {
            gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
        }`,

        fragment: `precision mediump float;
        
        uniform vec4 uPickColor;
        
        void main() {
            gl_FragColor = vec4(uPickColor);
        }`
    }
}

export default class PickSelectionShader extends Shader {
    constructor(renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("PickSelectionShdaer is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = this.renderer;

        this._program = new ShaderProgram(gl, "PickSelectionShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();
    }

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        this.renderer.state.shaderProgram = this._program;
        this._program.uniformMatrix4fv('mWorld', false, modelMatrix);
        this._program.uniformMatrix4fv('mView', false, viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, projectionMatrix);

        const { polyList } = plistRenderer;
        this._program.uniform4fv('uPickColor', polyList.colorCode);

        this._program.positionAttribPointer(plistRenderer.positionAttribParams("vertPosition"));
    }
}

