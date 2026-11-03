import { prepareProfile } from '../profiles/sample';
import type { ResolvedProfile } from '../profiles/types';
import { colorString, hexToRgb, shadeColor, surfaceMaterial } from './shade';
import type { Material } from '../materials/types';

export type AcrossAxis = 'vertical' | 'horizontal';
export interface GradientStop { offset: number; color: string }

export function acrossStops(profile: ResolvedProfile, material: Material, lengthPx: number, heightPx: number, axis: AcrossAxis, n = 96): GradientStop[] {
  const count = Number.isFinite(n) ? Math.max(2, Math.floor(n)) : 96;
  const length = Math.max(Number.EPSILON, lengthPx);
  const sample = prepareProfile(profile);
  const base = hexToRgb(surfaceMaterial(material).color);
  const z = (t: number) => (profile.recessed ? -1 : 1) * heightPx * sample(profile.lookup ? (profile.customMirror ? 2*Math.min(Math.max(0,t),Math.max(0,1-t)) : Math.max(0,Math.min(1,t))) : 1 - Math.abs(2 * Math.max(0, Math.min(1, t)) - 1)).value;
  const eps = 1e-6;
  const colorAt = (t: number, side: -1 | 0 | 1 = 0) => {
    // Sample entirely on one side of a corner when creating a hard stop.
    const a = side < 0 ? t - 2 * eps : side > 0 ? t + eps : t - eps;
    const b = side < 0 ? t - eps : side > 0 ? t + 2 * eps : t + eps;
    const lo = Math.max(0, a), hi = Math.min(1, b);
    const slope = hi > lo ? (z(hi) - z(lo)) / ((hi - lo) * length) : 0;
    // A flat section is exactly the swatch color, including for Flat.
    return colorString(Math.abs(slope) < 1e-10 ? base : shadeColor(material, axis === 'horizontal' ? slope : 0, axis === 'vertical' ? slope : 0));
  };
  const breaks = profile.points.filter((p) => p.sharp && p.u > 0 && p.u < 1)
    .flatMap((p) => [p.u / 2, 1 - p.u / 2]);
  // A nonzero center tangent also creates a corner when the half-profile is mirrored.
  if ((!profile.lookup || profile.customMirror) && Math.abs(z(0.5) - z(0.5 - eps)) > eps * heightPx * 1e-4) breaks.push(0.5);
  const uniqueBreaks = [...new Set(breaks)].sort((a, b) => a - b);
  const stops: GradientStop[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    if (!uniqueBreaks.some((b) => Math.abs(b - t) < 1e-10)) stops.push({ offset: t, color: colorAt(t) });
  }
  for (const t of uniqueBreaks) {
    stops.push({ offset: t, color: colorAt(t, -1) }, { offset: t, color: colorAt(t, 1) });
  }
  return stops.sort((a, b) => a.offset - b.offset);
}
