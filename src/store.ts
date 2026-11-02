import { create } from 'zustand';
import { History } from './history';
import { fitSize, MIN_SIZE } from './geometry/shapePath';
import type { ShapeType } from './geometry/shapePath';
import { snapV } from './geometry/bounds';

export type { ShapeType };
export type Shape = ShapeType;
export type Mode = 'face' | 'side';
export type ElementState = 'default' | 'pressed' | 'disabled';
export type Look = 'flat' | 'slight' | 'strong';
export type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'c';
export type SideProfile = 'flat' | 'raised' | 'pillow' | 'dip' | 'ribbed' | 'dome' | 'inset';

export interface ElementProps {
  sideProfile: SideProfile;
  material: string;
}

export interface Element {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  props: ElementProps;
}

export interface Properties {
  shape: Shape;
  sideProfile: SideProfile;
  material: string;
  size: number;
}

export const MATERIALS = [
  { id: 'slate', label: 'Slate', color: '#64748b' },
  { id: 'sand', label: 'Sand', color: '#d6b98c' },
  { id: 'coral', label: 'Coral', color: '#f2766b' },
  { id: 'moss', label: 'Moss', color: '#6fae7b' },
  { id: 'sky', label: 'Sky', color: '#5aa7e8' },
  { id: 'plum', label: 'Plum', color: '#a46bd1' },
] as const;

/** Common value of a list, or undefined when values differ (or list is empty). */
export function uniform<T>(values: T[]): T | undefined {
  if (values.length === 0) return undefined;
  return values.every((v) => v === values[0]) ? values[0] : undefined;
}

interface Snapshot {
  elements: Element[];
  selection: string[];
}

interface AppState {
  mode: Mode;
  elementState: ElementState;
  look: Look;
  direction: Direction; // 'c' = straight on
  selectedLibraryItem: string | null;
  selection: string[];
  elements: Element[];
  properties: Properties;

  setMode: (m: Mode) => void;
  setElementState: (s: ElementState) => void;
  setLook: (l: Look) => void;
  setDirection: (d: Direction) => void;
  setSelectedLibraryItem: (id: string | null) => void;

  setSelection: (ids: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;

  checkpoint: (key?: string) => void;
  undo: () => void;
  redo: () => void;

  addElement: (type: ShapeType, width: number, height: number, cx: number, cy: number) => void;
  updateElements: (patches: Record<string, Partial<Element>>) => void;
  deleteSelection: () => void;
  duplicateSelection: () => void;
  nudge: (dx: number, dy: number) => void;

  setShapeType: (type: ShapeType) => void;
  setSideProfile: (p: SideProfile) => void;
  setMaterial: (m: string) => void;
  setSize: (v: number) => void;
}

const history = new History<Snapshot>();
let lastKey: string | null = null;
let lastTime = 0;
let counter = 0;
const newId = () => `el-${Date.now().toString(36)}-${(counter++).toString(36)}`;
const r2 = (n: number) => Math.round(n * 100) / 100;

export const useStore = create<AppState>((set, get) => {
  const snap = (): Snapshot => ({ elements: get().elements, selection: get().selection });
  const selectedSet = () => new Set(get().selection);

  const restore = (s: Snapshot) => {
    const ids = new Set(s.elements.map((e) => e.id));
    set({ elements: s.elements, selection: s.selection.filter((id) => ids.has(id)) });
    lastKey = null;
  };

  return {
    mode: 'face',
    elementState: 'default',
    look: 'slight',
    direction: 's',
    selectedLibraryItem: null,
    selection: [],
    elements: [],
    properties: { shape: 'rounded', sideProfile: 'raised', material: 'slate', size: 96 },

    setMode: (mode) => set({ mode }),
    setElementState: (elementState) => set({ elementState }),
    setLook: (look) => set({ look }),
    setDirection: (direction) => set({ direction }),
    setSelectedLibraryItem: (selectedLibraryItem) => set({ selectedLibraryItem }),

    setSelection: (selection) => set({ selection }),
    selectAll: () => set((s) => ({ selection: s.elements.map((e) => e.id) })),
    clearSelection: () => set((s) => (s.selection.length ? { selection: [] } : s)),

    checkpoint: (key) => {
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
      const prev = history.undo(snap());
      if (prev) restore(prev);
    },
    redo: () => {
      const next = history.redo(snap());
      if (next) restore(next);
    },

    addElement: (type, width, height, cx, cy) => {
      get().checkpoint();
      const { elements, selection, properties } = get();
      const chosen = elements.filter((e) => selection.includes(e.id));
      const props: ElementProps = {
        sideProfile: uniform(chosen.map((e) => e.props.sideProfile)) ?? properties.sideProfile,
        material: uniform(chosen.map((e) => e.props.material)) ?? properties.material,
      };
      let x = snapV(cx - width / 2);
      let y = snapV(cy - height / 2);
      for (let i = 0; i < 64 && elements.some((e) => e.x === x && e.y === y); i++) {
        x += 16;
        y += 16;
      }
      const el: Element = { id: newId(), type, x, y, width, height, props };
      set({
        elements: [...elements, el],
        selection: [el.id],
        properties: { ...properties, ...props, shape: type },
      });
    },

    updateElements: (patches) =>
      set((s) => ({
        elements: s.elements.map((e) => (patches[e.id] ? { ...e, ...patches[e.id] } : e)),
      })),

    deleteSelection: () => {
      const { selection } = get();
      if (selection.length === 0) return;
      get().checkpoint();
      const sel = selectedSet();
      set((s) => ({ elements: s.elements.filter((e) => !sel.has(e.id)), selection: [] }));
    },

    duplicateSelection: () => {
      const sel = selectedSet();
      if (sel.size === 0) return;
      get().checkpoint();
      const clones = get()
        .elements.filter((e) => sel.has(e.id))
        .map((e) => ({ ...e, id: newId(), x: e.x + 16, y: e.y + 16, props: { ...e.props } }));
      set((s) => ({
        elements: [...s.elements, ...clones],
        selection: clones.map((c) => c.id),
      }));
    },

    nudge: (dx, dy) => {
      const sel = selectedSet();
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

    setSideProfile: (sideProfile) => {
      const sel = selectedSet();
      if (sel.size === 0) return;
      get().checkpoint();
      set((s) => ({
        properties: { ...s.properties, sideProfile },
        elements: s.elements.map((e) =>
          sel.has(e.id) ? { ...e, props: { ...e.props, sideProfile } } : e,
        ),
      }));
    },

    setMaterial: (material) => {
      const sel = selectedSet();
      if (sel.size === 0) return;
      get().checkpoint();
      set((s) => ({
        properties: { ...s.properties, material },
        elements: s.elements.map((e) =>
          sel.has(e.id) ? { ...e, props: { ...e.props, material } } : e,
        ),
      }));
    },

    // Sets the longer side of each selected element, scaling uniformly around its center.
    setSize: (v) => {
      const sel = selectedSet();
      if (sel.size === 0) return;
      get().checkpoint('size');
      set((s) => ({
        properties: { ...s.properties, size: v },
        elements: s.elements.map((e) => {
          if (!sel.has(e.id)) return e;
          const k = Math.max(v / Math.max(e.width, e.height), MIN_SIZE / Math.min(e.width, e.height));
          const w = r2(e.width * k);
          const h = r2(e.height * k);
          return {
            ...e,
            width: w,
            height: h,
            x: r2(e.x + (e.width - w) / 2),
            y: r2(e.y + (e.height - h) / 2),
          };
        }),
      }));
    },
  };
});
