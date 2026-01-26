
import { TextureTargetName } from '../base/Texture';
import Shader from '../render/Shader';
import ShaderProgram from '../render/webgl/ShaderProgram';
import ShaderFunction from './ShaderFunction';
import { applyConvolution } from './webgl_shader_lib';
import Vec from '../math/Vec';
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

        attribute vec3 position;
        attribute vec2 texCoord;
        
        varying vec2 fragTexCoord;

        void main() {
            fragTexCoord = texCoord;
            gl_Position = vec4(position, 1.0);
        }`,

        fragment: ShaderFunction.GetShaderCode(`precision mediump float;
            varying vec2 fragTexCoord;
            
            uniform sampler2D uTexture;
            uniform float uConvMatrix[9];
            uniform vec4 uBorderColor;
            uniform float uBorderWidth;
            uniform vec2 uTexSize;
            `,
            [
                new ShaderFunction('void','main','',`{
                    vec4 selectionColor = applyConvolution(uTexture, fragTexCoord, uTexSize, uConvMatrix, uBorderWidth);
                    if (selectionColor.r!=0.0 && selectionColor.g!=0.0 && selectionColor.b!=0.0) {
                        gl_FragColor = uBorderColor;
                    }
                    else {
                        discard;
                    }
                }`, [applyConvolution])
            ])
    }
}

export default class SelectionHighlightShader extends Shader {
    protected _program: ShaderProgram | null = null;
    protected _borderWidth!: number;
    protected _borderColor!: Vec;
    protected _convMatrix!: number[];

    constructor(renderer: Renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("SelectionHighlightShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = (this.renderer as WebGLRenderer);

        this._program = new ShaderProgram(gl, "SelectionHighlightShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();

        this._borderWidth = 3;
        this._borderColor = new Vec([0.0, 0.7, 1, 1.0]);
        this._convMatrix = [
            0, 1, 0,
            1,-4, 1,
            0, 1, 0
        ];
    }

    setup(
        plistRenderer: PolyListRenderer,
        materialRenderer: MaterialRenderer,
        modelMatrix: Mat4,
        viewMatrix: Mat4,
        projectionMatrix: Mat4
    ) {
        if (!this._program) {
            throw new Error("SelectionHighlightShader: shader program is not loaded");
        }

        const rend = this.renderer as WebGLRenderer;
        const { gl, viewport } = rend;

        rend.state.shaderProgram = this._program;

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uTexture', 0);
        this._program.uniform2f('uTexSize', viewport[2], viewport[3]);
        this._program.uniform1f('uBorderWidth', this._borderWidth);
        this._program.uniform4fv('uBorderColor', this._borderColor);
        this._program.uniform1fv('uConvMatrix', this._convMatrix);

        const material = materialRenderer.material;
        const webglTexture = (materialRenderer.getTextureRenderer('albedoTexture') as WebGLTextureRenderer)?.getApiObject();
        if (webglTexture && material.albedoTexture) {
            const target = TextureTargetName[material.albedoTexture.target];
            gl.bindTexture((gl as any)[target], webglTexture);
        }
        else {
            throw new Error("SelectionHighlightShader: invalid material setup. The albedoTexture material attribute must to be a texture");
        }

        this._program.positionAttribPointer((plistRenderer as WebGLPolyListRenderer).positionAttribParams("position"));
        this._program.texCoordAttribPointer((plistRenderer as WebGLPolyListRenderer).texCoord0AttribParams("texCoord"));
    }

    destroy() {
        if (this._program) {
            ShaderProgram.Delete(this._program);
            this._program = null;
        }
    }
}
