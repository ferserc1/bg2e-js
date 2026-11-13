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

import type { SolarState } from '../base/SolarLight';
import Vec from '../math/Vec';
import Mat4 from "../math/Mat4";
import PolyListRenderer from '../render/PolyListRenderer';
import MaterialRenderer from '../render/MaterialRenderer';
import Renderer from "../render/Renderer";
import WebGLRenderer from "../render/webgl/Renderer";
import Shader from "../render/Shader";
import ShaderProgram from "../render/webgl/ShaderProgram";
import WebGLTextureRenderer from "../render/webgl/TextureRenderer";
import WebGLPolyListRenderer from "../render/webgl/PolyListRenderer";

const g_code = {
    webgl: {
        vertex: `precision highp float;

        attribute vec3 vertPosition;

        uniform mat4 uMVP;

        varying vec3 fragNormal;

        void main() {
            gl_Position = uMVP * vec4(vertPosition,1.0);

            // The normal can be extracted from the position
            // since this shader is designed to be used with
            // a cube centered in 0,0,0
            fragNormal = normalize(vertPosition);
        }
        `,

        fragment: `#extension GL_EXT_shader_texture_lod : require
        #extension GL_OES_standard_derivatives : enable
        precision highp float;
        varying vec3 fragNormal;
        
        uniform highp samplerCube uCubemap;
        uniform bool uLinearInput;
        uniform float uLod, uSunRadius, uSunEnabled;
        uniform vec3 uSunDirection, uSunIrradiance;
        
        void main() {
            vec3 color = textureCubeLodEXT(uCubemap, normalize(fragNormal), uLod).rgb;
            vec3 n = normalize(fragNormal);
            float angle = acos(clamp(dot(n, uSunDirection), -1.0, 1.0));
            float edge = max(fwidth(angle), 1e-6);
            float disk = 1.0 - smoothstep(max(uSunRadius - edge, 0.0), uSunRadius + edge, angle);
            color += uSunIrradiance * (disk * smoothstep(-max(fwidth(n.y), 1e-6), max(fwidth(n.y), 1e-6), n.y) * uSunEnabled / max(3.14159265 * pow(sin(uSunRadius), 2.0), 1e-12));
            vec3 displayColor = mix(color * 12.92, 1.055 * pow(max(color, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), color));
            gl_FragColor = vec4(uLinearInput ? displayColor : color, 1.0);
        }`
    }
};

export default class SkyCubeShader extends Shader {
    solar: SolarState | null = null;
    lod = 0;
    protected _program: ShaderProgram | null = null;

    constructor(renderer: Renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("SkyCubeShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = (this.renderer as WebGLRenderer);

        gl.getExtension('OES_standard_derivatives');
        this._program = new ShaderProgram(gl, "SkyCubeShader");
        this._program.attachVertexSource(g_code.webgl.vertex);
        this._program.attachFragmentSource(g_code.webgl.fragment);
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
            throw new Error("SkyCubeShader: shader program is not loaded");
        }

        const rend = this.renderer as WebGLRenderer;
        const { gl } = rend;
        rend.state.shaderProgram = this._program;

        const mvp = Mat4.Mult(projectionMatrix, viewMatrix);
        this._program.uniformMatrix4fv('uMVP', false, mvp);

        gl.activeTexture(gl.TEXTURE0);
        this._program.uniform1i('uCubemap', 0);
        this._program.uniform1f('uLod', this.lod);
        this._program.uniform1f('uSunEnabled', this.solar && this.lod === 0 ? 1 : 0);
        this._program.uniform1f('uSunRadius', this.solar?.angularRadius ?? 0.00465);
        this._program.bindVector('uSunDirection', this.solar?.direction ?? new Vec(0, 1, 0));
        this._program.bindVector('uSunIrradiance', this.solar ? Vec.Mult(this.solar.color, this.solar.skyIntensity) : new Vec(0, 0, 0));
        this._program.uniform1i('uLinearInput', materialRenderer.material.albedoTexture?.linearData ? 1 : 0);
        const webglTexture = (materialRenderer.getTextureRenderer('albedoTexture') as WebGLTextureRenderer)?.getApiObject();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTexture);

        this._program.positionAttribPointer((plistRenderer as WebGLPolyListRenderer).positionAttribParams("vertPosition"));
    }

    destroy() {
        if (this._program) {
            ShaderProgram.Delete(this._program);
            this._program = null;
        }
    }
}