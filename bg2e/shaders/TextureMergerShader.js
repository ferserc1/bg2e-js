
import Texture, { TextureTargetName, TextureChannel } from '../base/Texture';
import Shader from '../render/Shader';
import WebGLRenderer from '../render/webgl/Renderer';
import ShaderProgram from '../render/webgl/ShaderProgram';

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

        fragment: `precision mediump float;
        
        varying vec2 fragTexCoord;
        
        uniform sampler2D uTextureR;
        uniform sampler2D uTextureG;
        uniform sampler2D uTextureB;
        uniform sampler2D uTextureA;

        uniform int uRChannel;
        uniform int uGChannel;
        uniform int uBChannel;
        uniform int uAChannel;
        
        float getChannel(vec4 color, int channel) {
            if (channel == 1) {
                return color.r;
            }
            else if (channel == 2) {
                return color.g;
            }
            else if (channel == 3) {
                return color.b;
            }
            else {
                return color.a;
            }
        }

        void main() {
            vec4 result = vec4(
                getChannel(texture2D(uTextureR, fragTexCoord), uRChannel),
                getChannel(texture2D(uTextureG, fragTexCoord), uGChannel),
                getChannel(texture2D(uTextureB, fragTexCoord), uBChannel),
                getChannel(texture2D(uTextureA, fragTexCoord), uAChannel)
            );
            
            gl_FragColor = result;
        }`
    }
}

export default class TextureMergerShader extends Shader {
    constructor(renderer) {
        super(renderer);

        // This shader is compatible with WebGL renderer
        if (!renderer instanceof WebGLRenderer) {
            throw new Error("shader.TextureMergerShader: invalid renderer. This shader is compatible with WebGLRenderer");
        }

        this._textures = {};
        this._textureChannels = {};
    }

    async load() {
        const { gl } = this.renderer;

        this._program = new ShaderProgram(gl, "DefaultTextureMergerShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();
    }

    setTexture(tex,channel,dstChannel = TextureChannel.R) {
        if (channel<TextureChannel.R || channel>TextureChannel.A) {
            throw new Error(`TextureMergerShader: invalid texture channel set ${ channel }`);
        }
        this._textures[channel] = tex;
        this._textureChannels[channel] = dstChannel;
    }

    get isComplete() {
        return  this._textures[TextureChannel.R] &&
                this._textures[TextureChannel.G] &&
                this._textures[TextureChannel.B] &&
                this._textures[TextureChannel.A] && true;
    }

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        if (!this.isComplete) {
            throw new Error("TextureMergerShader: the texture shader is not complete. Check that the textures are set for all channels");
        }

        this.renderer.state.shaderProgram = this._program;

        this._program.bindTexture("uTextureR", this.renderer.factory.texture(this._textures[TextureChannel.R]), 0);
        this._program.bindTexture("uTextureG", this.renderer.factory.texture(this._textures[TextureChannel.G]), 1);
        this._program.bindTexture("uTextureB", this.renderer.factory.texture(this._textures[TextureChannel.B]), 2);
        this._program.bindTexture("uTextureA", this.renderer.factory.texture(this._textures[TextureChannel.A]), 3);

        this._program.uniform1i("uRChannel", this._textureChannels[TextureChannel.R]);
        this._program.uniform1i("uGChannel", this._textureChannels[TextureChannel.G]);
        this._program.uniform1i("uBChannel", this._textureChannels[TextureChannel.B]);
        this._program.uniform1i("uAChannel", this._textureChannels[TextureChannel.A]);

        this._program.positionAttribPointer(plistRenderer.positionAttribParams("position"));
        this._program.texCoordAttribPointer(plistRenderer.texCoord0AttribParams("texCoord"));
    }
}
