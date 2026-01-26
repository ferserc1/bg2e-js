// TODO: Deprecated. Use webgl/index.ts instead.

import ShaderFunction from "./ShaderFunction";

export const fresnelSchlick = new ShaderFunction('vec3', 'fresnelSchlick', 'float cosTheta, vec3 F0', `{
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}`);

export const fresnelSchlickRoughness = new ShaderFunction('vec3', 'fresnelSchlickRoughness', 'float cosTheta, vec3 F0, float roughness', `{
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}`);

export const distributionGGX = new ShaderFunction('float', 'distributionGGX', 'vec3 N, vec3 H, float roughness', `{
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;

    float num = a2;
    float denom = NdotH2 * (a2 - 1.0) + 1.0;
    denom = ${Math.PI} * denom * denom;

    return num / denom;
}`);

export const geometrySchlickGGX = new ShaderFunction('float', 'geometrySchlickGGX', 'float NdotV, float roughness', `{
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;

    float num = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return num / denom;
}`)

export const geometrySmith = new ShaderFunction('float', 'geometrySmith', 'vec3 N, vec3 V, vec3 L, float roughness', `{
    float NdotV = max(dot(N,V), 0.0);
    float NdotL = max(dot(N,L), 0.0);
    float ggx2 = geometrySchlickGGX(NdotV, roughness);
    float ggx1 = geometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}`, [geometrySchlickGGX]);

export const pbrPointLight = new ShaderFunction('vec3', 'pbrPointLight',
    'vec3 lightPos, vec3 lightColor, vec3 fragPos, vec3 fragNorm, vec3 viewPos, vec3 albedo, float roughness, float metallic, vec3 fresnel',
    `{
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);

    vec3 L = normalize(lightPos - fragPos);
    vec3 H = normalize(viewPos + L);

    float distance = length(lightPos - fragPos);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance = lightColor * attenuation;

    vec3 F = fresnelSchlick(max(dot(H, viewPos), 0.0), F0) * fresnel;

    float NDF = distributionGGX(fragNorm, H, roughness);
    float G = geometrySmith(fragNorm, viewPos, L, roughness);

    vec3 numerator = NDF * G * F;
    float denom = 4.0 * max(dot(fragNorm,viewPos), 0.0) * max(dot(fragNorm,L), 0.0) + 0.0001;
    vec3 specular = numerator / denom;

    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;

    kD *= 1.0 - metallic;

    float NdotL = max(dot(fragNorm,L), 0.0);
    return (kD * albedo / ${Math.PI} + specular) * radiance * NdotL;
}`, [fresnelSchlick, distributionGGX, geometrySmith]);

export const pbrDirectionalLight = new ShaderFunction('vec3', 'pbrDirectionalLight',
    'vec3 lightDir, vec3 lightColor, vec3 fragPos, vec3 fragNorm, vec3 viewPos, vec3 albedo, float roughness, float metallic, vec3 fresnel, vec3 shadowColor',
    `{
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);

    vec3 L = normalize(lightDir);
    vec3 H = normalize(viewPos + L);

    vec3 F = fresnelSchlickRoughness(max(dot(H, viewPos), 0.0), F0, roughness);

    float NDF = distributionGGX(fragNorm, H, roughness);
    float G = geometrySmith(fragNorm, viewPos, L, roughness);

    vec3 numerator = NDF * G * F;
    float denom = 4.0 * max(dot(fragNorm,viewPos), 0.4) * max(dot(fragNorm,L), 0.4);
    vec3 specular = numerator / max(denom, 0.0001);

    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;

    kD *= 1.0 - metallic;

    float NdotL = max(dot(fragNorm,L), 0.0);
    return (kD * albedo / ${Math.PI} + specular * fresnel * shadowColor) * lightColor * shadowColor * NdotL;
}`, [fresnelSchlick, distributionGGX, geometrySmith, fresnelSchlickRoughness]);

export const getPrefilteredColor = new ShaderFunction('vec3', 'getPrefilteredColor', 'float roughness, vec3 refVec, samplerCube irrMap, samplerCube specMap, samplerCube envMap',
    `{
    vec3 specMap0 = textureCube(envMap, refVec).rgb;
    vec3 specMap1 = textureCube(specMap, refVec).rgb;
    vec3 specMap2 = textureCube(irrMap, refVec).rgb;

    if (roughness<0.7) {
        return mix(specMap0, specMap1, (log(roughness) + 5.0) / 5.0);
    }
    else {
        return mix(specMap1, specMap2, roughness);
    }
}`);

