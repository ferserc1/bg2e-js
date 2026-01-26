import Shader from "../render/Shader";
import ShaderProgram from "../render/webgl/ShaderProgram";
import Texture, { ProceduralTextureFunction } from "../base/Texture";
import Vec from "../math/Vec";
import PolyListRenderer from '../render/PolyListRenderer';
import MaterialRenderer from '../render/MaterialRenderer';
import Mat4 from "../math/Mat4";
import Renderer from "../render/Renderer";
import WebGLRenderer from "../render/webgl/Renderer";
import WebGLPolyListRenderer from "../render/webgl/PolyListRenderer";
import TextureRenderer from "../render/TextureRenderer";
import WebGLTextureRenderer from "../render/webgl/TextureRenderer";

const g_code = {
    webgl: {
        vertex: `precision mediump float;

        attribute vec3 vertPosition;
        attribute vec2 t0Position;
        
        varying vec2 fragT0Pos;

        uniform mat4 mWorld;
        uniform mat4 mView;
        uniform mat4 mProj;

        void main() {
            fragT0Pos = t0Position;
            gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
        }`,

        fragment: `
        precision mediump float;

        varying vec2 fragT0Pos;

        uniform vec3 uFixedColor;
        uniform sampler2D uTexture;

        void main() {
            vec4 texColor = texture2D(uTexture, fragT0Pos);
            gl_FragColor = vec4(texColor.rgb * uFixedColor, 1.0);
        }`
    }
}

export default class BasicDiffuseColorShader extends Shader {
    protected _program: ShaderProgram | null = null;
    protected _whiteTexture!: Texture;
    protected _whiteTextureRenderer!: TextureRenderer;

    constructor(renderer: Renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("BasicDiffuseColorShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = (this.renderer as WebGLRenderer);
        this._program = new ShaderProgram(gl, "BasicDiffuseColorShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();

        this._whiteTexture = new Texture();
        this._whiteTexture.proceduralFunction = ProceduralTextureFunction.PLAIN_COLOR;
        this._whiteTexture.proceduralParameters = [1,1,1,1];
        this._whiteTexture.size = new Vec(4,4);
        await this._whiteTexture.loadImageData();
        this._whiteTextureRenderer = this.renderer.factory.texture(this._whiteTexture);
    }

    setup(
        plistRenderer: PolyListRenderer,
        materialRenderer: MaterialRenderer,
        modelMatrix: Mat4,
        viewMatrix: Mat4,
        projectionMatrix: Mat4
    ) {
        if (!this._program) {
            throw new Error("BasicDiffuseColorShader: shader program is not loaded");
        }

        const { material } = materialRenderer;
        const rend = this.renderer as WebGLRenderer;
        rend.state.shaderProgram = this._program;

        this._program.uniformMatrix4fv('mWorld', false, modelMatrix);
        this._program.uniformMatrix4fv('mView', false, viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, projectionMatrix);

        this._program.uniform1i('uTexture', 0);
        let texRenderer = materialRenderer.getTextureRenderer('albedoTexture') || this._whiteTextureRenderer;
        this._program.uniform3fv('uFixedColor', material.albedo.rgb);
        
        (texRenderer as WebGLTextureRenderer).activeTexture(0);
        (texRenderer as WebGLTextureRenderer).bindTexture();

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
