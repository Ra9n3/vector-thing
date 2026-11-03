import type { Material } from '../materials/types';
import { AMBIENT, DIFFUSE, LIGHT, SHININESS, SPEC } from './lighting';

/** sRGB channel values in the range 0..255. */
export interface RGB { r: number; g: number; b: number }
const clamp = (n: number) => Math.max(0, Math.min(255, n));

export function hexToRgb(hex: string): RGB {
  const short = /^#([\da-f]{3})$/i.exec(hex);
  const value = short ? short[1].split('').map((c) => c + c).join('') : hex.replace(/^#/, '');
  if (!/^[\da-f]{6}$/i.test(value)) throw new Error(`Invalid color: ${hex}`);
  const n = parseInt(value, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
export const colorString = ({ r, g, b }: RGB) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
export const rgbToHex = ({ r, g, b }: RGB) => `#${[r, g, b].map((v) => Math.round(clamp(v)).toString(16).padStart(2, '0')).join('')}`;

/** Glow changes the surface itself as well as adding a separate halo. */
export function surfaceMaterial(m: Material): Material {
  if (!m.glow) return m;
  const base = hexToRgb(m.color), glow = hexToRgb(m.glow.color);
  const mix = 0.25 * Math.max(0, Math.min(1, m.glow.strength));
  return { ...m, color: rgbToHex({ r: base.r + (glow.r - base.r) * mix,
    g: base.g + (glow.g - base.g) * mix, b: base.b + (glow.b - base.b) * mix }),
    contrast: m.contrast * (1 - 0.25 * Math.max(0, Math.min(1, m.glow.strength))) };
}

/** Metal presets carry higher contrast in their data. */
export function surfaceContrast(m: Material): number {
  return Math.max(0, m.contrast);
}

export function specularTint(m: Material): RGB {
  const base = hexToRgb(m.color);
  const metal = Math.max(0, Math.min(1, m.metallic));
  return { r: 255 * (1 - metal) + base.r * metal,
    g: 255 * (1 - metal) + base.g * metal, b: 255 * (1 - metal) + base.b * metal };
}

export function shadeColor(material: Material, slopeX: number, slopeY: number): RGB {
  const m = surfaceMaterial(material);
  const base = hexToRgb(m.color);
  const length = Math.hypot(slopeX, slopeY, 1);
  const nx = -slopeX / length, ny = -slopeY / length, nz = 1 / length;
  const diffuse = Math.max(0, nx * LIGHT.x + ny * LIGHT.y + nz * LIGHT.z);
  const factor = (AMBIENT + DIFFUSE * diffuse) / (AMBIENT + DIFFUSE * LIGHT.z);
  const contrast = surfaceContrast(m);
  const adjusted = 1 + contrast * (factor - 1);
  const halfLength = Math.hypot(LIGHT.x, LIGHT.y, LIGHT.z + 1);
  const hx = LIGHT.x / halfLength, hy = LIGHT.y / halfLength, hz = (LIGHT.z + 1) / halfLength;
  const specular = SPEC * m.specular * Math.pow(Math.max(0, nx * hx + ny * hy + nz * hz), SHININESS * m.shininess);
  const tint = specularTint(m);
  return { r: clamp(base.r * adjusted + tint.r * specular),
    g: clamp(base.g * adjusted + tint.g * specular), b: clamp(base.b * adjusted + tint.b * specular) };
}

/** Light a vertical wall using the same normalized diffuse model as the cap. */
export function shadeWall(material: Material, nx: number, ny: number): RGB {
  const m = surfaceMaterial(material), base = hexToRgb(m.color);
  const length = Math.hypot(nx, ny) || 1;
  nx /= length; ny /= length;
  const diffuse = Math.max(0, nx * LIGHT.x + ny * LIGHT.y);
  const factor = (AMBIENT + DIFFUSE * diffuse) / (AMBIENT + DIFFUSE * LIGHT.z);
  const adjusted = 1 + surfaceContrast(m) * (factor - 1);
  const hl = Math.hypot(LIGHT.x, LIGHT.y, LIGHT.z + 1);
  const specular = 0.25 * SPEC * m.specular * Math.pow(Math.max(0, (nx * LIGHT.x + ny * LIGHT.y) / hl), SHININESS * m.shininess);
  const tint = specularTint(m);
  return { r: clamp(base.r * adjusted + tint.r * specular), g: clamp(base.g * adjusted + tint.g * specular), b: clamp(base.b * adjusted + tint.b * specular) };
}
