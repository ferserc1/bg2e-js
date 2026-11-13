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
import ShaderFunction from "./ShaderFunction";
import ShaderProgram from "../render/webgl/ShaderProgram";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import Light, {
    LightType
} from "../base/Light";
import {
    createNormalTexture,
    normalTexture,
    createBRDFIntegrationTexture
} from "../tools/TextureResourceDatabase";
import Environment from "../render/Environment";

import {
    getColorCorrectionFunctions,
    getNormalMapFunctions,
    getPBRFunctions,
    getUniformsFunctions,
    replaceConstants
} from "./webgl";
import Renderer from "../render/Renderer";
import WebGLRenderer from "../render/webgl/Renderer";
import PolyListRenderer from "../render/webgl/PolyListRenderer";
import MaterialRenderer from "../render/webgl/MaterialRenderer";
import WebGLTextureRenderer from "../render/webgl/TextureRenderer";
import Texture from "../base/Texture";

function getShaderProgramForLights(this: PBRLightIBLShader, renderer: Renderer, numLights: number): ShaderProgram {
    const r = renderer as WebGLRenderer;

    if (this._programs[numLights]) {
        return this._programs[numLights];
    }

    const vshader = ShaderFunction.GetShaderCode(`precision highp float;
        attribute vec3 inPosition;
        attribute vec3 inNormal;
        attribute vec2 inTexCoord;
        attribute vec2 inTexCoord2;
        attribute vec4 inTangent;

        uniform mat4 uWorld;
        uniform mat4 uView;
        uniform mat4 uViewInverse;
        uniform mat4 uProj;
        uniform mat3 uNormMatrix;

        varying vec3 fragPos;
        varying vec3 fragViewPos;
        varying vec3 fragNorm;
        varying vec2 fragTexCoord;
        varying vec2 fragTexCoord2;
        varying vec3 fragLightPositions[${numLights}];
        
        varying mat3 fragTBN;

        uniform vec3 uLightPositions[${numLights}];
        uniform mat4 uLightTransforms[${numLights}];

        // Used to calculate shadow from depth texture
        uniform mat4 uLightPovMvp;
        varying vec4 fragPositionFromLightPov;

        `,
        [
            new ShaderFunction('void','main','',`{
                

                for (int i = 0; i < ${numLights}; ++i)
                {
                    fragLightPositions[i] = (uLightTransforms[i] * vec4(uLightPositions[i], 1.0)).xyz;
                }

                fragPos = (uWorld * vec4(inPosition, 1.0)).xyz;

                fragPositionFromLightPov = uLightPovMvp * vec4(fragPos, 1.0);

                fragViewPos = (uViewInverse * vec4(0.0,0.0,0.0,1.0)).xyz;
                fragTexCoord = inTexCoord;
                fragTexCoord2 = inTexCoord2;
                fragNorm = normalize(uNormMatrix * inNormal);
                gl_Position = uProj * uView * uWorld * vec4(inPosition,1.0);
                fragTBN = TBNMatrix(uWorld, uNormMatrix, inNormal, inTangent);
            }`, [
                ...getNormalMapFunctions()
            ])
        ]);

    const deps = [
        ...getColorCorrectionFunctions(),
        ...getNormalMapFunctions(),
        ...getUniformsFunctions(),
        ...getPBRFunctions()
    ];

    const fshader = replaceConstants(ShaderFunction.GetShaderCode(`#extension GL_EXT_shader_texture_lod : require
        precision highp float;
        varying vec3 fragPos;
        varying vec3 fragNorm;
        varying vec2 fragTexCoord;
        varying vec2 fragTexCoord2;
        varying vec3 fragViewPos;
        varying vec3 fragLightPositions[${numLights}];

        uniform vec3 uCameraPos;

        uniform sampler2D uAlbedoTexture;
        uniform sampler2D uNormalTexture;
        uniform bool uHasNormalTexture;
        uniform sampler2D uMetallicRoughnessEmissionHeightTexture;

        uniform vec4 uAlbedo;
        uniform float uMetallic;
        uniform float uRoughness;
        uniform float uLightEmission;

        uniform vec4 uFresnelTint;
        uniform vec4 uSheenColor;
        uniform float uSheenIntensity;

        uniform vec2 uAlbedoScale;
        uniform vec2 uNormalScale;
        uniform vec2 uMetallicScale;
        uniform vec2 uRoughnessScale;
        uniform vec2 uLightEmissionScale;

        uniform float uAlphaTresshold;
        
        uniform int uLightTypes[${numLights}];
        uniform vec3 uLightDirections[${numLights}];
        uniform vec3 uLightColors[${numLights}];
        uniform float uLightIntensities[${numLights}];
        

        uniform samplerCube uEnvironmentData;
        uniform float uMaxSpecularLod;
        uniform float uIrradianceLod;
        uniform sampler2D uLightmapData;
        uniform int uIndirectTextureMode;
        uniform int uLightmapChannel;
        uniform vec2 uLightmapScale;
        uniform sampler2D uBRDFIntegrationMap;
        uniform float uAmbientIntensity;

        uniform sampler2D uShadowMap;
        uniform float uShadowBias;
        varying vec4 fragPositionFromLightPov;
        uniform float uShadowStrength;

        uniform int uAlbedoMap;
        uniform int uNormalMap;
        uniform int uAOMap;
        uniform int uMetallicMap;
        uniform int uRoughnessMap;
        uniform int uLightemissionMap;

        varying mat3 fragTBN;
        
        uniform float uBrightness;
        uniform float uContrast;
        `,
        [
            new ShaderFunction('void','main','',`{
                float gamma = 2.2;

                PBRMaterialData mat;
                mat.albedo = uAlbedo;
                mat.albedoScale = uAlbedoScale;
                mat.normalScale = uNormalScale;
                mat.metalnessScale = uMetallicScale;
                mat.roughnessScale = uRoughnessScale;
                mat.lightEmissionScale = uLightEmissionScale;
                mat.metalness = uMetallic;
                mat.roughness = uRoughness;
                mat.lightEmission = uLightEmission;
                mat.albedoUVSet = uAlbedoMap;
                mat.normalUVSet = uNormalMap;
                mat.metalnessUVSet = uMetallicMap;
                mat.roughnessUVSet = uRoughnessMap;
                mat.lightEmissionUVSet = uLightemissionMap;
                mat.aoUVSet = uAOMap;
                mat.fresnelTint = uFresnelTint;
                mat.sheenColor = uSheenColor;
                mat.sheenIntensity = uSheenIntensity;

                vec4 albedo = sampleAlbedo(uAlbedoTexture, fragTexCoord, fragTexCoord2, mat, gamma);
                float metallic = sampleMetallic(uMetallicRoughnessEmissionHeightTexture, fragTexCoord, fragTexCoord2, mat);
                float roughness = sampleRoughness(uMetallicRoughnessEmissionHeightTexture, fragTexCoord, fragTexCoord2, mat);

                // TODO: Light emission
                vec2 lightmapUV = (uAOMap == 0 ? fragTexCoord : fragTexCoord2) * uLightmapScale;
                vec4 lightmap = texture2D(uLightmapData, lightmapUV);
                float ambientOcclussion = uLightmapChannel == 0 ? lightmap.r : (uLightmapChannel == 1 ? lightmap.g : (uLightmapChannel == 2 ? lightmap.b : lightmap.a));
                if (uIndirectTextureMode != 0) ambientOcclussion = 1.0;
                // TODO: Apply height mapping using the packed alpha, height UV, scale and intensity.
                // float height = texture2D(uMetallicRoughnessEmissionHeightTexture, heightUV).a;

                vec3 normal = normalize(fragNorm);
                if (uHasNormalTexture) normal = sampleNormal(uNormalTexture, fragTexCoord, fragTexCoord2, mat, fragTBN);
                if (!gl_FrontFacing) {
                    normal = -normal;
                }
                
                vec3 viewDir = normalize(fragViewPos - fragPos);
                vec3 F0 = mix(vec3(0.04) * mat.fresnelTint.rgb, albedo.rgb, metallic);

                if (albedo.a < uAlphaTresshold) {
                    discard;
                }
                else {
                    vec3 Lo = vec3(0.0);
                    for (int i = 0; i < ${numLights}; ++i) {
                        Light light;
                        light.type = uLightTypes[i];
                        light.color = vec4(uLightColors[i], 1.0);
                        light.intensity = uLightIntensities[i];
                        light.direction = uLightDirections[i];
                        light.position = fragLightPositions[i];

                        Lo += calcRadiance(light, viewDir, fragPos, metallic, roughness, F0, normal, albedo.rgb, mat.sheenIntensity, mat.sheenColor.rgb, ambientOcclussion);
                        
                    }

                    vec3 shadowColor = getShadowColor(fragPositionFromLightPov, uShadowMap, uShadowBias, uShadowStrength);
                    
                    Lo = Lo * shadowColor;

                    float ambientIntensity = uAmbientIntensity;
                    vec3 ambient = calcAmbientLight(
                        viewDir, normal, F0,
                        albedo.rgb, metallic, roughness,
                        uEnvironmentData, uMaxSpecularLod, uIrradianceLod,
                        uBRDFIntegrationMap, ambientOcclussion, lightmap.rgb, uIndirectTextureMode,
                        mat.sheenIntensity, mat.sheenColor.rgb,
                        shadowColor,
                        ambientIntensity
                    );

                    vec3 color = ambient + Lo;

                    gl_FragColor = brightnessContrast(pbrDisplayColor(vec4(color, albedo.a), gamma), uBrightness, uContrast);
                }
            }`, deps)
        ]));

    this._programs[numLights] = ShaderProgram.Create(r.gl, "PBRLightIBL", vshader, fshader);
    return this._programs[numLights];
}

