#ifndef COLOR_CORRECTION_GLSL
#define COLOR_CORRECTION_GLSL

// Convert lineal color to SRGB for shader output
vec4 lineal2SRGB(vec4 color, float gamma)
{
    // Alpha is coverage, not radiance. Tone mapping it makes opaque objects translucent.
    vec3 mapped = max(color.rgb, vec3(0.0));
    mapped = mapped / (mapped + vec3(1.0));
    return vec4(pow(mapped, vec3(1.0 / gamma)), color.a);
}

vec3 lineal2SRGB(vec3 color, float gamma)
{
    color = color / (color + vec3(1.0));
    return pow(color.rgb, vec3(1.0 / gamma));
}

// Native drawColorCorrection convention: exposure 1, exponential tone mapping, then gamma.
// Keep coverage independent of RGB throughout the display conversion.
vec4 pbrDisplayColor(vec4 color, float gamma)
{
    vec3 mapped = vec3(1.0) - exp(-max(color.rgb, vec3(0.0)));
    return vec4(pow(mapped, vec3(1.0 / max(gamma, 0.0001))), color.a);
}

// Convert SRGB textures to lineal color
vec4 SRGB2Lineal(vec4 color, float gamma)
{
    return vec4(pow(color.rgb, vec3(gamma)), color.a);
}

vec3 SRGB2lLineal(vec3 color, float gamma)
{
    return pow(color, vec3(gamma));
}

vec4 brightnessContrast(vec4 color, float brightness, float contrast)
{
    mat4 brightnessMat = mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        brightness, brightness, brightness, 1.0
    );
    float t = (1.0 - contrast) / 2.0;
    mat4 contrastMat = mat4(
        contrast, 0.0, 0.0, 0.0,
        0.0, contrast, 0.0, 0.0,
        0.0, 0.0, contrast, 0.0,
        t, t, t, 1.0
    );
    return contrastMat * brightnessMat * color;
}

#endif // COLOR_CORRECTION_GLSL

