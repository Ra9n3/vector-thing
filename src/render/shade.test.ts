import { describe, expect, it } from 'vitest';
import { insetPath } from '../geometry/insetPath';
import { defaultProfile } from '../profiles/presets';
import { resolveProfile } from '../profiles/sample';
import { acrossStops } from './acrossGradient';
import { aroundHeightmap } from './aroundHeightmap';
import { colorString, hexToRgb, shadeColor } from './shade';
import { resolveMaterial } from '../materials/resolve';

const material = resolveMaterial('speckle-grey');
const base = hexToRgb(material.color);
const brightness = (s: string) => (s.match(/\d+/g) ?? []).map(Number).reduce((a, b) => a + b, 0);

describe('fixed lighting', () => {
  it('keeps a flat surface at its base color', () => {
    const flat = shadeColor(material, 0, 0);
    for (const channel of ['r', 'g', 'b'] as const) expect(Math.abs(flat[channel] - base[channel])).toBeLessThan(255 * 0.03);
  });
  it('lights a top-left facing slope more than the reverse', () => {
    const bright = shadeColor(material, 0.4, 0.4);
    const dark = shadeColor(material, -0.4, -0.4);
    expect(bright.r + bright.g + bright.b).toBeGreaterThan(dark.r + dark.g + dark.b);
  });
});

describe('across gradient', () => {
  it('returns ordered, constant base-color stops for flat', () => {
    const stops = acrossStops(resolveProfile(defaultProfile('flat')), material, 100, 28, 'vertical');
    expect(stops[0].offset).toBe(0);
    expect(stops.at(-1)?.offset).toBe(1);
    stops.forEach((stop, i) => {
      expect(stop.color).toBe(colorString(base));
      if (i) expect(stop.offset).toBeGreaterThanOrEqual(stops[i - 1].offset);
    });
  });
  it('lights the upper dome and lower dip walls', () => {
    for (const preset of ['dome', 'dip'] as const) {
      const stops = acrossStops(resolveProfile(defaultProfile(preset)), material, 100, 28, 'vertical', 101);
      const top = brightness(stops.find((s) => s.offset === 0.25)!.color);
      const bottom = brightness(stops.find((s) => s.offset === 0.75)!.color);
      expect(preset === 'dome' ? top > bottom : bottom > top).toBe(true);
    }
  });
  it('preserves sharp transitions on both mirrored sides', () => {
    const profile = resolveProfile(defaultProfile('raised'));
    const t = profile.points[1].u / 2;
    const stops = acrossStops(profile, material, 100, 28, 'vertical');
    for (const offset of [t, 1 - t]) {
      const duplicates = stops.filter((s) => s.offset === offset);
      expect(duplicates).toHaveLength(2);
      expect(duplicates[0].color).not.toBe(duplicates[1].color);
    }
  });
  it('reverses the lighting for recessed profiles and swaps axes', () => {
    const p = resolveProfile(defaultProfile('raised'));
    const top = (recessed: boolean, axis: 'vertical' | 'horizontal') => acrossStops({ ...p, recessed }, material, 100, 28, axis, 101).find((s) => s.offset === 0.05)!.color;
    expect(brightness(top(false, 'vertical'))).toBeGreaterThan(brightness(top(true, 'vertical')));
    expect(top(false, 'vertical')).toEqual(top(false, 'horizontal'));
  });
});

describe('insets and height maps', () => {
  it('insets circle radius and safely degenerates rectangles', () => {
    expect(insetPath('circle', 100, 100, 12)).toContain('A38 38');
    expect(insetPath('rect', 100, 40, 100)).toBe('M50 20Z');
    for (const type of ['rect', 'rounded', 'circle', 'pill', 'hexagon'] as const) {
      expect(insetPath(type, 100, 40, 100)).not.toMatch(/NaN|Infinity/);
    }
  });
  it('makes monotone dome rings and reverses recessed height', () => {
    const p = resolveProfile(defaultProfile('dome'));
    const map = aroundHeightmap('circle', 160, 160, p);
    expect(map.rings).toHaveLength(40);
    let previous = map.edgeGray;
    for (const ring of map.rings) {
      expect(ring.gray).toBeGreaterThanOrEqual(previous);
      previous = ring.gray;
    }
    const recessed = aroundHeightmap('circle', 160, 160, { ...p, recessed: true });
    expect(recessed.edgeGray).toBeCloseTo(1 - map.edgeGray);
    recessed.rings.forEach((r, i) => expect(r.gray).toBeCloseTo(1 - map.rings[i].gray));
  });
});
