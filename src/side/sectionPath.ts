import { profileToSamples } from '../profiles/sample';
import type { ResolvedProfile } from '../profiles/types';

const fmt = (value: number) => Number(value.toFixed(4));

/** Signed y fractions, edge to center (negative is above the baseline). */
export function sectionSamples(profile: ResolvedProfile, height: number): number[] {
  const amplitude = 0.15 + 0.25 * Math.max(0, Math.min(1, height));
  return profileToSamples(profile, 128).map((h) => (profile.recessed ? 1 : -1) * amplitude * h);
}

export function sectionSurface(samples: number[], extent: number, full = false): string {
  if (!samples.length) return '';
  const half = samples.length - 1;
  if (half === 0) return `M0 ${fmt(samples[0] * extent)}H${fmt(extent)}`;
  const all = full ? samples : [...samples, ...samples.slice(0, -1).reverse()];
  return all.map((h, i) => `${i ? 'L' : 'M'}${fmt(extent * i / (full ? half : 2 * half))} ${fmt(h * extent)}`).join(' ');
}

export function sectionPathFromSamples(samples: number[], extent: number, full = false): string {
  return `${sectionSurface(samples, extent, full)} L${fmt(extent)} 0 L0 0 Z`;
}

/** Full mirrored section. extent is its display width; scale is the height parameter. */
export function sectionPath(profile: ResolvedProfile, extent: number, scale: number): string {
  return sectionPathFromSamples(sectionSamples(profile, scale), extent);
}
