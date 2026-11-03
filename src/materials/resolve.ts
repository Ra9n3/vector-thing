import data from './materials.json';
import { STYLES } from '../styles/catalog';
import type { InlineMaterial, Material, MaterialRef } from './types';

export const MATERIALS = data as Material[];
const materialsById = new Map(MATERIALS.map((material) => [material.id, material]));
const inlineById = new Map<string, InlineMaterial>();
for (const style of STYLES) for (const entry of style.palette) {
  if (typeof entry !== 'string') inlineById.set(entry.id, entry);
}
export const materialId = (entry: MaterialRef) => typeof entry === 'string' ? entry : entry.id;

export function resolveMaterial(idOrInline: MaterialRef, customColor?: string): Material {
  const entry = typeof idOrInline === 'string' ? inlineById.get(idOrInline) ?? idOrInline : idOrInline;
  const id = materialId(entry);
  const baseId = typeof entry === 'string' ? entry : entry.base;
  const base = materialsById.get(baseId);
  if (!base) throw new Error(`Unknown material: ${baseId}`);
  return { ...base, id, color: customColor ?? (typeof entry === 'string' ? base.color : entry.color) };
}
