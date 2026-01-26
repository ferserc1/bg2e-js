import Shader from "../render/Shader";
import ShaderProgram from "../render/webgl/ShaderProgram";
import PolyListRenderer from '../render/PolyListRenderer';
import MaterialRenderer from '../render/MaterialRenderer';
import Mat4 from "../math/Mat4";
import Renderer from "../render/Renderer";
import WebGLRenderer from "../render/webgl/Renderer";
import WebGLPolyListRenderer from "../render/webgl/PolyListRenderer";

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
        uniform bool uSelected;
        
        void main() {
            if (uSelected) {
                gl_FragColor = vec4(uPickColor);
            }
            else {
                discard;
            }
        }`
    }
}

export default class PickSelectionShader extends Shader {
    protected _program: ShaderProgram | null = null;
    protected _forceDraw: boolean = false;

    constructor(renderer: Renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("PickSelectionShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = (this.renderer as WebGLRenderer);

        this._program = new ShaderProgram(gl, "PickSelectionShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();

        this._forceDraw = true;
    }

    set forceDraw(d: boolean) {
        this._forceDraw = d;
    }

    get forceDraw() {
        return this._forceDraw;
    }

    setup(
        plistRenderer: PolyListRenderer,
        materialRenderer: MaterialRenderer,
        modelMatrix: Mat4,
        viewMatrix: Mat4,
        projectionMatrix: Mat4
    ) {
        if (!this._program) {
            throw new Error("PickSelectionShader: shader program is not loaded");
        }

        const rend = this.renderer as WebGLRenderer;
        rend.state.shaderProgram = this._program;
        this._program.uniformMatrix4fv('mWorld', false, modelMatrix);
        this._program.uniformMatrix4fv('mView', false, viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, projectionMatrix);
        this._program.uniform1i('uSelected', (this._forceDraw || plistRenderer.polyList.isSelected) ? 1 : 0);

        const { polyList } = plistRenderer;
        this._program.uniform4fv('uPickColor', polyList.colorCode);

        this._program.positionAttribPointer((plistRenderer as WebGLPolyListRenderer).positionAttribParams("vertPosition"));
    }

    destroy() {
        if (this._program) {
            ShaderProgram.Delete(this._program);
            this._program = null;
        }
    }
}
