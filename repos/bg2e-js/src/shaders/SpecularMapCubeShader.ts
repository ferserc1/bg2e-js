/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import Shader from "../render/Shader";
import ShaderProgram from "../render/webgl/ShaderProgram";
import PolyListRenderer from '../render/PolyListRenderer';
import MaterialRenderer from '../render/MaterialRenderer';
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import WebGLRenderer from "../render/webgl/Renderer";
import Renderer from "../render/Renderer";
import WebGLTextureRenderer from "../render/webgl/TextureRenderer";
import WebGLPolyListRenderer from "../render/webgl/PolyListRenderer";

const g_code = {
    webgl: {
        vertex: `precision highp float;
        
        attribute vec3 vertPosition;
        
        uniform mat4 uMVP;
        
        varying vec3 fragNormal;
        
        void main() {
            gl_Position = uMVP * vec4(vertPosition, 1.0);
            fragNormal = normalize(vertPosition);
        }`,

        fragment: (sampleCount: number) => `#extension GL_EXT_shader_texture_lod : require
        precision highp float;
        
        varying vec3 fragNormal;
        
        uniform highp samplerCube uCubemap;
        uniform float uRoughness;
        uniform float uSourceSize;
        uniform float uSourceMaxLod;
        
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
            // GGX alpha squared (roughness^4).
            float a = uRoughness * uRoughness * uRoughness * uRoughness;
            
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
            if (uRoughness <= 0.0001) {
                gl_FragColor = vec4(textureCubeLodEXT(uCubemap, R, 0.0).rgb, 1.0);
                return;
            }

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
                    // Match the native prefilter: integrate each GGX sample over
                    // its solid angle instead of sampling the HDR solar disk as a point.
                    float NdotH = max(dot(N, H), 0.0);
                    float HdotV = max(dot(H, V), 0.000001);
                    float alpha = uRoughness * uRoughness;
                    float alpha2 = alpha * alpha;
                    float denominator = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
                    float distribution = alpha2 / max(${Math.PI} * denominator * denominator, 0.000001);
                    float pdf = max(distribution * NdotH / (4.0 * HdotV), 0.000001);
                    float texelArea = ${4 * Math.PI} / (6.0 * uSourceSize * uSourceSize);
                    float sampleArea = 1.0 / (float(${sampleCount}) * pdf);
                    float lod = clamp(0.5 * log2(sampleArea / texelArea), 0.0, uSourceMaxLod);
                    prefilteredColor += textureCubeLodEXT(uCubemap, L, lod).rgb * NdotL;
                    totalWeight += NdotL;
                }
            }
            prefilteredColor = prefilteredColor / max(totalWeight, 0.000001);

            gl_FragColor = vec4(prefilteredColor, 1.0);
        }`
    }
};

export default class SpecularMapCubeShader extends Shader {
    protected _roughness: number = 0.4;
    protected _program: ShaderProgram | null = null;

    constructor(renderer: Renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("SpecularMapCubeShader is only compatible with WebGL renderer");
        }
    }

    get roughness() { return this._roughness; }
    set roughness(value: number) { this._roughness = value; }

    async load() {
        const { gl } = (this.renderer as WebGLRenderer);

        // This matches with the getPrefilteredColor function in pbr.glsl
        this._roughness = 0.4;

        this._program = new ShaderProgram(gl, "SpecularMapCubeShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment(256));
        this._program.link();
    }

    setup(
        plistRenderer: PolyListRenderer,
        materialRenderer: MaterialRenderer,
        modelMatrix: Mat4,
        viewMatrix: Mat4,
        projectionMatrix: Mat4
    ) {
        if (!this._program) {
            throw new Error("SpecularMapCubeShader: Shader program is not loaded.");
        }

        const { material } = materialRenderer;
        const rend = this.renderer as WebGLRenderer;
        const { gl } = rend;
        rend.state.shaderProgram = this._program;

        const mvp = Mat4.Mult(projectionMatrix, viewMatrix);
        this._program.uniformMatrix4fv('uMVP', false, mvp);

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uCubemap', 0);
        this._program.uniform1f('uRoughness', this._roughness);
        const sourceSize = material.albedoTexture!.size.width;
        this._program.uniform1f('uSourceSize', sourceSize);
        this._program.uniform1f('uSourceMaxLod', Math.log2(sourceSize));
        const webglTexture = (materialRenderer.getTextureRenderer('albedoTexture') as WebGLTextureRenderer)?.getApiObject();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTexture);

        this._program.positionAttribPointer((plistRenderer as WebGLPolyListRenderer).positionAttribParams('vertPosition'));
    }

    destroy() {
        if (this._program) {
            ShaderProgram.Delete(this._program);
            this._program = null;
        }
    }
}