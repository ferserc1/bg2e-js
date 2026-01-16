import Shader from "../render/Shader";
import ShaderProgram from "../render/webgl/ShaderProgram";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";

const g_code = {
    webgl: {
        vertex: `precision mediump float;
        
        attribute vec3 vertPosition;
        
        uniform mat4 uMVP;
        
        varying vec3 fragNormal;
        
        void main() {
            gl_Position = uMVP * vec4(vertPosition, 1.0);
            fragNormal = normalize(vertPosition);
        }`,

        fragment: (sampleCount,roughness) => `precision mediump float;
        
        varying vec3 fragNormal;
        
        uniform samplerCube uCubemap;
        
        float vanDerCorpus(int n, int base) {
            float invBase = 1.0 / float(base);
            float denom   = 1.0;
            float result  = 0.0;

            for(int i = 0; i < 16; ++i)
            {
                if(n > 0)
                {
                    denom   = mod(float(n), 2.0);
                    result += denom * invBase;
                    invBase = invBase / 2.0;
                    n       = int(float(n) / 2.0);
                }
            }

            return result;
        }

        vec2 hammersleyNoBitOps(int i, int N) {
            return vec2(float(i)/float(N), vanDerCorpus(i, 2));
        }

        vec3 importanceSampleGGX(vec2 Xi, vec3 N) {
            // compute roughness^4 outside the gpu
            float a = ${ roughness*roughness*roughness*roughness };
            
            float phi = ${ 2.0 * Math.PI } * Xi.x;
            float cosTheta = sqrt((1.0 - Xi.y) / (1.0 + (a - 1.0) * Xi.y));
            float sinTheta = sqrt(1.0 - cosTheta*cosTheta);
            
            // from spherical coordinates to cartesian coordinates
            vec3 H;
            H.x = sin(phi) * sinTheta;
            H.y = cos(phi) * sinTheta;
            H.z = cosTheta;
            
            // from tangent-space vector to world-space sample vector
            vec3 up        = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
            vec3 tangent   = normalize(cross(up, N));
            vec3 bitangent = cross(N, tangent);
            
            vec3 sampleVec = tangent * H.x + bitangent * H.y + N * H.z;
            return normalize(sampleVec);
        } 

        void main() {
            vec3 N = normalize(fragNormal);
            vec3 R = N;
            vec3 V = R;

            float totalWeight = 0.0;
            vec3 prefilteredColor = vec3(0.0);
            for (int i = 0; i < ${ sampleCount }; ++i)
            {
                vec2 Xi = hammersleyNoBitOps(i, ${ sampleCount });
                vec3 H = importanceSampleGGX(Xi, N);
                vec3 L = normalize(2.0 * dot(V, H) * H - V);

                float NdotL = max(dot(N,L), 0.0);
                if (NdotL > 0.0)
                {
                    prefilteredColor += textureCube(uCubemap, L).rgb * NdotL;
                    totalWeight += NdotL;
                }
            }
            prefilteredColor = prefilteredColor / totalWeight;

            gl_FragColor = vec4(prefilteredColor, 1.0);
        }`
    }
};

export default class SpecularMapCubeShader extends Shader {
    constructor(renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("SpecularMapCubeShader is only compatible with WebGL renderer");
        }
    }

    get roughness() { return this._roughness; }

    async load() {
        const { gl } = this.renderer;

        // This matches with the getPrefilteredColor function in pbr.glsl
        this._roughness = 0.4;

        this._program = new ShaderProgram(gl, "SpecularMapCubeShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment(128, this._roughness));
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
        const webglTexture = materialRenderer.getTextureRenderer('albedoTexture')?.getApiObject();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTexture);

        this._program.positionAttribPointer(plistRenderer.positionAttribParams('vertPosition'));
    }

    destroy() {
        ShaderProgram.Delete(this._program);
        this._program = null;
    }
}