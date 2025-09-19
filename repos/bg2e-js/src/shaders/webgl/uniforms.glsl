
vec4 sampleAlbedo(sampler2D tex, vec2 uv0, vec2 uv1, PBRMaterialData mat, float gamma)
{
    vec2 uv[2] = { uv0, uv1 };
    return SRGB2Lineal(texture(tex, uv[mat.albedoUVSet] * mat.albedoScale), gamma) * mat.albedo;
}

float sampleMetallic(sampler2D tex, vec2 uv0, vec2 uv1, PBRMaterialData mat)
{
    vec2 uv[2] = { uv0, uv1 };
    return texture(tex, uv[mat.metalnessUVSet] * mat.metalnessScale).r * mat.metalness;
}

float sampleRoughness(sampler2D tex, vec2 uv0, vec2 uv1, PBRMaterialData mat)
{
    const float minRoughness = 0.05; // Minimum roughness value: even a mirror have some roughness
    vec2 uv[2] = { uv0, uv1 };
    return max(texture(tex, uv[mat.roughnessUVSet] * mat.roughnessScale).r  * mat.roughness, minRoughness);
}

vec3 sampleNormal(sampler2D tex, vec2 uv0, vec2 uv1, PBRMaterialData mat, mat3 TBN)
{
    vec2 uv[2] = { uv0, uv1 };
    vec3 normal = texture(tex, uv[mat.normalUVSet]).xyz * 2.0 - 1.0;
    return normalize(TBN * normal);
}

float sampleAmbientOcclussion(sampler2D tex, vec2 uv0, vec2 uv1, PBRMaterialData mat)
{
    vec2 uv[2] = { uv0, uv1 };
    return texture(tex, uv[mat.aoUVSet]).r;
}

vec3 calcF0(vec3 albedo, PBRMaterialData mat)
{
    return mix(vec3(0.04), albedo, mat.metalness);
}
