import { create } from 'zustand';
import { History } from './history';
import { fitSize, MIN_SIZE } from './geometry/shapePath';
import type { ShapeType } from './geometry/shapePath';
import { snapV } from './geometry/bounds';
import { defaultProfile } from './profiles/presets';
import { materialId } from './materials/resolve';
import { resolveStyle } from './styles/catalog';
import { applyStyle, remapMaterial } from './styles/applyStyle';
import type { ProfilePresetId, ProfileSettings } from './profiles/types';

export type { ShapeType };
export type Shape = ShapeType;
export type Mode = 'face' | 'side';
import type { ElementState } from './selection/types';
export type { ElementState } from './selection/types';
import { scaleOverrides } from './states/apply';
import type { Look, Direction } from './viewTypes';
export type { Look, Direction } from './viewTypes';

import type { Element, Group } from './selection/types';
export type { Element, ElementProps, Group } from './selection/types';
import type { ElementProps } from './selection/types';
import { belongsTo, leavesOf, resolveTargets, topLevelOf } from './selection/targets';
import { groupSelection, ungroupSelection, duplicateSelection, reorderSelection, deleteSelection } from './selection/groupOps';
import type { ReorderAction } from './selection/groupOps';
import type { ComponentTemplate } from './library/types';
import { instantiate } from './library/instantiate';
import { BUILTIN_TEMPLATES } from './library/catalog';
import { loadUserTemplates, saveUserTemplates, snapshotTemplate } from './library/userTemplates';

export interface Properties {
  shape: Shape;
  profile: ProfileSettings;
  material: string;
  size: number;
}

/** Common value of a list, or undefined when values differ (or list is empty). */
export function uniform<T>(values: T[]): T | undefined {
  if (values.length === 0) return undefined;
  return values.every((v) => v === values[0]) ? values[0] : undefined;
}

interface Snapshot {
  elements: Element[];
  groups: Group[];
  userTemplates: ComponentTemplate[];
  selection: string[];
  styleId: string;
  canvasBackground: string;
  look: Look;
  direction: Direction;
  properties: Properties;
}

interface AppState {
  mode: Mode;
  styleId: string;
  canvasBackground: string;
  stateChangeVersion: number;
  instantStateVersion: number;
  look: Look;
  direction: Direction; // 'c' = straight on
  selectedLibraryItem: string | null;
  selection: string[];
  elements: Element[];
  groups: Group[];
  userTemplates: ComponentTemplate[];
  matchMode: boolean;
  activeId: string | null;
  hoveredId: string | null;
  enteredGroupId: string | null;
  properties: Properties;

  setMode: (m: Mode) => void;
  setStyle: (id: string) => void;
  setElementState: (s: ElementState) => void;
  setLook: (l: Look) => void;
  setDirection: (d: Direction) => void;
  setSelectedLibraryItem: (id: string | null) => void;

  setSelection: (ids: string[]) => void;
  setMatchMode: (match: boolean) => void;
  setActiveId: (id: string | null) => void;
  setHoveredId: (id: string | null) => void;
  setEnteredGroup: (id: string | null) => void;
  group: () => void;
  ungroup: () => void;
  reorder: (action: ReorderAction) => void;
  selectAll: () => void;
  clearSelection: () => void;

  checkpoint: (key?: string) => void;
  undo: () => void;
  redo: () => void;

  placeTemplate: (id:string, at:{x:number;y:number}, scale?:number) => void;
  saveToLibrary: () => void;
  deleteUserTemplate: (id:string) => void;
  addElement: (type: ShapeType, width: number, height: number, cx: number, cy: number, preset?: ProfilePresetId) => void;
  updateElements: (patches: Record<string, Partial<Element>>) => void;
  deleteSelection: () => void;
  duplicateSelection: () => void;
  nudge: (dx: number, dy: number) => void;

  setShapeType: (type: ShapeType) => void;
  setSideProfile: (p: ProfilePresetId) => void;
  setWall: (value: number) => void;
  setProfileMode: (mode: ProfileSettings['mode']) => void;
  setProfileAxis: (axis: ProfileSettings['acrossAxis']) => void;
  setProfileParam: (ids: string[], key: string, value: number, commit: boolean) => void;
  setMaterial: (m: string) => void;
  setCustomColor: (color?: string) => void;
  setSize: (v: number) => void;
}

