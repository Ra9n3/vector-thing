import type { Direction, Look } from '../viewTypes';
import type { ProfileSettings } from '../profiles/types';
import { PRESET_BY_ID } from '../profiles/presets';
import { resolveProfile, sampleProfile } from '../profiles/sample';
import { effectiveHeight, LIGHT_ELEVATION } from './lighting';

export const TILT_FACTOR: Record<Look, number> = { flat: 0, slight: 0.35, strong: 0.7 };
const D = Math.SQRT1_2;
export const DIR_VEC: Record<Direction, { x: number; y: number }> = {
  n: { x: 0, y: -1 }, ne: { x: D, y: -D }, e: { x: 1, y: 0 }, se: { x: D, y: D },
  s: { x: 0, y: 1 }, sw: { x: -D, y: D }, w: { x: -1, y: 0 }, nw: { x: -D, y: -D },
  c: { x: 0, y: 0 },
};
export const SHADOW_LEN = 0.6;
export const SHADOW_LOOK: Record<Look, number> = { flat: 0.5, slight: 1, strong: 1 };
export function wallPx(profile: ProfileSettings, w: number, h: number): number {
  const height = effectiveHeight(w, h, profile.height);
  const multiplier = Math.max(0, Math.min(2, Number.isFinite(profile.wall) ? profile.wall : 1));
  const p = resolveProfile(profile);
  return height * (p.recessed ? 0.6 : Math.max(sampleProfile(p, 0), PRESET_BY_ID[profile.preset].minWall)) * multiplier;
}
export function tiltGeometry(look: Look, direction: Direction, wall: number, recessed: boolean) {
  const factor = wall < 1 ? 0 : TILT_FACTOR[look] * wall * (recessed ? 1 : -1);
  const d = DIR_VEC[direction];
  const capOffset = { x: d.x * factor || 0, y: d.y * factor || 0 };
  return { capOffset, wallVec: { ...capOffset } };
}
export function shadowVector(totalHeightPx: number, look: Look) {
  const len = Math.max(0, totalHeightPx) / Math.tan(LIGHT_ELEVATION * Math.PI / 180) * SHADOW_LEN * SHADOW_LOOK[look];
  return { x: D * len, y: D * len };
}
