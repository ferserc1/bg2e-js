import Shader from "../render/Shader";
import { 
    fresnelSchlick,
    distributionGGX,
    geometrySmith,
    pbrPointLight
} from './webgl_shader_lib';
import ShaderFunction from "./ShaderFunction";
import WebGLRenderer from "../render/webgl/Renderer";
import ShaderProgram from "../render/webgl/ShaderProgram";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import { createNormalTexture, normalTexture } from "../tools/TextureResourceDatabase";


export default class BasicPBRLightShader extends Shader {
    constructor(renderer) {
        super(renderer);

        if (!renderer instanceof WebGLRenderer) {
            throw new Error("BasicDiffuseColorShader: invalid renderer");
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
        `,
        [
            new ShaderFunction('void','main','',`{
                fragPos = (uWorld * vec4(inPosition, 1.0)).xyz;
                fragNorm = normalize(uNormMatrix * inNormal);
                fragTangent = normalize(uNormMatrix * inTangent);
                fragBitangent = normalize(fragNorm * fragTangent);
                fragTexCoord = inTexCoord;
                gl_Position = uProj * uView * uWorld * vec4(inPosition,1.0);
            }`)
        ]);

        const fshader = ShaderFunction.GetShaderCode(`precision mediump float;
        varying vec3 fragPos;
        varying vec3 fragNorm;
        varying vec2 fragTexCoord;
        varying vec3 fragTangent;
        varying vec3 fragBitangent;

        uniform vec3 uCameraPos;

        uniform sampler2D uAlbedoTexture;
        uniform sampler2D uNormalTexture;
        uniform sampler2D uMetallicTexture;
        uniform sampler2D uRoughnessTexture;

        uniform vec4 uAlbedo;
        uniform float uMetallic;
        uniform float uRoughness;

        uniform vec2 uAlbedoScale;
        uniform vec2 uNormalScale;
        uniform vec2 uMetallicScale;
        uniform vec2 uRoughnessScale;`,
        [
            //fresnelSchlick,
            //distributionGGX,
            //geometrySmith,
            new ShaderFunction('void','main','',`{
                vec3 N = normalize(fragNorm);
                vec3 T = normalize(fragTangent);
                vec3 B = normalize(fragBitangent);
                mat3 TBN = mat3(T,B,N);

                vec3 albedo = texture2D(uAlbedoTexture, fragTexCoord * uAlbedoScale).rgb * uAlbedo.rgb;
                vec3 normal = texture2D(uNormalTexture, fragTexCoord * uNormalScale).rgb * 2.0 - 1.0;
                float metallic = texture2D(uMetallicTexture, fragTexCoord * uMetallicScale).r * uMetallic;
                float roughness = max(texture2D(uRoughnessTexture, fragTexCoord * uRoughnessScale).r * uRoughness, 0.01);

                N = normalize(TBN * normal);
                vec3 V = normalize(uCameraPos - fragPos);

                //vec3 F0 = vec3(0.04);
                //F0 = mix(F0, albedo, metallic);

                vec3 lightPositions[4];
                lightPositions[0] = vec3( 10.0, 10.0, -10.0);
                lightPositions[1] = vec3(-10.0, 10.0, -10.0);
                lightPositions[2] = vec3(-10.0,-10.0, -10.0);
                lightPositions[3] = vec3( 10.0,-10.0, -10.0);

                vec3 lightColors[4];
                lightColors[0] = vec3(300.0);
                lightColors[1] = vec3(300.0);
                lightColors[2] = vec3(300.0);
                lightColors[3] = vec3(300.0);

                vec3 Lo = vec3(0.0);
                for (int i = 0; i < 4; ++i)
                {
                    Lo += pbrPointLight(
                        lightPositions[i], lightColors[i], fragPos, N, V,
                        albedo, roughness, metallic);
                }

                vec3 ambient = vec3(0.03) * albedo;
                vec3 color = ambient + Lo;
                color = color / (color + vec3(1.0));
                color = pow(color, vec3(1.0/2.2));

                gl_FragColor = vec4(color,1.0);
            }`, [pbrPointLight])
        ]);

        this._program = ShaderProgram.Create(renderer.gl,"PBRBasicLight",vshader,fshader);

        if (!this._checked) {
            this._checked = true;
            if (!this._program.checkInvalidLocations()) {
                console.error("Invalid attrib location names found. This error should produce a lot of WebGL errors. Check that the attribute names match with the attrib location names in your shader.")
            }
        }
    }

    async load() {
        await createNormalTexture(this.renderer);
    }

    set cameraPosition(p) {
        this._cameraPosition = p;
    }

    setup(plistRenderer,materialRenderer,modelMatrix,viewMatrix,projectionMatrix) {
        const material = materialRenderer.material;
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
        materialRenderer.bindTexture(this._program, 'metallic', 'uMetallicTexture', 2);
        materialRenderer.bindTexture(this._program, 'roughness', 'uRoughnessTexture', 3);

        materialRenderer.bindColor(this._program, 'diffuse', 'uAlbedo');
        materialRenderer.bindValue(this._program, 'metallic', 'uMetallic');
        materialRenderer.bindValue(this._program, 'roughness', 'uRoughness');
        
        
        this._program.bindVector("uAlbedoScale", material.diffuseScale);
        this._program.bindVector("uNormalScale", material.normalScale);
        this._program.bindVector("uMetallicScale", material.metallicScale);
        this._program.bindVector("uRoughnessScale", material.roughnessScale);
        
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