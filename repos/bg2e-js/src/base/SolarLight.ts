import Light, { LightType } from './Light';
import Vec from '../math/Vec';

/** Derived runtime values, never written back to authored scene properties. */
export interface SolarState {
    direction: Vec;
    color: Vec;
    intensity: number;
    skyIntensity: number;
    angularRadius: number;
    visibility: number;
    atmosphere: boolean;
}

export function evaluateSolarLight(light: Light, rayDirection: Vec, atmosphere = true): SolarState {
    const length = Math.hypot(...Array.from(rayDirection).slice(0, 3));
    if (light.type !== LightType.SUN || !Number.isFinite(length) || length < 1e-12 ||
        ![...Array.from(light.color).slice(0, 3), light.intensity].every(v => Number.isFinite(v) && v >= 0)) {
        throw new Error('Invalid solar light emission or direction');
    }
    const direction = Vec.Mult(rayDirection, -1 / length);
    const angularRadius = Math.asin(Math.min(0.999999, Math.max(1e-12, light.solarSize * 0.6957 / light.solarDistanceMillionKm)));
    let rayleigh = 0, mie = 0;
    if (atmosphere) {
        const observer = 6360.001, top = 6420, mu = Math.max(direction.y, 0);
        const path = -observer * mu + Math.sqrt(observer * observer * (mu * mu - 1) + top * top);
        const step = path / 64;
        for (let i = 0; i < 64; ++i) {
            const t = (i + 0.5) * step;
            const h = Math.max(Math.sqrt(observer * observer + t * t + 2 * observer * mu * t) - 6360, 0);
            rayleigh += Math.exp(-h / 8) * step;
            mie += Math.exp(-h / 1.2) * step;
        }
    }
    const color = new Vec([0.0058, 0.0136, 0.0331].map((extinction, i) => light.color[i] * Math.exp(-extinction * rayleigh - 0.00444 * mie)));
    const skyIntensity = light.intensity * Math.pow(149.6 / light.solarDistanceMillionKm, 2);
    if (!Number.isFinite(Math.fround(skyIntensity))) throw new Error('Solar intensity exceeds supported range');
    const fraction = Math.max(-1, Math.min(1, Math.asin(Math.max(-1, Math.min(1, direction.y))) / angularRadius));
    const visibility = atmosphere ? (Math.acos(-fraction) + fraction * Math.sqrt(Math.max(1 - fraction * fraction, 0))) / Math.PI : 1;
    return { direction, color, intensity: skyIntensity * visibility, skyIntensity, angularRadius, visibility, atmosphere };
}
