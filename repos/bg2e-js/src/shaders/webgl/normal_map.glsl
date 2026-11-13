mat3 TBNMatrix(mat4 model, mat3 normalMatrix, vec3 normal, vec4 tangent)
{
    vec3 N = normalize(normalMatrix * normal);
    vec3 T = mat3(model) * tangent.xyz;
    T = normalize(T - N * dot(N, T));
    float orientation = dot(cross(model[0].xyz, model[1].xyz), model[2].xyz) < 0.0 ? -1.0 : 1.0;
    vec3 B = cross(N, T) * tangent.w * orientation;
    return mat3(T, B, N);
}
