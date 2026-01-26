
import Texture, { TextureChannel } from '../base/Texture';
import PolyListRenderer from '../render/PolyListRenderer';
import MaterialRenderer from '../render/MaterialRenderer';
import Renderer from '../render/Renderer';
import WebGLRenderer from '../render/webgl/Renderer';
import Shader from '../render/Shader';
import ShaderProgram from '../render/webgl/ShaderProgram';
import Mat4 from '../math/Mat4';
import WebGLTextureRenderer from '../render/webgl/TextureRenderer';
import WebGLPolyListRenderer from '../render/webgl/PolyListRenderer';

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

const g_renderers: { [key: string]: TextureMergerShader } = {};
export default class TextureMergerShader extends Shader {
    protected _textures: { [key in TextureChannel]?: Texture | null };
    protected _textureChannels: { [key in TextureChannel]?: TextureChannel };
    protected _program!: ShaderProgram;

    static GetUnique(renderer: Renderer) {
        if (!g_renderers[renderer.uniqueId]) {
            g_renderers[renderer.uniqueId] = new TextureMergerShader(renderer);
            g_renderers[renderer.uniqueId].load();
        }
        return g_renderers[renderer.uniqueId];
    }

    constructor(renderer: Renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("TextureMergerShader is only compatible with WebGL renderer");
        }

        this._textures = {};
        this._textureChannels = {};
    }

    async load() {
        const { gl } = (this.renderer as WebGLRenderer);

        this._program = new ShaderProgram(gl, "DefaultTextureMergerShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();
    }

    setTexture(
        tex: Texture,
        channel: TextureChannel,
        dstChannel = TextureChannel.R
    ) {
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

    setup(
        plistRenderer: PolyListRenderer,
        materialRenderer: MaterialRenderer,
        modelMatrix: Mat4,
        viewMatrix: Mat4,
        projectionMatrix: Mat4
    ) {
        if (!this.isComplete) {
            throw new Error("TextureMergerShader: the texture shader is not complete. Check that the textures are set for all channels");
        }

        if (!this._program) {
            throw new Error("TextureMergerShader: shader program is not loaded");
        }
        
        const rend = this.renderer as WebGLRenderer;

        rend.state.shaderProgram = this._program;

        if (!this._textures[TextureChannel.R]) {
            throw new Error("TextureMergerShader: R texture is not set");
        }
        if (!this._textures[TextureChannel.G]) {
            throw new Error("TextureMergerShader: G texture is not set");
        }
        if (!this._textures[TextureChannel.B]) {
            throw new Error("TextureMergerShader: B texture is not set");
        }
        if (!this._textures[TextureChannel.A]) {
            throw new Error("TextureMergerShader: A texture is not set");
        }
        const r = this.renderer.factory.texture(this._textures[TextureChannel.R]) as WebGLTextureRenderer;
        const g = this.renderer.factory.texture(this._textures[TextureChannel.G]) as WebGLTextureRenderer;
        const b = this.renderer.factory.texture(this._textures[TextureChannel.B]) as WebGLTextureRenderer;
        const a = this.renderer.factory.texture(this._textures[TextureChannel.A]) as WebGLTextureRenderer;

        this._program.bindTexture("uTextureR", r, 0);
        this._program.bindTexture("uTextureG", g, 1);
        this._program.bindTexture("uTextureB", b, 2);
        this._program.bindTexture("uTextureA", a, 3);

        this._program.uniform1i("uRChannel", this._textureChannels[TextureChannel.R] || 0);
        this._program.uniform1i("uGChannel", this._textureChannels[TextureChannel.G] || 1);
        this._program.uniform1i("uBChannel", this._textureChannels[TextureChannel.B] || 2);
        this._program.uniform1i("uAChannel", this._textureChannels[TextureChannel.A] || 3);

        this._program.positionAttribPointer((plistRenderer as WebGLPolyListRenderer).positionAttribParams("position"));
        this._program.texCoordAttribPointer((plistRenderer as WebGLPolyListRenderer).texCoord0AttribParams("texCoord"));
    }
}
