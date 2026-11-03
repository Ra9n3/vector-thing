import type { Element, Group } from '../selection/types';
import { belongsTo, topLevelOf } from '../selection/targets';
/** Resolve an element hit at the current group-edit level. */
export function groupHit(id:string, elements:Element[], groups:Group[], enteredGroupId:string|null): string | null {
  if (enteredGroupId && !belongsTo(id,enteredGroupId,elements,groups)) return null;
  return topLevelOf(id,elements,groups,enteredGroupId);
}
