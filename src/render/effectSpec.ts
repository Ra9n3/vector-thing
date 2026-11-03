import type {OutlineData} from '../outline/types';
import {outlineHash} from '../outline/geometry';
import {shapePath} from '../geometry/shapePath';
import type { ShapeType } from '../geometry/shapePath';
import type { ProfileSettings } from '../profiles/types';
import type { Material } from '../materials/types';
import type { StylePack } from '../styles/types';
import type { Direction, Look } from '../viewTypes';
import { resolveProfile } from '../profiles/sample';
import { effectiveHeight } from './lighting';
import { DIR_VEC, shadowVector, tiltGeometry, wallPx } from './tilt';
import { wallFacets } from './wallFacets';
import { shadowPaths, innerShadowPath } from './shadows';
import { shadowMods } from '../states/apply';
import type { ElementState } from '../selection/types';
import { sweepPath } from '../geometry/hull';

export interface EffectInput { type: ShapeType; outline?:OutlineData; width: number; height: number; profile: ProfileSettings; material: Material; look: Look; direction: Direction; style: StylePack; press?: number; state?:ElementState }
export function effectKey(input: EffectInput): string {
  const { type, width, height, profile, material, look, direction, style } = input;
  const wall = wallPx(profile, width, height) * (1 - 0.8 * Math.max(0, Math.min(1, input.press ?? 0)));
  return JSON.stringify([type,width,height,profile,material,look,direction,wall,profile.wall ?? 1,style.shadow,style.highlightShadow ?? null,input.press ?? 0,input.state === 'pressed' && !input.press ? 'default' : input.state ?? 'default',style.pressMode ?? 'lower',...(type==='path'&&input.outline?[outlineHash(input.outline.nodes),input.outline.nodes]:[])]);
}
export function effectSpec(input: EffectInput) {
  const { type, width, height, profile, material, look, direction, style } = input;
  const press = Math.max(0, Math.min(1, input.press ?? 0));
  const wall = wallPx(profile,width,height) * (1-0.8*press);
  const resolved = resolveProfile(profile);
  const geom = tiltGeometry(look,direction,wall,resolved.recessed);
  const peak = Math.max(...resolved.points.map(p=>p.h));
  const edge = resolved.points[0]?.h ?? 0;
  const relief = effectiveHeight(width,height,profile.height) * Math.max(0,peak-edge);
  const mods=shadowMods(input.state==='disabled' ? 'disabled' : press>0 ? 'pressed' : input.state ?? 'default',press);
  const shadowRaw = shadowVector(wall + 0.5*relief*(1-0.8*press),look);
  const shadow={x:shadowRaw.x*mods.length,y:shadowRaw.y*mods.length};
  return { key:effectKey(input), type, width, height, outline:input.outline, look, direction, wall, recessed:resolved.recessed, capOffset:geom.capOffset,
    facets:wallFacets(type,width,height,geom.wallVec,DIR_VEC[direction],material,resolved.recessed,input.outline),
    shadow, mods, paths:shadowPaths(type,width,height,shadow,input.outline), innerPath:innerShadowPath(type,width,height,32,input.outline),
    hitPath:type==='path'?shapePath(type,width,height,input.outline):sweepPath(type,width,height,geom.capOffset,input.outline), material, style };
}
export type EffectSpec = ReturnType<typeof effectSpec>;
