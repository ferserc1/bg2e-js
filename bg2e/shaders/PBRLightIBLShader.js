import Shader from "../render/Shader";
import { pbrPointLight, pbrDirectionalLight, pbrAmbientLight, getShadowColor } from './webgl_shader_lib';
import ShaderFunction from "./ShaderFunction";
import ShaderProgram from "../render/webgl/ShaderProgram";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import { LightType } from "../base/Light";
import { createNormalTexture, normalTexture, createBRDFIntegrationTexture } from "../tools/TextureResourceDatabase";
import LightComponent from "../scene/LightComponent";

function getShaderProgramForLights(renderer, numLights) {
    if (this._programs[numLights]) {
        return this._programs[numLights];
    }

    const vshader = ShaderFunction.GetShaderCode(`precision mediump float;
        attribute vec3 inPosition;
        attribute vec3 inNormal;
        attribute vec2 inTexCoord;
        attribute vec2 inTexCoord2;
        attribute vec3 inTangent;

        uniform mat4 uWorld;
        uniform mat4 uView;
        uniform mat4 uProj;
        uniform mat3 uNormMatrix;

        varying vec3 fragPos;
        varying vec3 fragNorm;
        varying vec2 fragTexCoord;
        varying vec2 fragTexCoord2;
        varying vec3 fragTangent;
        varying vec3 fragBitangent;
        varying vec3 fragLightPositions[${numLights}];

        uniform vec3 uLightPositions[${numLights}];
        uniform mat4 uLightTransforms[${numLights}];

        // Used to calculate shadow from depth texture
        uniform mat4 uLightPovMvp;
        varying vec4 fragPositionFromLightPov;

        `,
        [
            new ShaderFunction('void','main','',`{
                fragPos = (uWorld * vec4(inPosition, 1.0)).xyz;
                fragNorm = normalize(uNormMatrix * inNormal);
                fragTangent = normalize(uNormMatrix * inTangent);
                fragBitangent = normalize(fragNorm * fragTangent);
                fragTexCoord = inTexCoord;
                fragTexCoord2 = inTexCoord2;

                for (int i = 0; i < ${numLights}; ++i)
                {
                    fragLightPositions[i] = (uLightTransforms[i] * vec4(uLightPositions[i], 1.0)).xyz;
                }

                fragPositionFromLightPov = uLightPovMvp * vec4(fragPos, 1.0);
                gl_Position = uProj * uView * uWorld * vec4(inPosition,1.0);
            }`)
        ]);

    const fshader = ShaderFunction.GetShaderCode(`precision mediump float;
        varying vec3 fragPos;
        varying vec3 fragNorm;
        varying vec2 fragTexCoord;
        varying vec2 fragTexCoord2;
        varying vec3 fragTangent;
        varying vec3 fragBitangent;
        varying vec3 fragLightPositions[${numLights}];

        uniform vec3 uCameraPos;

        uniform sampler2D uAlbedoTexture;
        uniform sampler2D uNormalTexture;
        uniform sampler2D uMetallicRoughnessHeightAOTexture;

        uniform vec4 uAlbedo;
        uniform float uMetallic;
        uniform float uRoughness;
        uniform float uLightEmission;

        uniform vec4 uFresnel;

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
        

        uniform samplerCube uEnvMap;
        uniform samplerCube uSpecularMap;
        uniform samplerCube uIrradianceMap;
        uniform sampler2D uBRDFIntegrationMap;
        uniform float uAmbientIntensity;

        uniform sampler2D uShadowMap;
        uniform float uShadowBias;
        varying vec4 fragPositionFromLightPov;
        uniform float uShadowStrength;

        uniform int uAOMap;
        uniform int uMetallicMap;
        uniform int uRoughnessMap;
        uniform int uLightemissionMap;
        `,
        [
            new ShaderFunction('void','main','',`{
                vec3 N = normalize(fragNorm);
                if (!gl_FrontFacing) {
                    N = -N;
                }
                vec3 T = normalize(fragTangent);
                vec3 B = normalize(fragBitangent);
                mat3 TBN = mat3(T,B,N);

                float gamma = 1.8;
                vec4 albedoRGBA = texture2D(uAlbedoTexture, fragTexCoord * uAlbedoScale);
                vec3 albedo = albedoRGBA.rgb * uAlbedo.rgb;
                albedo = pow(albedo, vec3(gamma));
                float alpha = albedoRGBA.a * uAlbedo.a;
                vec3 normal = normalize(texture2D(uNormalTexture, fragTexCoord * uNormalScale).rgb * 2.0 - 1.0);

                vec2 metallicUV = fragTexCoord;
                vec2 roughnessUV = fragTexCoord;
                vec2 lightEmissionUV = fragTexCoord;
                if (uMetallicMap == 1) {
                    metallicUV = fragTexCoord2;
                }
                if (uRoughnessMap == 1) {
                    roughnessUV = fragTexCoord2;
                }
                if (uLightemissionMap == 1) {
                    lightEmissionUV = fragTexCoord2;
                }
                float metallic = texture2D(uMetallicRoughnessHeightAOTexture, metallicUV * uMetallicScale).r * uMetallic;
                float roughness = max(texture2D(uMetallicRoughnessHeightAOTexture, roughnessUV * uRoughnessScale).g * uRoughness, 0.01);
                float lightEmission = min(texture2D(uMetallicRoughnessHeightAOTexture, lightEmissionUV * uLightEmissionScale).b + uLightEmission, 1.0);
                vec3 fresnel = uFresnel.rgb;
                
                if (alpha < uAlphaTresshold) {
                    discard;
                }
                else {
                    N = normalize(TBN * normal);
                    vec3 V = normalize(uCameraPos - fragPos);

                    vec3 shadowColor = getShadowColor(fragPositionFromLightPov, uShadowMap, uShadowBias, uShadowStrength);

                    vec3 Lo = vec3(0.0);
                    for (int i = 0; i < ${numLights}; ++i)
                    {
                        float lightIntensity = uLightIntensities[i];
                        if (uLightTypes[i] == ${ LightType.POINT }) {
                            Lo += pbrPointLight(
                                fragLightPositions[i], uLightColors[i] * lightIntensity, fragPos, N, V,
                                albedo, roughness, metallic, fresnel);
                        }
                        else if (uLightTypes[i] == ${ LightType.DIRECTIONAL }) {
                            
                            vec3 dirColor = pbrDirectionalLight(
                                -uLightDirections[i], uLightColors[i] * lightIntensity, fragPos, N, V,
                                albedo, roughness, metallic, fresnel, shadowColor);

                            Lo += clamp(dirColor + vec3(lightEmission) * albedo, 0.0, 1.0);
                        }
                    }

                    vec3 ambient = pbrAmbientLight(
                        fragPos, N, V, albedo, metallic, roughness, uIrradianceMap, uSpecularMap, uEnvMap, uBRDFIntegrationMap, fresnel, shadowColor
                    ) * uAmbientIntensity;

                    vec2 aoUV = fragTexCoord;
                    if (uAOMap == 1) {
                        aoUV = fragTexCoord2;
                    }
                    float ao = texture2D(uMetallicRoughnessHeightAOTexture, aoUV).a;
                    vec3 color = (ambient + Lo) * ao;

                    color = pow(color, vec3(1.0 / gamma));
                    
                    gl_FragColor = vec4(color,alpha);
                }
            }`, [pbrPointLight, pbrDirectionalLight, pbrAmbientLight, getShadowColor])
        ]);

    this._programs[numLights] = ShaderProgram.Create(renderer.gl,"PBRLightIBL",vshader,fshader);
    return this._programs[numLights];
}
export default class PBRLightIBLShader extends Shader {
    constructor(renderer) {
        super(renderer);

        this._lights = [];
        this._lightTransforms = [];

        if (renderer.typeId !== "WebGL") {
            throw Error("PresentTextureShader is only compatible with WebGL renderer");
        }

        this._programs = {};
    }