export const pbrAmbientLight = new ShaderFunction('vec3', 'pbrAmbientLight', 'vec3 fragPos, vec3 N, vec3 V, vec3 albedo, float metallic, float roughness, samplerCube irradianceMap, samplerCube specularMap, samplerCube envMap, sampler2D brdfMap, vec3 fresnel, vec3 shadowColor',
    `{
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);
    vec3 kS = fresnelSchlickRoughness(max(dot(N,V), 0.0), F0, roughness) * fresnel;
    vec3 kD = 1.0 - kS;
    vec3 irradiance = textureCube(irradianceMap, N).rgb;
    vec3 diffuse = irradiance * albedo;

    vec3 R = reflect(-V, N);
    vec3 prefilteredColor = getPrefilteredColor(roughness, R, irradianceMap, specularMap, envMap);
    float NdotV = min(max(dot(N,V), 0.0),  0.95);
    vec2 brdfUV = vec2(NdotV, clamp(roughness, 0.01, 0.94));
    vec2 envBRDF = texture2D(brdfMap, brdfUV).xy;
    vec3 indirectSpecular = prefilteredColor * (kS * envBRDF.x + envBRDF.y);

    return kD * diffuse + indirectSpecular;
}`, [fresnelSchlickRoughness, getPrefilteredColor]);

export const applyConvolution = new ShaderFunction('vec4', 'applyConvolution', 'sampler2D texture, vec2 texCoord, vec2 texSize, float[9] convMatrix, float radius',
    `
{
    vec2 onePixel = vec2(1.0,1.0) / texSize * radius;
    vec4 colorSum = 
        texture2D(texture, texCoord + onePixel * vec2(-1, -1)) * convMatrix[0] +
        texture2D(texture, texCoord + onePixel * vec2( 0, -1)) * convMatrix[1] +
        texture2D(texture, texCoord + onePixel * vec2( 1, -1)) * convMatrix[2] +
        texture2D(texture, texCoord + onePixel * vec2(-1,  0)) * convMatrix[3] +
        texture2D(texture, texCoord + onePixel * vec2( 0,  0)) * convMatrix[4] +
        texture2D(texture, texCoord + onePixel * vec2( 1,  0)) * convMatrix[5] +
        texture2D(texture, texCoord + onePixel * vec2(-1,  1)) * convMatrix[6] +
        texture2D(texture, texCoord + onePixel * vec2( 0,  1)) * convMatrix[7] +
        texture2D(texture, texCoord + onePixel * vec2( 1,  1)) * convMatrix[8];
    float kernelWeight =
        convMatrix[0] +
        convMatrix[1] +
        convMatrix[2] +
        convMatrix[3] +
        convMatrix[4] +
        convMatrix[5] +
        convMatrix[6] +
        convMatrix[7] +
        convMatrix[8];
    if (kernelWeight <= 0.0) {
        kernelWeight = 1.0;
    }
    return vec4((colorSum / kernelWeight).rgb, 1.0);
}
`, []);

export const getShadowColor = new ShaderFunction('vec3', 'getShadowColor', 'vec4 positionFromLightPov, sampler2D shadowMap, float shadowBias, float shadowStrength',
`
{
    // The vertex location rendered from the light source is almost in
    // normalized device coordinates (NDC), but the perspective division
    // has not been performed yet. We need to divide by w to get the
    // vertex location in range [-1, +1]
    vec3 shadowCoord = positionFromLightPov.xyz / positionFromLightPov.w;

    // Convert from NDC to texture coordinates
    shadowCoord = shadowCoord * 0.5 + 0.5;
    
    if (shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 &&
        shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0)
    {
        float shadowDepth = texture2D(shadowMap, shadowCoord.xy).r;
        if (shadowCoord.z > shadowDepth + shadowBias) {
            return vec3(1.0 - shadowStrength);
        }
    }
    return vec3(1.0);
}
`, []);

export const lineal2SRGB = new ShaderFunction('vec4', 'lineal2SRGB', 'vec4 color, float gamma', `{
    color.rgb = color.rgb / (color.rgb + vec3(1.0));
    return pow(color, vec4(1.0 / gamma));
}
`, []);

export const SRGB2Lineal = new ShaderFunction('vec4', 'SRGB2Lineal', 'vec4 color, float gamma', `{
    return pow(color, vec4(gamma));
}
`, []);

export const brightnessContrast = new ShaderFunction('vec4', 'brightnessContrast', 'vec4 color, float brightness, float contrast', `{
    mat4 brightnessMat = mat4(1, 0, 0, 0,
                              0, 1, 0, 0,
                              0, 0, 1, 0,
                              brightness, brightness, brightness, 1);
    float t = (1.0 - contrast) / 2.0;
    mat4 contrastMat = mat4(contrast, 0, 0, 0,
                            0, contrast, 0, 0,
                            0, 0, contrast, 0,
                            t, t, t, 1);
    return contrastMat * brightnessMat * color;
}`, []);
