
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

        fragment: ShaderFunction.GetShaderCode(`precision mediump float;
            varying vec2 fragTexCoord;
            
            uniform sampler2D uTexture;
            `,
            [
                new ShaderFunction('void','main','',`{
                    vec3 color = texture2D(uTexture, fragTexCoord).rgb;
                    if (color.r!=0.0 || color.g!=0.0 || color.b!=0.0) {
                        gl_FragColor = vec4(color, 1.0);
                    }
                    else {
                        discard;
                    }
                }`)
            ])
    }
}

export default class PresentDebugFramebufferShader extends Shader {
    constructor(renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("PresentDebugFramebufferShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = this.renderer;

        this._program = new ShaderProgram(gl, "PresentDebugFramebufferShader");
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

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        const { gl, viewport } = this.renderer;

        this.renderer.state.shaderProgram = this._program;

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uTexture', 0);

        const material = materialRenderer.material;
        if (material.diffuse instanceof Texture) {
            const webglTexture = materialRenderer.getTextureRenderer('diffuse').getApiObject();
            const target = TextureTargetName[material.diffuse.target];
            gl.bindTexture(gl[target], webglTexture);

        }
        else {
            throw new Error("PresentDebugFramebufferShader: invalid material setup. The diffuse material attribute must to be a texture");
        }

        this._program.positionAttribPointer(plistRenderer.positionAttribParams("position"));
        this._program.texCoordAttribPointer(plistRenderer.texCoord0AttribParams("texCoord"));
    }
}
