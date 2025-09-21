
struct PBRMaterialData
{
    vec4 albedo;

    vec2 albedoScale;
    vec2 normalScale;
    vec2 metalnessScale;
    vec2 roughnessScale;
    vec2 lightEmissionScale;

    float metalness;
    float roughness;
    float lightEmission;

    int albedoUVSet;
    int normalUVSet;
    int metalnessUVSet;
    int roughnessUVSet;
    int lightEmissionUVSet;
    int aoUVSet;
};

struct Light
{
    vec3 position;
    float intensity;
    vec4 color;
    vec3 direction;
    int type;
};

vec4 sampleAlbedo(sampler2D tex, vec2 uv0, vec2 uv1, PBRMaterialData mat, float gamma)
{
    vec2 uv = mat.albedoUVSet == 0 ? uv0 : uv1;
    vec4 texColor = texture2D(tex, uv * mat.albedoScale);
    return vec4(SRGB2Lineal(texColor, gamma).rgb * mat.albedo.rgb, texColor.a * mat.albedo.a);
}

float sampleMetallic(sampler2D tex, vec2 uv0, vec2 uv1, PBRMaterialData mat)
{
    vec2 uv = mat.metalnessUVSet == 0 ? uv0 : uv1;
    return texture2D(tex, uv * mat.metalnessScale).r * mat.metalness;
}

float sampleRoughness(sampler2D tex, vec2 uv0, vec2 uv1, PBRMaterialData mat)
{
    const float minRoughness = 0.05; // Minimum roughness value: even a mirror have some roughness
    const float maxRoughness = 0.98; // Maximum roughness value: avoid completely diffuse surfaces
    vec2 uv = mat.roughnessUVSet == 0 ? uv0 : uv1;
    return min(max(texture2D(tex, uv * mat.roughnessScale).g  * mat.roughness, minRoughness), maxRoughness);
}


float sampleLightEmission(sampler2D tex, vec2 uv0, vec2 uv1, PBRMaterialData mat)
{
    vec2 uv = mat.lightEmissionUVSet == 0 ? uv0 : uv1;
    return texture2D(tex, uv * mat.lightEmissionScale).b  * mat.lightEmission;
}

vec3 sampleNormal(sampler2D tex, vec2 uv0, vec2 uv1, PBRMaterialData mat, mat3 TBN)
{
    vec2 uv = mat.normalUVSet == 0 ? uv0 : uv1;
    vec3 normal = texture2D(tex, uv).xyz * 2.0 - 1.0;
    return normalize(TBN * normal);
}

float sampleAmbientOcclussion(sampler2D tex, vec2 uv0, vec2 uv1, PBRMaterialData mat)
{
    vec2 uv = mat.aoUVSet == 0 ? uv0 : uv1;
    return texture2D(tex, uv).a;
}

vec3 calcF0(vec3 albedo, PBRMaterialData mat)
{
    return mix(vec3(0.04), albedo, mat.metalness);
}