export default class PBRLightIBLShader extends Shader {
    protected _programs: { [key: number]: ShaderProgram };
    protected _lights: Light[];
    protected _lightTransforms: Mat4[];
    protected _lightTypes: LightType[] = [];
    protected _lightPositions: Vec[] = [];
    protected _lightDirections: Vec[] = [];
    protected _lightColors: Vec[] = [];
    protected _lightIntensities: number[] = [];
    protected _brightness: number;
    protected _contrast: number;
    shadowsEnabled = true;

    protected _cameraPosition: Vec;
    protected _brdfIntegrationTexture: Texture | null = null;
    protected _environment: Environment | null = null;
    protected _program: ShaderProgram | null = null;

    constructor(renderer: Renderer) {
        super(renderer);

        this._lights = [];
        this._lightTransforms = [];

        this._brightness = 0.0;
        this._contrast = 1.0;

        this._cameraPosition = new Vec(0,0,0);

        if (renderer.typeId !== "WebGL") {
            throw Error("PresentTextureShader is only compatible with WebGL renderer");
        }

        this._programs = {};
    }

    async load() {
        await createNormalTexture(this.renderer);

        this._brdfIntegrationTexture = await createBRDFIntegrationTexture(this.renderer);
    }

    get brightness() {
        return this._brightness;
    }
    
