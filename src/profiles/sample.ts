import type { ShapeType } from '../geometry/shapePath';
import { PRESET_BY_ID } from './presets';
import { customLookup } from './custom';
import type { ProfilePoint, ProfileSettings, ResolvedProfile } from './types';

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** Normalize custom input without mutating the saved settings. */
function normalizePoints(input: ProfilePoint[]): ProfilePoint[] {
  const points = input
    .filter((p) => Number.isFinite(p.u) && Number.isFinite(p.h))
    .map((p) => ({ ...p, u: clamp(p.u), h: clamp(p.h) }))
    .sort((a, b) => a.u - b.u);
  const unique = points.filter((p, i) => i === points.length - 1 || p.u !== points[i + 1].u);
  if (!unique.length) return [{ u: 0, h: 1 }, { u: 1, h: 1 }];
  if (unique[0].u > 0) unique.unshift({ u: 0, h: unique[0].h });
  if (unique[unique.length - 1].u < 1) unique.push({ u: 1, h: unique[unique.length - 1].h });
  return unique;
}

export function resolveProfile(s: ProfileSettings): ResolvedProfile {
  if (s.kind === 'custom' && s.custom) {
    const lookup=customLookup(s.custom,'around');
    return {points:lookup.map((h,i)=>({u:i/63,h})),recessed:false,lookup,customMirror:s.custom.mirror !== false};
  }
  const result = PRESET_BY_ID[s.preset].build(s.params);
  return s.customPoints ? { ...result, points: normalizePoints(s.customPoints) } : result;
}

export function resolveMode(s: ProfileSettings, shape: ShapeType): 'around' | 'across' {
  return s.mode === 'auto' ? (shape === 'rect' ? 'across' : 'around') : s.mode;
}

// Fritsch-Carlson/PCHIP derivatives. Sharp knots have separate one-sided
// tangents, so neither neighboring segment smooths across the corner.
function endpoint(h0: number, h1: number, d0: number, d1: number): number {
  let m = ((2 * h0 + h1) * d0 - h0 * d1) / (h0 + h1);
  if (Math.sign(m) !== Math.sign(d0)) m = 0;
  else if (Math.sign(d0) !== Math.sign(d1) && Math.abs(m) > 3 * Math.abs(d0)) m = 3 * d0;
  return m;
}

/** Precompute the PCHIP coefficients for repeated sampling of one profile. */
export function prepareProfile(p: ResolvedProfile) {
  if (p.lookup?.length === 64) {
    const lookup=p.lookup;
    return (u:number):{value:number;slope:number}=>{
      const x=clamp(Number.isNaN(u)?0:u)*63,i=Math.min(62,Math.floor(x)),t=x-i;
      return {value:lookup[i]+(lookup[i+1]-lookup[i])*t,slope:(lookup[i+1]-lookup[i])*63};
    };
  }
  const points = p.points;
  const widths = points.slice(0, -1).map((point, j) => points[j + 1].u - point.u);
  const deltas = widths.map((width, j) => (points[j + 1].h - points[j].h) / width);
  const tangent = (j: number, segment: number): number => {
    if (points[j].sharp || points.length === 2) return deltas[segment];
    if (j === 0) return endpoint(widths[0], widths[1], deltas[0], deltas[1]);
    if (j === points.length - 1) {
      const k = widths.length - 1;
      return endpoint(widths[k], widths[k - 1], deltas[k], deltas[k - 1]);
    }
    const a = deltas[j - 1], b = deltas[j];
    if (a === 0 || b === 0 || Math.sign(a) !== Math.sign(b)) return 0;
    const w1 = 2 * widths[j] + widths[j - 1];
    const w2 = widths[j] + 2 * widths[j - 1];
    return (w1 + w2) / (w1 / a + w2 / b);
  };
  const tangents = widths.map((_, i) => [tangent(i, i), tangent(i + 1, i)]);
  return (u: number): { value: number; slope: number } => {
    const x = Number.isNaN(u) ? 0 : clamp(u);
    if (points.length === 0) return { value: 0, slope: 0 };
    if (points.length === 1) return { value: clamp(points[0].h), slope: 0 };
    let i = 0;
    while (i < points.length - 2 && x >= points[i + 1].u) i++;
    const width = widths[i];
    const t = clamp((x - points[i].u) / width);
    const y0 = points[i].h, y1 = points[i + 1].h;
    const [m0, m1] = tangents[i];
    const value = (2 * t ** 3 - 3 * t ** 2 + 1) * y0 + (t ** 3 - 2 * t ** 2 + t) * width * m0
      + (-2 * t ** 3 + 3 * t ** 2) * y1 + (t ** 3 - t ** 2) * width * m1;
    const slope = ((6 * t ** 2 - 6 * t) * y0 + (3 * t ** 2 - 4 * t + 1) * width * m0
      + (-6 * t ** 2 + 6 * t) * y1 + (3 * t ** 2 - 2 * t) * width * m1) / width;
    return { value: clamp(value), slope };
  };
}

export function sampleProfile(p: ResolvedProfile, u: number): number {
  return prepareProfile(p)(u).value;
}

/** At a sharp knot, returns the right-hand derivative (left-hand at u=1). */
export function sampleProfileSlope(p: ResolvedProfile, u: number): number {
  return prepareProfile(p)(u).slope;
}

export function profileToSamples(p: ResolvedProfile, n: number): number[] {
  const count = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  const sample = prepareProfile(p);
  return Array.from({ length: count }, (_, i) => sample(count === 1 ? 0 : i / (count - 1)).value);
}
