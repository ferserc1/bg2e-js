import Shader from "../render/Shader";
import ShaderProgram from "../render/webgl/ShaderProgram";
import { TextureTargetName } from "../base/Texture";
import PolyListRenderer from '../render/PolyListRenderer';
import MaterialRenderer from '../render/MaterialRenderer';
import Mat4 from "../math/Mat4";
import Renderer from "../render/Renderer";
import WebGLRenderer from "../render/webgl/Renderer";
import WebGLTextureRenderer from "../render/webgl/TextureRenderer";
import WebGLPolyListRenderer from "../render/webgl/PolyListRenderer";

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
    protected _program: ShaderProgram | null = null;

    constructor(renderer: Renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("SkySphereShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = (this.renderer as WebGLRenderer);
        this._program = new ShaderProgram(gl, "SkySphereShader");
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
            throw new Error("SkySphereShader: shader program is not loaded");
        }


        const { material } = materialRenderer;
        if (!material.albedoTexture) {
            throw new Error("SkySphereShader: material does not have an albedo texture");
        }

        const rend = this.renderer as WebGLRenderer;
        const { gl } = rend;
        rend.state.shaderProgram = this._program;

        this._program.uniformMatrix4fv('mView', false, viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, projectionMatrix);

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uTexture', 0);

        const webglTexture = (materialRenderer.getTextureRenderer('albedoTexture') as WebGLTextureRenderer)?.getApiObject();
        const target = TextureTargetName[material.albedoTexture.target];
        gl.bindTexture((gl as any)[target], webglTexture);
        
        this._program.positionAttribPointer((plistRenderer as WebGLPolyListRenderer).positionAttribParams("vertPosition"));
        this._program.texCoordAttribPointer((plistRenderer as WebGLPolyListRenderer).texCoord0AttribParams("t0Position"));
    }

    destroy() {
        if (this._program) {
            ShaderProgram.Delete(this._program);
            this._program = null;
        }
    }
}
