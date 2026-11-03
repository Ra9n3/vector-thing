import type { Element, Group, GroupState } from './types';
import { belongsTo, leavesOf, topLevelOf } from './targets';

const parentOf = (id:string,s:GroupState) => s.elements.find(e=>e.id===id)?.groupId ?? s.groups.find(g=>g.id===id)?.groupId;
function normalized(s:GroupState): string[] {
  const valid=new Set([...s.elements.map(e=>e.id),...s.groups.map(g=>g.id)]);
  return [...new Set(s.selection)].filter(id=>valid.has(id)).filter(id=>!s.selection.some(other=>other!==id && s.groups.some(g=>g.id===other) && belongsTo(id,other,s.elements,s.groups)));
}
function ancestors(id:string|undefined,s:GroupState): (string|undefined)[] {
  const out:(string|undefined)[]=[];const seen=new Set<string>();
  while(id && !seen.has(id)){seen.add(id);out.push(id);id=s.groups.find(g=>g.id===id)?.groupId;}
  return [...out,undefined];
}
function pruneEmpty(groups: Group[], elements: Element[]): Group[] {
  const needed = new Set<string>();
  for (const e of elements) {
    let p=e.groupId; const seen=new Set<string>();
    while(p && !seen.has(p)) {seen.add(p);needed.add(p);p=groups.find(g=>g.id===p)?.groupId;}
  }
  return groups.filter(g=>needed.has(g.id));
}
const withParent = <T extends {groupId?:string}>(item:T, parent:string|undefined):T => {
  const out={...item}; if(parent) out.groupId=parent; else delete out.groupId; return out;
};
export function groupSelection(s:GroupState, newId:string): GroupState {
  const ids=normalized(s); if(ids.length<2 || s.groups.some(g=>g.id===newId) || s.elements.some(e=>e.id===newId)) return s;
  const ancestry=ids.map(id=>ancestors(parentOf(id,s),s));
  const parent=ancestry[0].find(p=>ancestry.every(a=>a.includes(p)));
  const parentDepth=parent ? ancestors(parent,s).filter(Boolean).length : 0;
  const depthBelow=(id:string):number => {
    if (!s.groups.some(g=>g.id===id)) return 0;
    const children=s.groups.filter(g=>g.groupId===id);
    return 1+(children.length?Math.max(...children.map(g=>depthBelow(g.id))):0);
  };
  if(parentDepth+1+Math.max(...ids.map(depthBelow))>3) return s;
  const selectedLeaves=leavesOf(ids,s.elements,s.groups); if(!selectedLeaves.length) return s;
  const leafIds=new Set(selectedLeaves.map(e=>e.id));
  // Insert after the topmost selected sibling's entire branch, never splitting another group.
  const branches=ids.map(id=>topLevelOf(id,s.elements,s.groups,parent));
  const branchLeaves=leavesOf(branches,s.elements,s.groups);
  const last=Math.max(...branchLeaves.map(e=>s.elements.indexOf(e)));
  const beforeCount=s.elements.slice(0,last+1).filter(e=>!leafIds.has(e.id)).length;
  const chosen=new Set(ids);
  const moved=selectedLeaves.map(e=>chosen.has(e.id)?withParent(e,newId):e);
  const rest=s.elements.filter(e=>!leafIds.has(e.id));
  const elements=[...rest.slice(0,beforeCount),...moved,...rest.slice(beforeCount)];
  const groups=pruneEmpty([...s.groups.map(g=>chosen.has(g.id)?withParent(g,newId):g),withParent<Group>({id:newId},parent)],elements);
  return {elements,groups,selection:[newId]};
}
export function ungroupSelection(s:GroupState): GroupState {
  const ids=normalized(s), chosen=new Set(ids.filter(id=>s.groups.some(g=>g.id===id)));
  if(!chosen.size) return s;
  const parents=new Map(s.groups.filter(g=>chosen.has(g.id)).map(g=>[g.id,g.groupId]));
  const elements=s.elements.map(e=>e.groupId && chosen.has(e.groupId)?withParent(e,parents.get(e.groupId)):e);
  const groups=s.groups.filter(g=>!chosen.has(g.id)).map(g=>g.groupId && chosen.has(g.groupId)?withParent(g,parents.get(g.groupId)):g);
  const selected = new Set(ids.filter(id=>!chosen.has(id)));
  for(const e of s.elements) if(e.groupId && chosen.has(e.groupId)) selected.add(e.id);
  for(const g of groups) if([...chosen].some(id=>s.groups.find(x=>x.id===g.id)?.groupId===id)) selected.add(g.id);
  const order = (id:string) => { const ls=leavesOf([id],elements,groups); return ls.length ? elements.indexOf(ls[0]) : Infinity; };
  return {elements,groups,selection:[...selected].sort((a,b)=>order(a)-order(b))};
}
export function duplicateSelection(s:GroupState, makeId:()=>string, offset=16): GroupState {
  const ids=normalized(s); if(!ids.length) return s;
  const copiedGroups:Group[]=[];const selectedIds:string[]=[];
  const inserted=new Map<number,Element[]>();
  const copiedElementIds=new Map<string,string>();
  for (const id of ids) {
    const ls=leavesOf([id],s.elements,s.groups); if(!ls.length) continue;
    const subtree=s.groups.filter(g=>g.id===id || belongsTo(g.id,id,s.elements,s.groups));
    const remap=new Map(subtree.map(g=>[g.id,makeId()]));
    for(const g of subtree) copiedGroups.push(withParent({...g,id:remap.get(g.id)!},g.groupId ? remap.get(g.groupId) ?? g.groupId : undefined));
    const elementIds=new Map(ls.map(e=>[e.id,makeId()]));
    for (const [oldId,newId] of elementIds) copiedElementIds.set(oldId,newId);
    const copies=ls.map(e=>withParent({...e,id:elementIds.get(e.id)!,x:e.x+offset,y:e.y+offset,props:{...e.props},...(e.sitsOn?{sitsOn:elementIds.get(e.sitsOn) ?? e.sitsOn}:{})},e.groupId ? remap.get(e.groupId) ?? e.groupId : undefined));
    selectedIds.push(remap.get(id) ?? copies[0].id);
    const at=s.elements.indexOf(ls[ls.length-1]);inserted.set(at,[...(inserted.get(at)??[]),...copies]);
  }
  const elements=s.elements.flatMap((e,i)=>[e,...(inserted.get(i)??[]).map(copy=>copy.sitsOn && copiedElementIds.has(copy.sitsOn) ? {...copy,sitsOn:copiedElementIds.get(copy.sitsOn)} : copy)]);
  return {elements,groups:[...s.groups,...copiedGroups],selection:selectedIds};
}
export type ReorderAction='forward'|'backward'|'front'|'back';
export function reorderSelection(s:GroupState,action:ReorderAction): GroupState {
  const selected=new Set(normalized(s));if(!selected.size) return s;
  const children=(parent:string|undefined) => {
    const ids:string[]=[];const seen=new Set<string>();
    for(const e of s.elements) {
      let item=e.id,p=e.groupId;const guard=new Set<string>();
      while(p && p!==parent && !guard.has(p)) {guard.add(p);item=p;p=s.groups.find(g=>g.id===p)?.groupId;}
      if(p===parent && !seen.has(item)) {seen.add(item);ids.push(item);}
    }
    return ids;
  };
  let changed=false;
  const flatten=(parent:string|undefined):Element[] => {
    let ids=children(parent);
    const picked=ids.filter(id=>selected.has(id));
    if(picked.length) {
      const before=ids.join('\0');
      if(action==='front') ids=[...ids.filter(id=>!selected.has(id)),...picked];
      else if(action==='back') ids=[...picked,...ids.filter(id=>!selected.has(id))];
      else if(action==='forward') {for(let i=ids.length-2;i>=0;i--) if(selected.has(ids[i])&&!selected.has(ids[i+1])) [ids[i],ids[i+1]]=[ids[i+1],ids[i]];}
      else {for(let i=1;i<ids.length;i++) if(selected.has(ids[i])&&!selected.has(ids[i-1])) [ids[i],ids[i-1]]=[ids[i-1],ids[i]];}
      changed ||= before!==ids.join('\0');
    }
    return ids.flatMap(id=>{const element=s.elements.find(e=>e.id===id);return element?[element]:flatten(id);});
  };
  const elements=flatten(undefined);
  return changed ? {...s,elements} : s;
}
export function deleteSelection(s:GroupState): GroupState {
  const ids=normalized(s), leaves=new Set(leavesOf(ids,s.elements,s.groups).map(e=>e.id));
  if(!leaves.size) return s;
  const elements=s.elements.filter(e=>!leaves.has(e.id)).map(e=>{ if(!e.sitsOn || !leaves.has(e.sitsOn)) return e; const next={...e}; delete next.sitsOn; return next; });
  return {elements,groups:pruneEmpty(s.groups,elements),selection:[]};
}
