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

        fragment: `precision highp float;
        varying vec3 fragNormal;
        uniform vec3 uHorizon, uZenith, uGround, uSunDirection, uSunIrradiance;
        uniform float uSolarEnabled, uSkyIntensity, uIncludeDisk, uAngularRadius, uSize;
        void main() {
            vec3 n = normalize(fragNormal);
            float altitude = max(n.y, 0.0);
            vec3 sky = mix(uHorizon, uZenith, sqrt(altitude));
            vec3 ground = uGround;
            vec3 color = mix(ground, sky, smoothstep(-0.03, 0.03, n.y));
            if (uSolarEnabled > 0.5)
            {
                vec3 sun = uSunDirection;
                float elevation = asin(clamp(sun.y, -1.0, 1.0));
                float day = smoothstep(-0.12, 0.18, elevation);
                float dusk = (1.0 - smoothstep(0.0, 0.35, abs(elevation))) * smoothstep(-0.18, 0.0, elevation);
                float sunward = pow(max(dot(n, sun), 0.0), 4.0);
                float lowSky = pow(1.0 - altitude, 3.0);
                // Authored colors remain the daytime reference. Night is a dim residual,
                // and twilight is an artistic approximation, not multiple scattering.
                vec3 warm = vec3(1.0, 0.32, 0.10);
                vec3 horizon = mix(uHorizon, uHorizon * warm, dusk * 0.85);
                sky = mix(horizon, uZenith, sqrt(altitude));
                sky *= (0.002 + 0.998 * day) * uSkyIntensity;
                sky += uHorizon * warm * dusk * lowSky * (0.2 + 0.8 * sunward) * uSkyIntensity;
                ground *= (0.002 + 0.998 * day) * uSkyIntensity;
                color = mix(ground, sky, smoothstep(-0.03, 0.03, n.y));
                if (uIncludeDisk > 0.5)
                {
                    float radius = uAngularRadius;
                    // Equal-area broadened disk for subpixel cubemap footprints. The
                    // energy correction keeps a real-size sun from flickering away.
                    float footprint = 1.5 / uSize;
                    float filteredRadius = sqrt(radius * radius + footprint * footprint);
                    float angle = acos(clamp(dot(n, sun), -1.0, 1.0));
                    float edge = max(footprint * 0.5, 1e-6);
                    float disk = 1.0 - smoothstep(max(filteredRadius - edge, 0.0), filteredRadius + edge, angle);
                    float diskArea = sin(0.5 * radius);
                    float filteredArea = sin(0.5 * filteredRadius);
                    float energy = (diskArea * diskArea) / max(filteredArea * filteredArea, 1e-12);
                    float horizonVisibility = smoothstep(-footprint * 0.5, footprint * 0.5, n.y);
                    color += uSunIrradiance * (1.0 / (3.141592653589793 * pow(sin(uAngularRadius), 2.0))) * disk * energy * horizonVisibility;
                }
            }
            else
            {
                vec3 sun = normalize(vec3(0.4, 0.7, 0.2));
                color += vec3(8.0, 6.5, 4.0) * pow(max(dot(n, sun), 0.0), 512.0);
            }
            gl_FragColor = vec4(color, 1.0);
        }`
    }
};

export default class ProceduralSkyShader extends Shader {
    horizon = [0.55, 0.65, 0.8];
    zenith = [0.06, 0.22, 0.6];
    ground = [0.04, 0.035, 0.025];
    solar: SolarState | null = null;
    includeDisk = true;
    size = 512;
    protected _program: ShaderProgram | null = null;

    constructor(renderer: Renderer) {
        super(renderer);

        if (renderer.typeId !== "WebGL") {
            throw Error("ProceduralSkyShader is only compatible with WebGL renderer");
        }
    }

    async load() {
        const { gl } = (this.renderer as WebGLRenderer);

        this._program = new ShaderProgram(gl, "ProceduralSkyShader");
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
            throw new Error("ProceduralSkyShader: shader program is not loaded");
        }

        const rend = this.renderer as WebGLRenderer;
        rend.state.shaderProgram = this._program;

        const mvp = Mat4.Mult(projectionMatrix, viewMatrix);
        this._program.uniformMatrix4fv('uMVP', false, mvp);

        this._program.bindVector('uHorizon', new Vec(this.horizon));
        this._program.bindVector('uZenith', new Vec(this.zenith));
        this._program.bindVector('uGround', new Vec(this.ground));
        this._program.bindVector('uSunDirection', this.solar?.direction ?? new Vec(0, 1, 0));
        this._program.bindVector('uSunIrradiance', this.solar ? Vec.Mult(this.solar.color, this.solar.skyIntensity) : new Vec(0, 0, 0));
        this._program.uniform1f('uSolarEnabled', this.solar ? 1 : 0);
        this._program.uniform1f('uSkyIntensity', this.solar?.skyIntensity ?? 1);
        this._program.uniform1f('uAngularRadius', this.solar?.angularRadius ?? 0.00465);
        this._program.uniform1f('uIncludeDisk', this.includeDisk ? 1 : 0);
        this._program.uniform1f('uSize', this.size);

        this._program.positionAttribPointer((plistRenderer as WebGLPolyListRenderer).positionAttribParams("vertPosition"));
    }

    destroy() {
        if (this._program) {
            ShaderProgram.Delete(this._program);
            this._program = null;
        }
    }
}