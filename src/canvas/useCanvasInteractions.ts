import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as RPointerEvent, RefObject } from 'react';
import { boundsOf, computeResize, intersects, snapV } from '../geometry/bounds';
import type { Box, HandleId } from '../geometry/bounds';
import { useStore } from '../store';
import type { Element } from '../store';
import { useViewport } from './useViewport';
import type { ScreenRect } from './SelectionBox';

type Pt = { x: number; y: number };

type Gesture =
  | { kind: 'pan'; sx: number; sy: number; px: number; py: number }
  | {
      kind: 'move';
      sx: number;
      sy: number;
      start: Pt;
      origins: Element[];
      box: Box;
      moved: boolean;
      toggleOff: string | null;
      collapseTo: string | null;
    }
  | { kind: 'resize'; sx: number; sy: number; handle: HandleId; origins: Element[]; box: Box; moved: boolean }
  | { kind: 'marquee'; sx: number; sy: number; base: string[]; active: boolean };

const DRAG_THRESHOLD = 3;

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

export function useCanvasInteractions(svgRef: RefObject<SVGSVGElement | null>) {
  const gesture = useRef<Gesture | null>(null);
  const [marquee, setMarquee] = useState<ScreenRect | null>(null);

  const local = (e: { clientX: number; clientY: number }): Pt => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const selectedElements = () => {
    const { elements, selection } = useStore.getState();
    const set = new Set(selection);
    return elements.filter((e) => set.has(e.id));
  };

  const onPointerDown = (e: RPointerEvent<SVGSVGElement>) => {
    const vp = useViewport.getState();
    const st = useStore.getState();
    const p = local(e);
    const svg = e.currentTarget;

    // Pan: middle mouse, or Space + drag. Works in both modes.
    if (e.button === 1 || (e.button === 0 && vp.space)) {
      e.preventDefault();
      gesture.current = { kind: 'pan', sx: p.x, sy: p.y, px: vp.panX, py: vp.panY };
      useViewport.setState({ panning: true });
      svg.setPointerCapture(e.pointerId);
      return;
    }
    if (e.button !== 0 || st.mode !== 'face') return;

    (document.activeElement as HTMLElement | null)?.blur?.();
    const target = e.target as SVGElement;
    const handle = target.closest?.('[data-handle]')?.getAttribute('data-handle') as HandleId | null;
    const elId = target.closest?.('[data-el]')?.getAttribute('data-el') ?? null;

    if (handle) {
      const origins = selectedElements();
      const box = boundsOf(origins);
      if (!box) return;
      gesture.current = { kind: 'resize', sx: p.x, sy: p.y, handle, origins, box, moved: false };
      svg.setPointerCapture(e.pointerId);
      return;
    }

    if (elId) {
      let toggleOff: string | null = null;
      let collapseTo: string | null = null;
      const sel = st.selection;
      if (e.shiftKey) {
        if (sel.includes(elId)) toggleOff = elId;
        else st.setSelection([...sel, elId]);
      } else if (!sel.includes(elId)) {
        st.setSelection([elId]);
      } else if (sel.length > 1) {
        collapseTo = elId;
      }
      const origins = selectedElements();
      const box = boundsOf(origins);
      if (!box) return;
      gesture.current = {
        kind: 'move',
        sx: p.x,
        sy: p.y,
        start: vp.screenToWorld(p.x, p.y),
        origins,
        box,
        moved: false,
        toggleOff,
        collapseTo,
      };
      svg.setPointerCapture(e.pointerId);
      return;
    }

    // Empty canvas: clear (unless Shift) and start a marquee.
    const base = e.shiftKey ? st.selection : [];
    if (!e.shiftKey) st.clearSelection();
    gesture.current = { kind: 'marquee', sx: p.x, sy: p.y, base, active: false };
    svg.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: RPointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    if (!g) return;
    const p = local(e);
    const vp = useViewport.getState();
    const st = useStore.getState();
    const dist = Math.hypot(p.x - g.sx, p.y - g.sy);
    const w = vp.screenToWorld(p.x, p.y);

    switch (g.kind) {
      case 'pan':
        vp.setPan(g.px + (p.x - g.sx), g.py + (p.y - g.sy));
        break;

      case 'move': {
        if (!g.moved) {
          if (dist < DRAG_THRESHOLD) return;
          g.moved = true;
          st.checkpoint();
        }
        let dx = w.x - g.start.x;
        let dy = w.y - g.start.y;
        if (!e.altKey) {
          dx = snapV(g.box.x + dx) - g.box.x;
          dy = snapV(g.box.y + dy) - g.box.y;
        }
        const patches: Record<string, Partial<Element>> = {};
        for (const o of g.origins) patches[o.id] = { x: o.x + dx, y: o.y + dy };
        st.updateElements(patches);
        break;
      }

      case 'resize': {
        if (!g.moved) {
          if (dist < 2) return;
          g.moved = true;
          st.checkpoint();
        }
        st.updateElements(
          computeResize(g.handle, g.origins, g.box, w, { free: e.shiftKey, snap: !e.altKey }),
        );
        break;
      }

      case 'marquee': {
        if (!g.active) {
          if (dist < DRAG_THRESHOLD) return;
          g.active = true;
        }
        const rect: ScreenRect = {
          x: Math.min(g.sx, p.x),
          y: Math.min(g.sy, p.y),
          w: Math.abs(p.x - g.sx),
          h: Math.abs(p.y - g.sy),
        };
        setMarquee(rect);
        const a = vp.screenToWorld(rect.x, rect.y);
        const b = vp.screenToWorld(rect.x + rect.w, rect.y + rect.h);
        const box: Box = { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y };
        const hit = st.elements
          .filter((el) => intersects(box, { x: el.x, y: el.y, w: el.width, h: el.height }))
          .map((el) => el.id);
        const next = g.base.length ? [...g.base, ...hit.filter((id) => !g.base.includes(id))] : hit;
        if (!sameIds(next, st.selection)) st.setSelection(next);
        break;
      }
    }
  };

  const end = (e: RPointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    gesture.current = null;
    setMarquee(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!g) return;
    if (g.kind === 'pan') useViewport.setState({ panning: false });
    if (g.kind === 'move' && !g.moved) {
      const st = useStore.getState();
      if (g.toggleOff) st.setSelection(st.selection.filter((id) => id !== g.toggleOff));
      else if (g.collapseTo) st.setSelection([g.collapseTo]);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const inField = t?.closest?.('input, textarea, select, [contenteditable="true"]') as HTMLInputElement | null;
      if (inField && inField.type !== 'range') return;

      const st = useStore.getState();
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) st.redo();
        else st.undo();
        return;
      }
      if (mod && key === 'y') {
        e.preventDefault();
        st.redo();
        return;
      }
      if (st.mode !== 'face' || inField) return;

      if (mod && key === 'a') {
        e.preventDefault();
        st.selectAll();
      } else if (mod && key === 'd') {
        e.preventDefault();
        st.duplicateSelection();
      } else if (!mod && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (st.selection.length === 0) return;
        e.preventDefault();
        st.deleteSelection();
      } else if (!mod && e.key === 'Escape') {
        st.clearSelection();
      } else if (!mod && e.key.startsWith('Arrow')) {
        if (t?.closest?.('.MuiToggleButtonGroup-root, [role="tablist"], [role="menu"]')) return;
        if (st.selection.length === 0) return;
        e.preventDefault();
        const n = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -n : e.key === 'ArrowRight' ? n : 0;
        const dy = e.key === 'ArrowUp' ? -n : e.key === 'ArrowDown' ? n : 0;
        st.nudge(dx, dy);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return {
    marquee,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      onAuxClick: (e: RPointerEvent<SVGSVGElement>) => e.preventDefault(),
    },
  };
}
