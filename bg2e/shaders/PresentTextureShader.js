
import Texture, { TextureTargetName } from '../base/Texture';
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
        
        uniform sampler2D uTexture;
        
        void main() {
            vec4 texColor = texture2D(uTexture, fragTexCoord);
            gl_FragColor = vec4(texColor.rgb, 1.0);
        }`
    }
}

export default class PresentTextureShader extends Shader {
    constructor(renderer) {
        super(renderer);

        // This shader is compatible with WebGL renderer
        if (!renderer instanceof WebGLRenderer) {
            throw new Error("shader.PresentTextureShader: invalid renderer. This shader is compatible with WebGLRenderer");
        }
    }

    async load() {
        const { gl } = this.renderer;

        this._program = new ShaderProgram(gl, "DefaultPresentTextureShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
        this._program.link();
    }

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        const { gl } = this.renderer;

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
            throw new Error("PresentTextureShader: invalid material setup. The diffuse material attribute must to be a texture");
        }

        this._program.positionAttribPointer(plistRenderer.positionAttribParams("position"));
        this._program.texCoordAttribPointer(plistRenderer.texCoord0AttribParams("texCoord"));
    }
}
