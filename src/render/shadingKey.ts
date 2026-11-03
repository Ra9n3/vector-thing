import type {OutlineData} from '../outline/types';
import {outlineHash} from '../outline/geometry';
import type { ShapeType } from '../geometry/shapePath';
import { resolveMode, resolveProfile } from '../profiles/sample';
import type { ProfileSettings, ResolvedProfile } from '../profiles/types';
import type { Element } from '../store';
import type { Material } from '../materials/types';
import { resolveMaterial } from '../materials/resolve';
import { effectiveHeight } from './lighting';
import { surfaceMaterial } from './shade';

export interface ShadingSpec {
  key: string; filterKey:string; type: ShapeType; outline?:OutlineData; width: number; height: number; profile: ResolvedProfile;
  mode: 'around' | 'across'; axis: ProfileSettings['acrossAxis']; material: Material; relief: number;
}
const profiles = new WeakMap<ProfileSettings, ResolvedProfile>();
export function shadingSpec(el: Element, override?: {material:Material; state:string; press:number; pressMode:string}): ShadingSpec {
  const settings = el.props.profile;
  let profile = profiles.get(settings);
  if (!profile) { profile = resolveProfile(settings); profiles.set(settings, profile); }
  const { type, width, height } = el;
  const mode = resolveMode(settings, type);
  const axis = settings.acrossAxis;
  const material = override?.material ?? resolveMaterial(el.props.material, el.props.customColor);
  const surface = surfaceMaterial(material);
  const relief = effectiveHeight(width, height, settings.height);
  // Halo geometry and texture are separate definitions; only the resulting surface affects this key.
  const visual=[type, width, height, profile, mode, axis, material.id, el.props.customColor ?? null,
    surface.color, surface.contrast, surface.specular, surface.shininess, surface.metallic, relief, override?.pressMode ?? 'lower',...(type==='path' && el.outline ? [outlineHash(el.outline.nodes),el.outline.nodes] : [])];
  const filterKey=JSON.stringify(visual);
  const key=JSON.stringify([...visual,override?.state ?? 'default',override?.press ?? 0]);
  return { key, filterKey, type, width, height, profile, mode, axis, material, relief, outline:el.outline };
}
