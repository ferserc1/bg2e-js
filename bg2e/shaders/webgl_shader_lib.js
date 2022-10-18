
import ShaderFunction from "./ShaderFunction";

export const fresnelSchlick = new ShaderFunction('vec3', 'fresnelSchlick', 'float cosTheta, vec3 F0', `{
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}`);

export const distributionGGX = new ShaderFunction('float','distributionGGX','vec3 N, vec3 H, float roughness',`{
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;

    float num = a2;
    float denom = NdotH2 * (a2 - 1.0) + 1.0;
    denom = ${ Math.PI } * denom * denom;

    return num / denom;
}`);

export const geometrySchlickGGX = new ShaderFunction('float','geometrySchlickGGX','float NdotV, float roughness',`{
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;

    float num = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return num / denom;
}`)

export const geometrySmith = new ShaderFunction('float','geometrySmith','vec3 N, vec3 V, vec3 L, float roughness', `{
    float NdotV = max(dot(N,V), 0.0);
    float NdotL = max(dot(N,L), 0.0);
    float ggx2 = geometrySchlickGGX(NdotV, roughness);
    float ggx1 = geometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}`, [ geometrySchlickGGX ]);

export const pbrPointLight = new ShaderFunction('vec3','pbrPointLight',
    'vec3 lightPos, vec3 lightColor, vec3 fragPos, vec3 fragNorm, vec3 viewPos, vec3 albedo, float roughness, float metallic',
`{
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);

    vec3 L = normalize(lightPos - fragPos);
    vec3 H = normalize(viewPos + L);

    float distance = length(lightPos - fragPos);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance = lightColor * attenuation;

    vec3 F = fresnelSchlick(max(dot(H, viewPos), 0.0), F0);

    float NDF = distributionGGX(fragNorm, H, roughness);
    float G = geometrySmith(fragNorm, viewPos, L, roughness);

    vec3 numerator = NDF * G * F;
    float denom = 4.0 * max(dot(fragNorm,viewPos), 0.0) * max(dot(fragNorm,L), 0.0) + 0.0001;
    vec3 specular = numerator / denom;

    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;

    kD *= 1.0 - metallic;

    float NdotL = max(dot(fragNorm,L), 0.0);
    return (kD * albedo / ${ Math.PI } + specular) * radiance * NdotL;
}`, [fresnelSchlick, distributionGGX, geometrySmith]);
