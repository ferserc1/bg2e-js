import Texture, { TextureFilter, TextureWrap } from "./Texture";

type SamplerSettings = {
    mag?: 0 | 1;
    min?: 0 | 1;
    u?: 0 | 1 | 2 | 3;
    v?: 0 | 1 | 2 | 3;
    w?: 0 | 1 | 2 | 3;
    color?: 1 | 2;
    mipmaps?: boolean;
    minLod?: number;
    maxLod?: number;
    bias?: number;
};

export const finiteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
export const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
export const integerBetween = (value: unknown, min: number, max: number): value is number =>
    finiteNumber(value) && Number.isInteger(value) && value >= min && value <= max;

export function isMaterialRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readField<T>(data: Record<string, unknown>, key: string, validate: (value: unknown) => value is T, prefix = ""): T | undefined {
    const value = data[key];
    if (value === undefined) return undefined;
    if (validate(value)) return value;
    console.warn(`Ignoring invalid material field "${prefix}${key}"`);
    return undefined;
}

type EnumValue = 0 | 1 | 2 | 3;

export function readTextureSettings(data: Record<string, unknown>, key: string): SamplerSettings | undefined {
    const settings = readField(data, key, isMaterialRecord);
    if (!settings) return undefined;

    const read = <T>(field: string, validate: (value: unknown) => value is T) =>
        readField(settings, field, validate, key + ".");
    const filter = (value: unknown): value is 0 | 1 => integerBetween(value, 0, 1);
    const wrap = (value: unknown): value is EnumValue => integerBetween(value, 0, 3);
    const color = (value: unknown): value is 1 | 2 => integerBetween(value, 1, 2);
    const values: SamplerSettings = {};
    const fields = {
        mag: read("mag", filter), min: read("min", filter),
        u: read("u", wrap), v: read("v", wrap), w: read("w", wrap),
        color: read("color", color), mipmaps: read("mipmaps", isBoolean),
        minLod: read("minLod", finiteNumber), maxLod: read("maxLod", finiteNumber), bias: read("bias", finiteNumber)
    };
    Object.assign(values, Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined)));
    return values;
}

const wraps = [TextureWrap.REPEAT, TextureWrap.MIRRORED_REPEAT, TextureWrap.CLAMP, TextureWrap.CLAMP];

export function applyTextureSettings(texture: Texture, settings: SamplerSettings, forceLinear = false): void {
    if (settings.mag !== undefined) texture.magFilter = settings.mag === 1 ? TextureFilter.NEAREST : TextureFilter.LINEAR;
    if (settings.u !== undefined) texture.wrapModeX = wraps[settings.u];
    if (settings.v !== undefined) texture.wrapModeY = wraps[settings.v];
    if (settings.color !== undefined || forceLinear) texture.linearData = forceLinear || settings.color === 2;

    if (settings.min !== undefined || settings.mipmaps !== undefined) {
        const mipmaps = settings.mipmaps ?? texture.mipmapRequired;
        const nearest = settings.min !== undefined ? settings.min === 1 :
            texture.minFilter === TextureFilter.NEAREST ||
            texture.minFilter === TextureFilter.NEAREST_MIPMAP_NEAREST ||
            texture.minFilter === TextureFilter.NEAREST_MIPMAP_LINEAR;
        texture.minFilter = mipmaps
            ? (nearest ? TextureFilter.NEAREST_MIPMAP_NEAREST : TextureFilter.LINEAR_MIPMAP_LINEAR)
            : (nearest ? TextureFilter.NEAREST : TextureFilter.LINEAR);
    }
}
