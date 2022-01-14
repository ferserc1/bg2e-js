
const MaterialFlag = {
    DIFFUSE							: 1 << 0,
    SPECULAR						: 1 << 1,
    SHININESS						: 1 << 2,
    LIGHT_EMISSION					: 1 << 3,
    REFRACTION_AMOUNT				: 1 << 4,
    REFLECTION_AMOUNT				: 1 << 5,
    TEXTURE							: 1 << 6,
    LIGHT_MAP						: 1 << 7,
    NORMAL_MAP						: 1 << 8,
    TEXTURE_OFFSET					: 1 << 9,
    TEXTURE_SCALE					: 1 << 10,
    LIGHT_MAP_OFFSET				: 1 << 11,
    LIGHT_MAP_SCALE					: 1 << 12,
    NORMAL_MAP_OFFSET				: 1 << 13,
    NORMAL_MAP_SCALE				: 1 << 14,
    CAST_SHADOWS					: 1 << 15,
    RECEIVE_SHADOWS					: 1 << 16,
    ALPHA_CUTOFF					: 1 << 17,
    SHININESS_MASK					: 1 << 18,
    SHININESS_MASK_CHANNEL			: 1 << 19,
    SHININESS_MASK_INVERT			: 1 << 20,
    LIGHT_EMISSION_MASK				: 1 << 21,
    LIGHT_EMISSION_MASK_CHANNEL		: 1 << 22,
    LIGHT_EMISSION_MASK_INVERT		: 1 << 23,
    REFLECTION_MASK					: 1 << 24,
    REFLECTION_MASK_CHANNEL			: 1 << 25,
    REFLECTION_MASK_INVERT			: 1 << 26,
    CULL_FACE						: 1 << 27,
    ROUGHNESS						: 1 << 28,	// All the roughness attributes are controlled by this flag
    UNLIT							: 1 << 29
};

export default MaterialFlag;