    get contrast() {
        return this._contrast;
    }

    set brightness(b) {
        this._brightness = b;
    }
    
    set contrast(c) {
        this._contrast = c;
    }

    set cameraPosition(p: Vec) {
        this._cameraPosition = p;
    }

    set environment(env: Environment | null) {
        this._environment = env;
    }

    get environmentMap() {
        return this._environment ? this._environment.environmentMap : null;
    }

    get specularMap() {
        return this._environment ? this._environment.specularMap : null;
    }

    get irradianceMap() {
        return this._environment ? this._environment.irradianceMap : null;
    }

    set lights(l) {
        if (!l.length) {
            throw new Error("BasicPBRLightShader: Invalid light array set.");
        }
        this._lights = l;
        this._lightTypes = [];
        this._lightPositions = [];
        this._lightDirections = [];
        this._lightColors = [];
        this._lightIntensities = [];
        this._lights.forEach((light,i) => {
            this._lightTypes.push(light.type);
            const trx = this._lightTransforms[i];
            const rot = trx && Mat4.GetRotation(trx);
            const position = new Vec(light.position);
            const direction = new Vec(light.direction);
            this._lightPositions.push(trx ? trx.multVector(position).xyz : position);
            this._lightDirections.push(rot ? rot.multVector(direction).xyz.normalize() : direction);
            this._lightColors.push(new Vec(light.color));
            this._lightIntensities.push(light.intensity);
        });
        this._program = getShaderProgramForLights.apply(this, [this.renderer, this._lights.length]);
    }

