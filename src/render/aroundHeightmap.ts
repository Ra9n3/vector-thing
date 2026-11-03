import { insetPath } from '../geometry/insetPath';
import type { ShapeType } from '../geometry/shapePath';
import { prepareProfile } from '../profiles/sample';
import type { ResolvedProfile } from '../profiles/types';

export const HEIGHTMAP_PADDING = 8;
export interface HeightRing { u: number; gray: number; path: string }

export function heightmapPitch(w: number, h: number): number {
  const radius = Math.min(w, h) / 2;
  return radius / Math.max(16, Math.min(64, Math.round(radius / 2)));
}

export function aroundHeightmap(type: ShapeType, w: number, h: number, profile: ResolvedProfile) {
  const radius = Math.min(w, h) / 2;
  const count = Math.max(16, Math.min(64, Math.round(radius / 2)));
  const sample = prepareProfile(profile);
  const grayAt = (u: number) => {
    const h = sample(u).value;
    return profile.recessed ? 1 - h : h;
  };
  const rings: HeightRing[] = Array.from({ length: count }, (_, i) => {
    const u = (i + 0.5) / count;
    return { u, gray: grayAt(u), path: insetPath(type, w, h, u * radius) };
  });
  return { edgeGray: grayAt(0), rings, pitch: radius / count, padding: HEIGHTMAP_PADDING };
}
