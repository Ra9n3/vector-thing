import type { Direction, Look } from '../viewTypes';
import type { Material } from '../materials/types';
import type { StylePack } from '../styles/types';
import { defaultProfile } from '../profiles/presets';
import { resolveProfile } from '../profiles/sample';
import { shapePath } from '../geometry/shapePath';
import { effectiveHeight } from './lighting';
import { DIR_VEC, shadowVector, tiltGeometry, wallPx } from './tilt';
import { wallFacets } from './wallFacets';
import { colorString, shadeColor } from './shade';

// Exaggerated wall is still a Raised profile, so the direction is legible at 40px.
const SIZE = 20;
const SAMPLE = { ...defaultProfile('raised'), height: 1, wall: 2 };
const PROFILE = resolveProfile(SAMPLE);

/** Lightweight geometry for the pad; does not touch document rendering. */
export function thumbGeometry(direction: Direction, look: Look, material: Material, pack: StylePack) {
  const previewLook = look === 'flat' ? 'slight' : look;
  const wall = wallPx(SAMPLE, SIZE, SIZE);
  const geometry = tiltGeometry(previewLook, direction, wall, false);
  const relief = effectiveHeight(SIZE, SIZE, SAMPLE.height) *
    (Math.max(...PROFILE.points.map(p => p.h)) - PROFILE.points[0].h);
  const shadow = shadowVector(wall + 0.5 * relief, previewLook);
  return {
    capOffset: geometry.capOffset,
    cap: shapePath('circle', SIZE, SIZE),
    wall: wallFacets('circle', SIZE, SIZE, geometry.wallVec, DIR_VEC[direction], material, false),
    shadow,
    shadowColor: pack.shadow.color,
    shadowOpacity: pack.shadow.strength * 0.35,
    highlight: pack.highlightShadow,
    opacity: material.opacity,
    stops: [
      colorString(shadeColor(material, 0.32, 0.32)),
      colorString(shadeColor(material, 0.18, 0.18)),
      colorString(shadeColor(material, 0, 0)),
      colorString(shadeColor(material, -0.8, -0.8)),
    ],
  };
}
export type ThumbGeometry = ReturnType<typeof thumbGeometry>;