const history = new History<Snapshot>();
let lastKey: string | null = null;
let lastTime = 0;
export function clearHistoryForQA() { if (import.meta.env.DEV) { history.clear(); lastKey = null; } }
let counter = 0;
const newId = () => `el-${Date.now().toString(36)}-${(counter++).toString(36)}`;
const r2 = (n: number) => Math.round(n * 100) / 100;

export const useStore = create<AppState>((set, get) => {
  const snap = (): Snapshot => {
    const { elements, groups, userTemplates, selection, styleId, canvasBackground, look, direction, properties } = get();
    return { elements, groups, userTemplates, selection, styleId, canvasBackground, look, direction, properties };
  };
  const selectedSet = (mainOnly=false) => { const s=get(); return new Set(resolveTargets(s.selection,s.elements,s.groups,s.matchMode,s.activeId,mainOnly ? e=>!!e.main : undefined)); };
  const selectedLeavesSet = () => { const s=get(); return new Set(leavesOf(s.selection,s.elements,s.groups).map(e=>e.id)); };
  let profileEdit: { before: Snapshot; ids: string[]; key: string } | null = null;
  const finishProfileEdit = () => {
    if (!profileEdit) return;
    const { before, ids, key } = profileEdit;
    const current = get().elements;
    const changed = ids.some((id) => {
      const a = before.elements.find((el) => el.id === id)?.props.profile;
      const b = current.find((el) => el.id === id)?.props.profile;
      return a && b && (key === 'height' ? (a.height ?? 0.5) !== (b.height ?? 0.5) : a.params[key] !== b.params[key]);
    });
    if (changed) { history.push(before); lastKey = null; }
    profileEdit = null;
  };

  const restore = (s: Snapshot) => {
    const groups = s.groups ?? [];
    saveUserTemplates(s.userTemplates ?? []);
    const ids = new Set([...s.elements.map((e) => e.id), ...groups.map(g=>g.id)]);
    const selection=s.selection.filter((id) => ids.has(id));
    const leaves=leavesOf(selection,s.elements,groups);
    set({ ...s, groups, selection, instantStateVersion:get().instantStateVersion+1, enteredGroupId: groups.some(g=>g.id===get().enteredGroupId) ? get().enteredGroupId : null, hoveredId:null,
      activeId: get().matchMode ? null : (leaves.some(e=>e.id===get().activeId) ? get().activeId : leaves.at(-1)?.id ?? null) });
    lastKey = null;
  };

  return {
    mode: 'face',
    styleId: 'studio-hardware',
    canvasBackground: resolveStyle('studio-hardware').canvasBackground,
    stateChangeVersion: 0,
    instantStateVersion: 0,
    look: 'slight',
    direction: 's',
    selectedLibraryItem: null,
    selection: [],
    elements: [],
    groups: [],
    userTemplates: loadUserTemplates(),
    matchMode: true,
    activeId: null,
    hoveredId: null,
    enteredGroupId: null,
    properties: { shape: 'rounded', profile: defaultProfile('raised'), material: materialId(resolveStyle('studio-hardware').palette[0]), size: 96 },

    setMode: (mode) => set({ mode }),
    setStyle: (id) => {
      const next = resolveStyle(id);
      const old = resolveStyle(get().styleId);
      if (id === old.id) return;
      get().checkpoint();
      set((s) => ({
        styleId: id, canvasBackground: next.canvasBackground, look: next.look, direction: next.direction,
        elements: applyStyle(s.elements, old, next),
        properties: { ...s.properties, material: remapMaterial(s.properties.material, old, next) },
      }));
    },
    setElementState: (state) => {
      const s=get();const ids=new Set((s.selection.length ? leavesOf(s.selection,s.elements,s.groups) : s.elements).map(e=>e.id));
      if(!s.elements.some(e=>ids.has(e.id) && (e.state ?? 'default')!==state))return;
      s.checkpoint();set({elements:s.elements.map(e=>ids.has(e.id)?{...e,state}:e),stateChangeVersion:s.stateChangeVersion+1});
    },
    setLook: (look) => {
      const current = get();
      if (look === current.look) return;
      get().checkpoint();
      // Older documents may have stored the old center direction.
      const direction = look !== 'flat' && current.direction === 'c' ? resolveStyle(current.styleId).direction : current.direction;
      set({ look, direction });
    },
    setDirection: (direction) => {
      const current = get();
      if (direction === 'c') {
        if (current.look === 'flat') return;
        get().checkpoint();
        set({ look: 'flat' });
        return;
      }
      if (current.direction === direction && current.look !== 'flat') return;
      get().checkpoint();
      set({ direction, look: current.look === 'flat' ? 'slight' : current.look });
    },
    setSelectedLibraryItem: (selectedLibraryItem) => set({ selectedLibraryItem }),

    setSelection: (selection) => set((s) => {
      const unique=[...new Set(selection)];
      const leaves=leavesOf(unique,s.elements,s.groups);
      const enteredGroupId = s.enteredGroupId && unique.some(id=>!belongsTo(id,s.enteredGroupId!,s.elements,s.groups)) ? null : s.enteredGroupId;
      return { selection:unique, enteredGroupId, hoveredId:null, activeId:s.matchMode ? null : (leaves.some(e=>e.id===s.activeId) ? s.activeId : leaves.at(-1)?.id ?? null) };
    }),
    setMatchMode: (matchMode) => set((s) => ({ matchMode, activeId: matchMode ? null : leavesOf(s.selection,s.elements,s.groups).at(-1)?.id ?? null, hoveredId:null })),
    setActiveId: (id) => set((s) => !s.matchMode && leavesOf(s.selection,s.elements,s.groups).some(e=>e.id===id) ? { activeId:id } : s),
    setHoveredId: (hoveredId) => set({ hoveredId }),
    setEnteredGroup: (enteredGroupId) => set({ enteredGroupId, selection:[], activeId:null, hoveredId:null }),
    selectAll: () => { const s=get(); const eligible=s.enteredGroupId ? leavesOf([s.enteredGroupId],s.elements,s.groups) : s.elements;
      get().setSelection([...new Set(eligible.map(e=>topLevelOf(e.id,s.elements,s.groups,s.enteredGroupId)))]); },
    clearSelection: () => set((s) => (s.selection.length || s.enteredGroupId ? { selection: [], enteredGroupId:null, activeId:null, hoveredId:null } : s)),
    group: () => { const s=get(); const next=groupSelection(s, newId()); if(next===s) return; s.checkpoint(); set({...next, hoveredId:null, enteredGroupId:next.groups.some(g=>g.id===s.enteredGroupId)?s.enteredGroupId:null, activeId:s.matchMode?null:leavesOf(next.selection,next.elements,next.groups).at(-1)?.id??null}); },
    ungroup: () => { const s=get(); const next=ungroupSelection(s); if(next===s) return; s.checkpoint(); set({...next, hoveredId:null, enteredGroupId: next.groups.some(g=>g.id===s.enteredGroupId) ? s.enteredGroupId : null, activeId:s.matchMode?null:leavesOf(next.selection,next.elements,next.groups).at(-1)?.id??null}); },
    reorder: (action) => { const s=get(); const next=reorderSelection(s,action); if(next===s) return; s.checkpoint(); set(next); },

    checkpoint: (key) => {
      finishProfileEdit();
      const now = Date.now();
      if (key && key === lastKey && now - lastTime < 600) {
        lastTime = now;
        return;
      }
      history.push(snap());
      lastKey = key ?? null;
      lastTime = now;
    },
    undo: () => {
      finishProfileEdit();
      const prev = history.undo(snap());
      if (prev) restore(prev);
    },
    redo: () => {
      finishProfileEdit();
      const next = history.redo(snap());
      if (next) restore(next);
    },

    placeTemplate: (id, at, scale=1) => {
      const s=get(); const template=[...BUILTIN_TEMPLATES,...s.userTemplates].find(t=>t.id===id);
      if(!template || !Number.isFinite(scale) || scale<=0)return;
      const result=instantiate(template,at,scale,resolveStyle(s.styleId),s.elements,s.groups);
      s.checkpoint();
      set({...result, enteredGroupId:null, hoveredId:null, selectedLibraryItem:id,
        activeId:s.matchMode?null:leavesOf(result.selection,result.elements,result.groups).at(-1)?.id??null});
    },
    saveToLibrary: () => {
      const s=get(); const id=`user-${Date.now().toString(36)}-${counter++}`;
      const template=snapshotTemplate(id,s.selection,s.elements,s.groups,resolveStyle(s.styleId));
      if(!template)return;
      s.checkpoint(); const userTemplates=[...s.userTemplates,template]; saveUserTemplates(userTemplates); set({userTemplates});
    },
    deleteUserTemplate: (id) => {
      const s=get(); const userTemplates=s.userTemplates.filter(t=>t.id!==id); if(userTemplates.length===s.userTemplates.length)return;
      s.checkpoint(); saveUserTemplates(userTemplates); set({userTemplates,selectedLibraryItem:s.selectedLibraryItem===id?null:s.selectedLibraryItem});
    },

    addElement: (type, width, height, cx, cy, preset) => {
      get().checkpoint();
      const { elements, properties } = get();
      const targets = selectedSet();
      const chosen = elements.filter((e) => targets.has(e.id));
      const props: ElementProps = {
        profile: defaultProfile(preset ?? uniform(chosen.map((e) => e.props.profile.preset)) ?? properties.profile.preset),
        material: uniform(chosen.map((e) => e.props.material)) ?? properties.material,
      };
      let x = snapV(cx - width / 2);
      let y = snapV(cy - height / 2);
      for (let i = 0; i < 64 && elements.some((e) => e.x === x && e.y === y); i++) {
        x += 16;
        y += 16;
      }
      const el: Element = { id: newId(), type, state:'default', pressable:true, x, y, width, height, props };
      // Placing a new top-level item leaves group edit mode.
      set({
        elements: [...elements, el],
        enteredGroupId: null,
        activeId: get().matchMode ? null : el.id,
        selection: [el.id],
        properties: { ...properties, ...props, shape: type },
      });
    },

    updateElements: (patches) =>
      set((s) => ({
        elements: s.elements.map((e) => (patches[e.id] ? { ...e, ...patches[e.id] } : e)),
      })),

    deleteSelection: () => { const s=get(); const next=deleteSelection(s); if(next===s) return; s.checkpoint(); set({...next,activeId:null,hoveredId:null,enteredGroupId:next.groups.some(g=>g.id===s.enteredGroupId)?s.enteredGroupId:null}); },

    duplicateSelection: () => { const s=get(); const next=duplicateSelection(s,newId); if(next===s) return; s.checkpoint(); set({...next,hoveredId:null,activeId:s.matchMode?null:leavesOf(next.selection,next.elements,next.groups).at(-1)?.id??null}); },

    nudge: (dx, dy) => {
      const sel = selectedLeavesSet();
      if (sel.size === 0) return;
      get().checkpoint('nudge');
      set((s) => ({
        elements: s.elements.map((e) => (sel.has(e.id) ? { ...e, x: e.x + dx, y: e.y + dy } : e)),
      }));
    },

    setShapeType: (type) => {
      const sel = selectedSet();
      if (sel.size === 0) return;
      get().checkpoint();
      set((s) => ({
        properties: { ...s.properties, shape: type },
        elements: s.elements.map((e) => {
          if (!sel.has(e.id)) return e;
          const cx = e.x + e.width / 2;
          const cy = e.y + e.height / 2;
          const { width, height } = fitSize(type, e.width, e.height);
          return { ...e, type, width, height, x: r2(cx - width / 2), y: r2(cy - height / 2) };
        }),
      }));
    },

    setSideProfile: (preset) => {
      const sel = selectedSet();
      if (sel.size === 0) return;
      get().checkpoint();
      const withPreset = (profile: ProfileSettings): ProfileSettings => ({
        ...defaultProfile(preset), height: profile.height ?? 0.5, wall: profile.wall ?? 1, mode: profile.mode, acrossAxis: profile.acrossAxis,
      });
      set((s) => ({
        properties: { ...s.properties, profile: withPreset(s.properties.profile) },
        elements: s.elements.map((e) =>
          sel.has(e.id) ? { ...e, props: { ...e.props, profile: withPreset(e.props.profile) } } : e,
        ),
      }));
    },

    setWall: (value) => {
      if (!Number.isFinite(value)) return;
      const wall = Math.max(0, Math.min(2, value));
      const sel = selectedSet();
      if (!sel.size || !get().elements.some((e) => sel.has(e.id) && (e.props.profile.wall ?? 1) !== wall)) return;
      get().checkpoint('wall');
      set((s) => ({
        properties: { ...s.properties, profile: { ...s.properties.profile, wall } },
        elements: s.elements.map((e) => sel.has(e.id) ? { ...e, props: { ...e.props, profile: { ...e.props.profile, wall } } } : e),
      }));
    },

    setProfileMode: (mode) => {
      const sel = selectedSet();
      if (sel.size === 0) return;
      get().checkpoint();
      set((s) => ({
        properties: { ...s.properties, profile: { ...s.properties.profile, mode } },
        elements: s.elements.map((e) => sel.has(e.id)
          ? { ...e, props: { ...e.props, profile: { ...e.props.profile, mode } } } : e),
      }));
    },

    setProfileAxis: (acrossAxis) => {
      const sel = selectedSet();
      if (sel.size === 0) return;
      get().checkpoint();
      set((s) => ({
        properties: { ...s.properties, profile: { ...s.properties.profile, acrossAxis } },
        elements: s.elements.map((e) => sel.has(e.id)
          ? { ...e, props: { ...e.props, profile: { ...e.props.profile, acrossAxis } } } : e),
      }));
    },

    setProfileParam: (ids, key, value, commit) => {
      if (!Number.isFinite(value) || !ids.length) return;
      const next = Math.max(0, Math.min(1, value));
      const allowed = selectedSet();
      const targets = new Set(ids.filter(id => allowed.has(id)));
      const signature = [...targets].sort().join('\0');
      if (profileEdit && (profileEdit.key !== key || [...profileEdit.ids].sort().join('\0') !== signature)) finishProfileEdit();
      const changed = get().elements.some((el) => targets.has(el.id) &&
        (key === 'height' ? (el.props.profile.height ?? 0.5) !== next : el.props.profile.params[key] !== next));
      if (changed && !profileEdit) profileEdit = { before: snap(), ids: [...targets], key };
      if (changed) set((s) => ({
        elements: s.elements.map((el) => {
          if (!targets.has(el.id)) return el;
          const profile = key === 'height' ? { ...el.props.profile, height: next }
            : { ...el.props.profile, params: { ...el.props.profile.params, [key]: next } };
          return { ...el, props: { ...el.props, profile } };
        }),
        properties: { ...s.properties, profile: key === 'height' ? { ...s.properties.profile, height: next }
          : { ...s.properties.profile, params: { ...s.properties.profile.params, [key]: next } } },
      }));
      if (commit) finishProfileEdit();
    },

    setMaterial: (material) => {
      const sel = selectedSet(true);
      if (sel.size === 0) return;
      get().checkpoint();
      set((s) => ({
        properties: { ...s.properties, material },
        elements: s.elements.map((e) =>
          sel.has(e.id) ? { ...e, ...(e.materialSlot !== undefined ? {materialSlot: (()=>{const i=resolveStyle(s.styleId).palette.findIndex(p=>materialId(p)===material); return i<0?null:i;})()} : {}), props: { ...e.props, material } } : e,
        ),
      }));
    },

    setCustomColor: (customColor) => {
      const sel = selectedSet(true);
      if (!sel.size) return;
      if (customColor !== undefined && !/^#[\da-f]{6}$/i.test(customColor)) return;
      if (!get().elements.some((el) => sel.has(el.id) && el.props.customColor !== customColor)) return;
      get().checkpoint('customColor');
      set((s) => ({ elements: s.elements.map((el) => {
        if (!sel.has(el.id)) return el;
        const props = { ...el.props };
        if (customColor === undefined) delete props.customColor;
        else props.customColor = customColor;
        return { ...el, props };
      }) }));
    },

    // Sets the longer side of each selected element, scaling uniformly around its center.
    setSize: (v) => {
      const sel = selectedSet();
      if (sel.size === 0) return;
      const selected = get().elements.filter(e => sel.has(e.id));
      const templateGroup = get().matchMode && get().selection.length===1 && get().groups.some(g=>g.id===get().selection[0] && g.template);
      const left=Math.min(...selected.map(e=>e.x)), top=Math.min(...selected.map(e=>e.y));
      const right=Math.max(...selected.map(e=>e.x+e.width)), bottom=Math.max(...selected.map(e=>e.y+e.height));
      const reference = templateGroup ? Math.max(right-left,bottom-top) : selected.reduce((sum,e)=>sum+Math.max(e.width,e.height),0) / selected.length;
      const factor = Math.max(v / reference, ...selected.map(e => (templateGroup ? 0.01 : MIN_SIZE) / Math.min(e.width,e.height)));
      const centerX=(left+right)/2, centerY=(top+bottom)/2;
      get().checkpoint('size');
      set((s) => ({
        properties: { ...s.properties, size: v },
        elements: s.elements.map((e) => {
          if (!sel.has(e.id)) return e;
          const k = factor;
          const w = r2(e.width * k);
          const h = r2(e.height * k);
          return {
            ...e,
            width: w,
            height: h,
            stateOverrides:scaleOverrides(e.stateOverrides,k,k),
            x: r2((templateGroup ? centerX + (e.x + e.width/2 - centerX)*k : e.x + e.width/2) - w/2),
            y: r2((templateGroup ? centerY + (e.y + e.height/2 - centerY)*k : e.y + e.height/2) - h/2),
          };
        }),
      }));
    },
  };
});
