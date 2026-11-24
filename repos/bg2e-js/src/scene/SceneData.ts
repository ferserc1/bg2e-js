export function isJsonObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isTransformMatrix(value: unknown): value is number[] {
    return Array.isArray(value) && value.length === 16 && Array.from(value).every(Number.isFinite);
}

export function isSubmeshMatrix(value: unknown): value is number[] {
    if (!isTransformMatrix(value) || value[3] !== 0 || value[7] !== 0 || value[11] !== 0 || value[15] !== 1) {
        return false;
    }

    const [a, d, g, , b, e, h, , c, f, i] = value;
    const determinant = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    return Number.isFinite(determinant) && Math.abs(determinant) >= 1e-12;
}
