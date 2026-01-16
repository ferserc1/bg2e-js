
import Shader from "../render/Shader";
import ShaderProgram from "../render/webgl/ShaderProgram";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";

const g_code = {
    webgl: {
        vertex: `precision  mediump float;
        
        attribute vec3 vertPosition;
        
        uniform mat4 uMVP;
        
        varying vec3 fragNormal;

        void main() {
            gl_Position = uMVP * vec4(vertPosition, 1.0);
            fragNormal = normalize(vertPosition);
        }
        `,

        fragment: (sampleDelta) => `precision mediump float;
        varying vec3 fragNormal;
        
        uniform samplerCube uCubemap;
        
        void main() {
            vec3 normal = normalize(fragNormal);
            vec3 irradiance = vec3(0.0);

            vec3 up = vec3(0.0, 1.0, 0.0);
            vec3 right = cross(up, normal);
            up = cross(normal,right);

            float nrSamples = 0.0;
            for (float phi = 0.0; phi < ${ 2 * Math.PI }; phi += ${ sampleDelta })
            {
                for (float theta = 0.0; theta < ${ 0.5 * Math.PI }; theta += ${ sampleDelta })
                {
                    // Spherical to cartesian
                    vec3 tangentSample = vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));

                    // tangent space to world space
                    vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * normal;

                    irradiance += textureCube(uCubemap, sampleVec).rgb * cos(theta) * sin(theta);
                    nrSamples++;
                }
            }
            irradiance = ${ Math.PI } * irradiance * (1.0 / float(nrSamples));

            gl_FragColor = vec4(irradiance, 1.0);
        }`
    }
};

export default class IrradianceMapCubeShader extends Shader {
    constructor(renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("PresentTextureShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = this.renderer;

        this._program = new ShaderProgram(gl, "IrradianceMapCubeShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment(0.1));
        this._program.link();
    }

    setup(plistRenderer, materialRenderer, modelMatrix, viewMatrix, projectionMatrix) {
        const { material } = materialRenderer;
        const { gl } = this.renderer;
        this.renderer.state.shaderProgram = this._program;

        const mvp = Mat4.Mult(projectionMatrix, viewMatrix);
        this._program.uniformMatrix4fv('uMVP', false, mvp);

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uCubemap', 0);
        
        const webglTexture = materialRenderer.getTextureRenderer('albedoTexture').getApiObject();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTexture);

        this._program.positionAttribPointer(plistRenderer.positionAttribParams("vertPosition"));
    }

    destroy() {
        ShaderProgram.Delete(this._program);
        this._program = null;
    }
}