    get lights() {
        return this._lights;
    }

    set lightTransforms(lt) {
        this._lightTransforms = lt;
    }

    get lightTransforms() {
        return this._lightTransforms;
    }

    updateLight(light: Light, index: number) {
        if (index >= this._lights.length) {
            throw new Error("BasicPBRLightShader: Invalid light index updating light data");
        }
        this._lightTypes[index] = light.type;
        this._lightPositions[index] = new Vec(light.position);
        this._lightDirections[index] = new Vec(light.direction);
        this._lightColors[index] = new Vec(light.color);
        this._lightIntensities[index] = light.intensity;
    }

    updateLights(lights: Light[]) {
        if (this._lights.length !== lights.length) {
            this.lights = lights;
        }
        else {
            lights.forEach((l,i) => this.updateLight(l,i));
        }
    }

    setup(
        plistRenderer: PolyListRenderer,
        materialRenderer: MaterialRenderer,
        modelMatrix: Mat4,
        viewMatrix: Mat4,
        projectionMatrix: Mat4
    ) {
        const rend = this.renderer as WebGLRenderer;
        if (!this._program) {
            throw new Error("BasicPBRLightShader: lights array not specified");
        }

        const material = materialRenderer.material;
        if (material.indirectTextureMode !== 'ao' && (material.isTransparent || material.ambientOcclussionUV !== 1)) {
            throw new Error('Baked lightmaps require opaque materials and UV2 (ambientOcclussionUV = 1)');
        }
        materialRenderer.mergeTextures();
        rend.state.shaderProgram = this._program;
        
        const normMatrix = Mat4.GetNormalMatrix(modelMatrix);
        this._program.bindMatrix('uNormMatrix', normMatrix);
        this._program.bindMatrix('uWorld', modelMatrix);
        this._program.bindMatrix('uView', viewMatrix);
        this._program.bindMatrix('uViewInverse', Mat4.GetInverted(viewMatrix));
        this._program.bindMatrix('uProj', projectionMatrix);

        if (!this._cameraPosition) {
            console.warn("Serious performance warning: camera position not set in BasicPBRLightShader. Extracting the camera position from the view matrix involves inverting the matrix.");
            this._program.bindVector('uCameraPos',Mat4.GetPosition(Mat4.GetInverted(viewMatrix)));
        }
        else {
            this._program.bindVector('uCameraPos',this._cameraPosition);
        }

        materialRenderer.bindTexture(this._program, 'albedoTexture', 'uAlbedoTexture', 0);
        materialRenderer.bindTexture(this._program, 'normalTexture', 'uNormalTexture', 1, normalTexture(this.renderer));
        this._program.uniform1i('uHasNormalTexture', material.normalTexture ? 1 : 0);
        materialRenderer.bindMetalnessRoughnessEmissionHeightTexture(this._program, 'uMetallicRoughnessEmissionHeightTexture', 2);
        this._program.uniform1f('uAlphaTresshold', material.alphaCutoff);

        materialRenderer.bindColor(this._program, 'albedo', 'uAlbedo');
        materialRenderer.bindValue(this._program, 'metalness', 'uMetallic');
        materialRenderer.bindValue(this._program, 'roughness', 'uRoughness');
        materialRenderer.bindValue(this._program, 'lightEmission', 'uLightEmission', 0);
    
        this._program.uniform1i('uAlbedoMap', material.albedoUV);
        this._program.uniform1i('uNormalMap', material.normalUV);
        this._program.uniform1i('uAOMap', material.ambientOcclussionUV);
        this._program.uniform1i('uMetallicMap', material.metalnessUV);
        this._program.uniform1i('uRoughnessMap', material.roughnessUV);
        this._program.uniform1i('uLightemissionMap', material.lightEmissionUV);
    
        this._program.bindVector("uAlbedoScale", material.albedoScale);
        this._program.bindVector("uNormalScale", material.normalScale);
        this._program.bindVector("uMetallicScale", material.metalnessScale);
        this._program.bindVector("uRoughnessScale", material.roughnessScale);
        this._program.bindVector("uLightEmissionScale", material.lightEmissionScale);
        this._program.bindVector("uFresnelTint", material.fresnelTint);
        this._program.bindVector("uSheenColor", material.sheenColor);
        this._program.uniform1f("uSheenIntensity", material.sheenIntensity);

        if (!this._environment?.environmentData || !this._brdfIntegrationTexture) {
            throw new Error("PBRLightIBLShader: Environment maps not set.");
        }
        const envMap = this.renderer.factory.texture(this._environment.environmentData) as WebGLTextureRenderer;
        const brdfLut = this.renderer.factory.texture(this._brdfIntegrationTexture) as WebGLTextureRenderer;

        this._program.bindTexture("uEnvironmentData", envMap, 3);
        materialRenderer.bindTexture(this._program, 'ambientOcclussion', 'uLightmapData', 4);
        this._program.uniform1f('uMaxSpecularLod', this._environment.maxSpecularLod);
        this._program.uniform1f('uIrradianceLod', this._environment.irradianceLod);
        this._program.uniform1i('uIndirectTextureMode', material.indirectTextureMode === 'bakedGI' ? 2 : material.indirectTextureMode === 'bakedAO' ? 1 : 0);
        this._program.uniform1i('uLightmapChannel', material.ambientOcclussionChannel);
        this._program.bindVector('uLightmapScale', material.ambientOcclussionScale);
        this._program.bindTexture("uBRDFIntegrationMap", brdfLut, 5);
        this._program.uniform1f('uShadowStrength', 0);
        materialRenderer.bindTexture(this._program, 'ambientOcclussion', 'uShadowMap', 6);

        this._program.uniform1f("uBrightness", this._brightness);
        this._program.uniform1f("uContrast", this._contrast);

        // TODO: Get the ambient intensity from environment
        this._program.uniform1f("uAmbientIntensity", 1.0);

        let shadowLight: Light | null = this._lights.find(light => light.depthTexture) || null;
        this._lights.forEach((light,i) => {
            if (light.depthTexture) {
                shadowLight = light;
            }
            this._program?.uniform1i(`uLightTypes[${i}]`, this._lightTypes[i]);
            this._program?.bindVector(`uLightPositions[${i}]`, this._lightPositions[i]);
            this._program?.bindVector(`uLightDirections[${i}]`, this._lightDirections[i]);
            this._program?.bindVector(`uLightColors[${i}]`, this._lightColors[i].rgb);
            this._program?.uniform1f(`uLightIntensities[${i}]`, this._lightIntensities[i]);
            this._program?.bindMatrix(`uLightTransforms[${i}]`, this._lightTransforms[i]);
        });

        if (this.shadowsEnabled && shadowLight?.depthTexture) {
            const depthTex = this.renderer.factory.texture(shadowLight.depthTexture) as WebGLTextureRenderer;
            this._program.bindTexture("uShadowMap", depthTex, 6);
            const projectionViewMatrix = Mat4.Mult(shadowLight.projection, shadowLight.viewMatrix || Mat4.MakeIdentity());
            this._program.bindMatrix("uLightPovMvp", projectionViewMatrix);
            this._program.uniform1f("uShadowBias", shadowLight.shadowBias * 30);
            this._program.uniform1f("uShadowStrength", shadowLight.shadowStrength);
        }
        
        this._program.bindAttribs(plistRenderer, {
            position: "inPosition",
            normal: "inNormal",
            tex0: "inTexCoord",
            tex1: "inTexCoord2",
            tangent: "inTangent"
        });
    }

    destroy() {
        if (this._program) {
            ShaderProgram.Delete(this._program);
        }
    }
}