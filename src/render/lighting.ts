export const LIGHT_AZIMUTH = 225;
export const LIGHT_ELEVATION = 50;
export const AMBIENT = 0.45;
export const DIFFUSE = 0.7;
export const SPEC = 0.35;
export const SHININESS = 48;

export const heightPx = (w: number, h: number) => Math.max(4, Math.min(64, 0.28 * Math.min(w, h)));

const azimuth = LIGHT_AZIMUTH * Math.PI / 180;
const elevation = LIGHT_ELEVATION * Math.PI / 180;
export const LIGHT = {
  x: Math.cos(elevation) * Math.cos(azimuth),
  y: Math.cos(elevation) * Math.sin(azimuth),
  z: Math.sin(elevation),
};

/** Missing height is treated as the pre-height default for older elements. */
export function effectiveHeight(w: number, h: number, height = 0.5): number {
  return heightPx(w, h) * (0.5 + Math.max(0, Math.min(1, Number.isFinite(height) ? height : 0.5)));
}