    async load() {
        await createNormalTexture(this.renderer);

        this._brdfIntegrationTexture = await createBRDFIntegrationTexture(this.renderer);
    }

    set cameraPosition(p) {
        this._cameraPosition = p;
    }

    set environment(env) {
        this._environment = env;
    }

    get environmentMap() {
        return this._environment.environmentMap;
    }

    get specularMap() {
        return this._environment.specularMap;
    }

    get irradianceMap() {
        return this._environment.irradianceMap;
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

    updateLight(light,index) {
        if (light >= this._lights.length) {
            throw new Error("BasicPBRLightShader: Invalid light index updating light data");
        }
        this._lightTypes[index] = light.type;
        this._lightPositions[index] = new Vec(light.position);
        this._lightDirections[index] = new Vec(light.direction);
        this._lightColors[index] = new Vec(light.color);
        this._lightIntensities[index] = light.intensity;
    }

    updateLights(lights) {
        if (this._lights.length !== lights.length) {
            this.lights = lights;
        }
        else {
            lights.forEach((l,i) => this.updateLight(l,i));
        }
    }

    setup(plistRenderer,materialRenderer,modelMatrix,viewMatrix,projectionMatrix) {
        if (!this._program) {
            throw new Error("BasicPBRLightShader: lights array not specified");
        }

        const material = materialRenderer.material;
        materialRenderer.mergeTextures();
        this.renderer.state.shaderProgram = this._program;
        
        const normMatrix = Mat4.GetNormalMatrix(modelMatrix);
        this._program.bindMatrix('uNormMatrix', normMatrix);
        this._program.bindMatrix('uWorld', modelMatrix);
        this._program.bindMatrix('uView', viewMatrix);
        this._program.bindMatrix('uProj', projectionMatrix);

        if (!this._cameraPosition) {
            console.warn("Serious performance warning: camera position not set in BasicPBRLightShader. Extracting the camera position from the view matrix involves inverting the matrix.");
            this._program.bindVector('uCameraPos',Mat4.GetPosition(Mat4.GetInverted(viewMatrix)));
        }
        else {
            this._program.bindVector('uCameraPos',this._cameraPosition);
        }

        materialRenderer.bindTexture(this._program, 'diffuse', 'uAlbedoTexture', 0);
        materialRenderer.bindTexture(this._program, 'normal', 'uNormalTexture', 1, normalTexture(this.renderer));
        materialRenderer.bindMetallicRoughnessHeightAOTexture(this._program, 'uMetallicRoughnessHeightAOTexture', 2);
        this._program.uniform1f('uAlphaTresshold', material.alphaCutoff);

        materialRenderer.bindColor(this._program, 'diffuse', 'uAlbedo');
        materialRenderer.bindValue(this._program, 'metallic', 'uMetallic');
        materialRenderer.bindValue(this._program, 'roughness', 'uRoughness');
        materialRenderer.bindValue(this._program, 'lightEmission', 'uLightEmission', 0);
    
        this._program.uniform1i('uAOMap', material.ambientOcclussionMap);
        this._program.uniform1i('uMetallicMap', material.metallicChannel);
        this._program.uniform1i('uRoughnessMap', material.roughnessChannel);
        this._program.uniform1i('uLightemissionMap', material.lightEmissionChannel);
    
        this._program.bindVector("uAlbedoScale", material.diffuseScale);
        this._program.bindVector("uNormalScale", material.normalScale);
        this._program.bindVector("uMetallicScale", material.metallicScale);
        this._program.bindVector("uRoughnessScale", material.roughnessScale);
        this._program.bindVector("uLightEmissionScale", material.lightEmissionScale);
        this._program.bindVector("uFresnel", material.fresnel);

        this._program.bindTexture("uIrradianceMap", this.renderer.factory.texture(this.irradianceMap), 3);
        this._program.bindTexture("uSpecularMap", this.renderer.factory.texture(this.specularMap), 4);
        this._program.bindTexture("uEnvMap", this.renderer.factory.texture(this.environmentMap), 5);
        this._program.bindTexture("uBRDFIntegrationMap", this.renderer.factory.texture(this._brdfIntegrationTexture), 6);

        // TODO: Get the ambient intensity from environment
        this._program.uniform1f("uAmbientIntensity", 1.0);

        let shadowLight = null;
        this._lights.forEach((light,i) => {
            if (light._depthTexture) {
                shadowLight = light;
            }
            this._program.uniform1i(`uLightTypes[${i}]`, this._lightTypes[i]);
            this._program.bindVector(`uLightPositions[${i}]`, this._lightPositions[i]);
            this._program.bindVector(`uLightDirections[${i}]`, this._lightDirections[i]);
            this._program.bindVector(`uLightColors[${i}]`, this._lightColors[i].rgb);
            this._program.uniform1f(`uLightIntensities[${i}]`, this._lightIntensities[i]);
            this._program.bindMatrix(`uLightTransforms[${i}]`, this._lightTransforms[i]);
        });

        if (shadowLight) {
            this._program.bindTexture("uShadowMap", this.renderer.factory.texture(shadowLight.depthTexture), 7);
            const projectionViewMatrix = Mat4.Mult(shadowLight.projection, shadowLight.viewMatrix);
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
        ShaderProgram.Delete(this._program);
    }
}