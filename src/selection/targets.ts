import type { Element, Group } from './types';

/** True for a group itself or any descendant, guarded against malformed cycles. */
export function belongsTo(id: string, groupId: string, elements: Element[], groups: Group[]): boolean {
  if (id === groupId) return true;
  let parent = elements.find(e => e.id === id)?.groupId ?? groups.find(g => g.id === id)?.groupId;
  const seen = new Set<string>();
  while (parent && !seen.has(parent)) {
    if (parent === groupId) return true;
    seen.add(parent); parent = groups.find(g => g.id === parent)?.groupId;
  }
  return false;
}
export function leavesOf(selection: string[], elements: Element[], groups: Group[]): Element[] {
  const selected = new Set(selection);
  const byId = new Map(groups.map(g => [g.id,g]));
  return elements.filter(el => {
    if (selected.has(el.id)) return true;
    let p = el.groupId;
    const seen = new Set<string>();
    while (p && !seen.has(p)) { if (selected.has(p)) return true; seen.add(p); p = byId.get(p)?.groupId; }
    return false;
  });
}
/** The direct child at the entered level; outsiders resolve to their outermost group. */
export function topLevelOf(id: string, elements: Element[], groups: Group[], enteredGroupId?: string | null): string {
  const byId = new Map(groups.map(g => [g.id,g]));
  let current = id;
  let parent = elements.find(e => e.id === id)?.groupId ?? byId.get(id)?.groupId;
  const seen = new Set<string>();
  while (parent && !seen.has(parent)) {
    if (parent === enteredGroupId) return current;
    seen.add(parent); current = parent; parent = byId.get(parent)?.groupId;
  }
  return current;
}
export function resolveTargets(selection: string[], elements: Element[], groups: Group[], matchMode: boolean, activeId: string | null, partFilter?: (element:Element)=>boolean): string[] {
  const leaves = leavesOf(selection,elements,groups);
  if (matchMode) {
    const templateGroup=selection.length===1 && groups.some(g=>g.id===selection[0] && g.template);
    const filtered=templateGroup && partFilter ? leaves.filter(partFilter) : leaves;
    return filtered.map(e => e.id);
  }
  const active = leaves.find(e => e.id === activeId) ?? leaves[leaves.length-1];
  return active ? [active.id] : [];
}
export function groupBounds(groupId: string, elements: Element[], groups: Group[]) {
  const leaves = leavesOf([groupId],elements,groups);
  if (!leaves.length) return null;
  const x=Math.min(...leaves.map(e=>e.x)),y=Math.min(...leaves.map(e=>e.y));
  const right=Math.max(...leaves.map(e=>e.x+e.width)),bottom=Math.max(...leaves.map(e=>e.y+e.height));
  return {x,y,w:right-x,h:bottom-y};
}
