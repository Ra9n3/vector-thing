import { describe, expect, it } from 'vitest';
import { MATERIALS, resolveMaterial } from '../materials/resolve';
import { filterParams } from './filterParams';
import { LIGHT } from './lighting';
import { hexToRgb, shadeColor, specularTint, surfaceMaterial } from './shade';

const brightness = (v: { r: number; g: number; b: number }) => v.r + v.g + v.b;

describe('material lighting', () => {
  it('keeps flat shading within 3% for every material', () => {
    for (const m of MATERIALS) {
      const base = hexToRgb(m.color), flat = shadeColor(m, 0, 0);
      for (const c of ['r', 'g', 'b'] as const) expect(Math.abs(flat[c] - base[c])).toBeLessThan(255 * 0.03);
    }
  });
  it('increases the lit-shadow gap with contrast', () => {
    const m = { ...resolveMaterial('plastic-blue'), specular: 0 };
    const gap = (contrast: number) => brightness(shadeColor({ ...m, contrast }, 0.5, 0.5)) - brightness(shadeColor({ ...m, contrast }, -0.5, -0.5));
    expect(gap(1.5)).toBeGreaterThan(gap(0.6));
  });
  it('tints metallic highlights toward the base and leaves plastic nearly white', () => {
    const gold = specularTint(resolveMaterial('metal-gold'));
    const plastic = specularTint(resolveMaterial('plastic-red'));
    expect(gold.r).toBeGreaterThan(gold.g);
    expect(gold.g).toBeGreaterThan(gold.b);
    expect(plastic).toEqual({ r: 255, g: 255, b: 255 });
  });
  it('matches the material shading equation for a sample slope', () => {
    const slopeX = -0.23, slopeY = 0.36;
    const len = Math.hypot(slopeX, slopeY, 1);
    const n = { x: -slopeX / len, y: -slopeY / len, z: 1 / len };
    const dot = Math.max(0, n.x * LIGHT.x + n.y * LIGHT.y + n.z * LIGHT.z);
    const hLen = Math.hypot(LIGHT.x, LIGHT.y, 1 + LIGHT.z);
    const halfDot = Math.max(0, (n.x * LIGHT.x + n.y * LIGHT.y + n.z * (1 + LIGHT.z)) / hLen);
    for (const material of MATERIALS) {
      const p = filterParams(material), base = hexToRgb(surfaceMaterial(material).color);
      const tint = specularTint(surfaceMaterial(material));
      const shade = shadeColor(material, slopeX, slopeY);
      for (const c of ['r', 'g', 'b'] as const) {
        const expected = Math.max(0, Math.min(255, base[c] * (p.ambientConstant + p.diffuseConstant * dot)
          + tint[c] * p.specularConstant * halfDot ** p.specularExponent));
        expect(Math.abs(shade[c] - expected)).toBeLessThan(255 * 0.03);
      }
    }
  });
});
