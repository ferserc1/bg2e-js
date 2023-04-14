import Shader from "../render/Shader";
import { pbrPointLight, pbrDirectionalLight, pbrAmbientLight } from './webgl_shader_lib';
import ShaderFunction from "./ShaderFunction";
import ShaderProgram from "../render/webgl/ShaderProgram";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import { LightType } from "../base/Light";
import { createNormalTexture, normalTexture, createBRDFIntegrationTexture } from "../tools/TextureResourceDatabase";

function getShaderProgramForLights(renderer, numLights) {
    if (this._programs[numLights]) {
        return this._programs[numLights];
    }

    const vshader = ShaderFunction.GetShaderCode(`precision mediump float;
        attribute vec3 inPosition;
        attribute vec3 inNormal;
        attribute vec2 inTexCoord;
        attribute vec3 inTangent;

        uniform mat4 uWorld;
        uniform mat4 uView;
        uniform mat4 uProj;
        uniform mat3 uNormMatrix;

        varying vec3 fragPos;
        varying vec3 fragNorm;
        varying vec2 fragTexCoord;
        varying vec3 fragTangent;
        varying vec3 fragBitangent;
        varying vec3 fragLightPositions[${numLights}];

        uniform vec3 uLightPositions[${numLights}];
        uniform mat4 uLightTransforms[${numLights}];
        `,
        [
            new ShaderFunction('void','main','',`{
                fragPos = (uWorld * vec4(inPosition, 1.0)).xyz;
                fragNorm = normalize(uNormMatrix * inNormal);
                fragTangent = normalize(uNormMatrix * inTangent);
                fragBitangent = normalize(fragNorm * fragTangent);
                fragTexCoord = inTexCoord;

                for (int i = 0; i < ${numLights}; ++i)
                {
                    fragLightPositions[i] = (uLightTransforms[i] * vec4(uLightPositions[i], 1.0)).xyz;
                }

                gl_Position = uProj * uView * uWorld * vec4(inPosition,1.0);
            }`)
        ]);

    const fshader = ShaderFunction.GetShaderCode(`precision mediump float;
        varying vec3 fragPos;
        varying vec3 fragNorm;
        varying vec2 fragTexCoord;
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

        uniform vec2 uAlbedoScale;
        uniform vec2 uNormalScale;
        uniform vec2 uMetallicScale;
        uniform vec2 uRoughnessScale;

        uniform float uAlphaTresshold;
        
        uniform int uLightTypes[${numLights}];
        uniform vec3 uLightDirections[${numLights}];
        uniform vec3 uLightColors[${numLights}];
        uniform float uLightIntensities[${numLights}];
        

        uniform samplerCube uEnvMap;
        uniform samplerCube uSpecularMap;
        uniform samplerCube uIrradianceMap;
        uniform sampler2D uBRDFIntegrationMap;
        `,
        [
            new ShaderFunction('void','main','',`{
                vec3 N = normalize(fragNorm);
                vec3 T = normalize(fragTangent);
                vec3 B = normalize(fragBitangent);
                mat3 TBN = mat3(T,B,N);

                vec4 albedoRGBA = texture2D(uAlbedoTexture, fragTexCoord * uAlbedoScale);
                vec3 albedo = albedoRGBA.rgb * uAlbedo.rgb;
                float alpha = albedoRGBA.a * uAlbedo.a;
                vec3 normal = texture2D(uNormalTexture, fragTexCoord * uNormalScale).rgb * 2.0 - 1.0;
                float metallic = texture2D(uMetallicRoughnessHeightAOTexture, fragTexCoord * uMetallicScale).r * uMetallic;
                float roughness = max(texture2D(uMetallicRoughnessHeightAOTexture, fragTexCoord * uRoughnessScale).g * uRoughness, 0.01);

                if (alpha < uAlphaTresshold) {
                    discard;
                }
                else {
                    N = normalize(TBN * normal);
                    vec3 V = normalize(uCameraPos - fragPos);

                    vec3 Lo = vec3(0.0);
                    for (int i = 0; i < ${numLights}; ++i)
                    {
                        if (uLightTypes[i] == ${ LightType.POINT }) {
                            Lo += pbrPointLight(
                                fragLightPositions[i], uLightColors[i] * uLightIntensities[i], fragPos, N, V,
                                albedo, roughness, metallic);
                        }
                        else if (uLightTypes[i] == ${ LightType.DIRECTIONAL }) {
                            Lo += pbrDirectionalLight(
                                -uLightDirections[i], uLightColors[i] * uLightIntensities[i], fragPos, N, V,
                                albedo, roughness, metallic);
                        }
                    }

                    vec3 ambient = pbrAmbientLight(
                        fragPos, N, V, albedo, metallic, roughness, uIrradianceMap, uSpecularMap, uEnvMap, uBRDFIntegrationMap
                    );

                    vec3 color = ambient + Lo;
                    color = color / (color + vec3(1.0));
                    color = pow(color, vec3(1.0/2.2));

                    gl_FragColor = vec4(color,alpha);
                }
            }`, [pbrPointLight, pbrDirectionalLight, pbrAmbientLight])
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
        
        
        this._program.bindVector("uAlbedoScale", material.diffuseScale);
        this._program.bindVector("uNormalScale", material.normalScale);
        this._program.bindVector("uMetallicScale", material.metallicScale);
        this._program.bindVector("uRoughnessScale", material.roughnessScale);

        this._program.bindTexture("uIrradianceMap", this.renderer.factory.texture(this.irradianceMap), 3);
        this._program.bindTexture("uSpecularMap", this.renderer.factory.texture(this.specularMap), 4);
        this._program.bindTexture("uEnvMap", this.renderer.factory.texture(this.environmentMap), 5);
        this._program.bindTexture("uBRDFIntegrationMap", this.renderer.factory.texture(this._brdfIntegrationTexture), 6);


        this._lights.forEach((light,i) => {
            this._program.uniform1i(`uLightTypes[${i}]`, this._lightTypes[i]);
            this._program.bindVector(`uLightPositions[${i}]`, this._lightPositions[i]);
            this._program.bindVector(`uLightDirections[${i}]`, this._lightDirections[i]);
            this._program.bindVector(`uLightColors[${i}]`, this._lightColors[i].rgb);
            this._program.uniform1f(`uLightIntensities[${i}]`, this._lightIntensities[i]);
            this._program.bindMatrix(`uLightTransforms[${i}]`, this._lightTransforms[i]);
        });

        this._program.bindAttribs(plistRenderer, {
            position: "inPosition",
            normal: "inNormal",
            tex0: "inTexCoord",
            tangent: "inTangent"
        });
    }

    destroy() {
        ShaderProgram.Delete(this._program);
    }
}