import { describe, expect, it } from 'vitest';
import type { ShapeType } from '../geometry/shapePath';
import { defaultProfile, PRESETS, PRESET_BY_ID } from './presets';
import { profileToSamples, resolveMode, resolveProfile, sampleProfile, sampleProfileSlope } from './sample';
import type { ResolvedProfile } from './types';

describe('profile sampling', () => {
  it('samples flat as one everywhere', () => {
    const flat = resolveProfile(defaultProfile('flat'));
    for (const h of profileToSamples(flat, 101)) expect(h).toBe(1);
    expect(sampleProfileSlope(flat, 0.5)).toBe(0);
  });

  it('samples a monotone quarter-circle dome', () => {
    const dome = resolveProfile(defaultProfile('dome'));
    const values = profileToSamples(dome, 501);
    expect(values[0]).toBeCloseTo(0);
    expect(values.at(-1)).toBeCloseTo(1);
    values.slice(1).forEach((h, i) => expect(h).toBeGreaterThanOrEqual(values[i] - 1e-12));
    expect(sampleProfile(dome, 0.5)).toBeCloseTo(Math.sqrt(0.75), 3);
  });

  for (const preset of PRESETS) {
    it(`${preset.id} is finite and bounded for defaults and parameter extremes`, () => {
      const combinations = [defaultProfile(preset.id).params];
      // Test every combination, not just all-zero and all-one.
      for (let mask = 0; mask < 2 ** preset.params.length; mask++) {
        combinations.push(Object.fromEntries(preset.params.map((p, i) => [p.key, (mask >> i) & 1])));
      }
      for (const params of combinations) {
        const p = preset.build(params);
        expect(p.points[0].u).toBe(0);
        expect(p.points[p.points.length - 1].u).toBe(1);
        p.points.slice(1).forEach((point, i) => expect(point.u).toBeGreaterThan(p.points[i].u));
        for (let i = 0; i <= 1000; i++) {
          const h = sampleProfile(p, i / 1000);
          expect(Number.isFinite(h)).toBe(true);
          expect(h).toBeGreaterThanOrEqual(0);
          expect(h).toBeLessThanOrEqual(1);
          expect(Number.isFinite(sampleProfileSlope(p, i / 1000))).toBe(true);
        }
      }
    });
  }

  it('clamps u, and handles empty and single sample requests', () => {
    const p = resolveProfile(defaultProfile('dome'));
    expect(sampleProfile(p, -100)).toBe(sampleProfile(p, 0));
    expect(sampleProfile(p, 100)).toBe(sampleProfile(p, 1));
    expect(profileToSamples(p, 0)).toEqual([]);
    expect(profileToSamples(p, 1)).toEqual([sampleProfile(p, 0)]);
  });

  it('uses PCHIP without overshooting between uneven points', () => {
    const p: ResolvedProfile = { recessed: false, points: [
      { u: 0, h: 0.2 }, { u: 0.1, h: 0.8 }, { u: 0.8, h: 0.9 }, { u: 1, h: 0.3 },
    ] };
    for (let i = 0; i < p.points.length - 1; i++) {
      const a = p.points[i], b = p.points[i + 1];
      for (let j = 0; j <= 100; j++) {
        const h = sampleProfile(p, a.u + (b.u - a.u) * j / 100);
        expect(h).toBeGreaterThanOrEqual(Math.min(a.h, b.h) - 1e-12);
        expect(h).toBeLessThanOrEqual(Math.max(a.h, b.h) + 1e-12);
      }
    }
  });

  it('breaks smoothing at sharp points', () => {
    const p: ResolvedProfile = { recessed: false, points: [
      { u: 0, h: 0 }, { u: 0.5, h: 1, sharp: true }, { u: 1, h: 1 },
    ] };
    expect(sampleProfileSlope(p, 0.5 - 1e-7)).toBeCloseTo(2, 4);
    expect(sampleProfileSlope(p, 0.5)).toBe(0);
  });

  it('resolves and normalizes custom points without mutating them', () => {
    const customPoints = [{ u: 0.8, h: 2 }, { u: 0.2, h: -1 }];
    const p = resolveProfile({ ...defaultProfile('inset'), customPoints });
    expect(p.recessed).toBe(true);
    expect(p.points).toEqual([{ u: 0, h: 0 }, { u: 0.2, h: 0 }, { u: 0.8, h: 1 }, { u: 1, h: 1 }]);
    expect(customPoints[0].h).toBe(2);
  });

  it.each([0, 1])('ribbed count parameter %s produces the correct peaks', (count) => {
    const p = PRESET_BY_ID.ribbed.build({ count, depth: 0.5 });
    const heights = profileToSamples(p, 1201);
    const peaks = heights.slice(1, -1).filter((h, i) => h > heights[i] && h > heights[i + 2]);
    expect(peaks).toHaveLength(count === 0 ? 2 : 6);
  });
});

describe('profile mode', () => {
  it('resolves auto by shape and honors explicit modes', () => {
    const shapes: ShapeType[] = ['rect', 'rounded', 'circle', 'pill', 'hexagon'];
    for (const shape of shapes) {
      const s = defaultProfile('raised');
      expect(resolveMode(s, shape)).toBe(shape === 'rect' ? 'across' : 'around');
      expect(resolveMode({ ...s, mode: 'around' }, shape)).toBe('around');
      expect(resolveMode({ ...s, mode: 'across' }, shape)).toBe('across');
    }
  });
});
