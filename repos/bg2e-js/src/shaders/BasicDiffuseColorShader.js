import Shader from "../render/Shader";
import ShaderProgram from "../render/webgl/ShaderProgram";
import Texture, { ProceduralTextureFunction, TextureTargetName } from "../base/Texture";
import Vec from "../math/Vec";

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
    constructor(renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("PresentTextureShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = this.renderer;
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

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        const { material } = materialRenderer;
        const { gl } = this.renderer;
        this.renderer.state.shaderProgram = this._program;

        this._program.uniformMatrix4fv('mWorld', false, modelMatrix);
        this._program.uniformMatrix4fv('mView', false, viewMatrix);
        this._program.uniformMatrix4fv('mProj', false, projectionMatrix);

        this._program.uniform1i('uTexture', 0);
        let texRenderer = this._whiteTextureRenderer;
        if (material.diffuse instanceof Vec) {
            this._program.uniform3fv('uFixedColor', material.diffuse.rgb);
        }
        else {
            texRenderer = materialRenderer.getTextureRenderer('diffuse');
            this._program.uniform3fv('uFixedColor', new Vec(1,1,1));
        }
        texRenderer.activeTexture(0);
        texRenderer.bindTexture();

        this._program.positionAttribPointer(plistRenderer.positionAttribParams("vertPosition"));
        this._program.texCoordAttribPointer(plistRenderer.texCoord0AttribParams("t0Position"));
    }

    destroy() {
        ShaderProgram.Delete(this._program);
    }
}
