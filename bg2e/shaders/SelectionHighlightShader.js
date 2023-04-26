
import Texture, { TextureTargetName } from '../base/Texture';
import Shader from '../render/Shader';
import ShaderProgram from '../render/webgl/ShaderProgram';
import ShaderFunction from './ShaderFunction';
import { applyConvolution } from './webgl_shader_lib';
import Vec from '../math/Vec';

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

        fragment_: `precision mediump float;
        
        varying vec2 fragTexCoord;
        
        uniform sampler2D uTexture;
        uniform float uConvMatrix[9];
        uniform vec4 uBorderColor;
        uniform float uBorderWidth;
        uniform vec2 uTexSize;
        
        void main() {
            //vec4 texColor = texture2D(uTexture, fragTexCoord);
            vec4 texColor = applyConvolution(uTexture, fragTexCoord, uTexSize, uConvMatrix, uBorderWidth);
            if (selectionColor.r!=0.0 && selectionColor.g!=0.0 && selectionColor.b!=0.0) {
                gl_FragColor = uBorderColor;
            }
            else {
                discard;
            }
            //gl_FragColor = vec4(texColor.rgb, 1.0);
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
                    //vec4 texColor = texture2D(uTexture, fragTexCoord);
                    //gl_FragColor = vec4(texColor.rgb, 1.0);
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
    constructor(renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("SelectionHighlightShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = this.renderer;

        this._program = new ShaderProgram(gl, "SelectionHighlightShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();

        this._borderWidth = 3;
        this._borderColor = new Vec([0.2, 0.3, 0.9, 1.0]);
        this._convMatrix = [
            0, 1, 0,
            1,-4, 1,
            0, 1, 0
        ];
    }

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        const { gl, viewport } = this.renderer;

        this.renderer.state.shaderProgram = this._program;

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uTexture', 0);
        this._program.uniform2f('uTexSize', viewport[2], viewport[3]);
        this._program.uniform1f('uBorderWidth', this._borderWidth);
        this._program.uniform4fv('uBorderColor', this._borderColor);
        this._program.uniform1fv('uConvMatrix', this._convMatrix, 4);

        const material = materialRenderer.material;
        if (material.diffuse instanceof Texture) {
            const webglTexture = materialRenderer.getTextureRenderer('diffuse').getApiObject();
            const target = TextureTargetName[material.diffuse.target];
            gl.bindTexture(gl[target], webglTexture);

        }
        else {
            throw new Error("PresentTextureShader: invalid material setup. The diffuse material attribute must to be a texture");
        }

        this._program.positionAttribPointer(plistRenderer.positionAttribParams("position"));
        this._program.texCoordAttribPointer(plistRenderer.texCoord0AttribParams("texCoord"));
    }
}
