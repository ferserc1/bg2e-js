/** Shared format preference, independent of scene/component initialization. */
export const DrawableFormat = { LEGACY: 'vwglb', BG2: 'bg2' } as const;
export type DrawableFormatValue = typeof DrawableFormat[keyof typeof DrawableFormat];
let preferred: DrawableFormatValue = DrawableFormat.BG2;
export function preferredDrawableFormat(): DrawableFormatValue { return preferred; }
export function setPreferredDrawableFormat(value: DrawableFormatValue): void { preferred = value; }
