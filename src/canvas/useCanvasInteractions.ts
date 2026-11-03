import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as RPointerEvent, RefObject } from 'react';
import { boundsOf, computeResize, intersects, snapV } from '../geometry/bounds';
import type { Box, HandleId } from '../geometry/bounds';
import { useStore } from '../store';
import type { Element } from '../store';
import { useViewport } from './useViewport';
import type { ScreenRect } from './SelectionBox';
import { sweepBounds } from '../geometry/hull';
import { tiltGeometry, wallPx } from '../render/tilt';
import { resolveProfile } from '../profiles/sample';
import { belongsTo, leavesOf, topLevelOf } from '../selection/targets';
import { groupHit } from './useGroupInteractions';
import type { StackOptions } from '../render/stack';
import { displayedElement, renderedOffset } from '../render/stack';
import { visualElement } from '../states/visual';
import type { MouseEvent as RMouseEvent } from 'react';

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

export function useCanvasInteractions(svgRef: RefObject<SVGSVGElement | null>, stackOptions:StackOptions) {
  const gesture = useRef<Gesture | null>(null);
  const lastPointerElement = useRef<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [marquee, setMarquee] = useState<ScreenRect | null>(null);
  const [resizeOrigins, setResizeOrigins] = useState<Element[] | null>(null);

  const local = (e: { clientX: number; clientY: number }): Pt => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const selectedElements = () => {
    const { elements, selection, groups, look, direction } = useStore.getState();
    return leavesOf(selection,elements,groups).map(e=>displayedElement(e,elements,look,direction,stackOptions));
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
    lastPointerElement.current = elId;

    if (handle) {
      const origins = selectedElements();
      const box = boundsOf(origins);
      if (!box) return;
      gesture.current = { kind: 'resize', sx: p.x, sy: p.y, handle, origins, box, moved: false };
      // Reuse the original shading while a multi-selection is being dragged.
      if (origins.length > 1) setResizeOrigins(origins);
      svg.setPointerCapture(e.pointerId);
      return;
    }

    if (elId) {
      const itemId = groupHit(elId,st.elements,st.groups,st.enteredGroupId);
      if (!itemId) { st.setEnteredGroup(null); return; }
      if (e.altKey && !st.matchMode && leavesOf(st.selection,st.elements,st.groups).some(el=>el.id===elId)) { st.setActiveId(elId); return; }
      let toggleOff: string | null = null;
      let collapseTo: string | null = null;
      const sel = st.selection;
      if (e.shiftKey) {
        if (sel.includes(itemId)) toggleOff = itemId;
        else st.setSelection([...sel, itemId]);
      } else if (!sel.includes(itemId)) {
        st.setSelection([itemId]);
      } else if (sel.length > 1) {
        collapseTo = itemId;
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

    // An empty click leaves group-edit mode before starting a fresh marquee.
    const base = e.shiftKey ? st.selection : [];
    if (!e.shiftKey && !st.enteredGroupId) st.clearSelection();
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
          setMoving(true);
          st.checkpoint();
        }
        let dx = w.x - g.start.x;
        let dy = w.y - g.start.y;
        if (!e.altKey) {
          dx = snapV(g.box.x + dx) - g.box.x;
          dy = snapV(g.box.y + dy) - g.box.y;
        }
        const patches: Record<string, Partial<Element>> = {};
        for (const o of g.origins) {
          const raw=st.elements.find(e=>e.id===o.id)!; const offset=renderedOffset(raw,st.elements,st.look,st.direction,stackOptions);
          patches[o.id] = { x: o.x + dx - offset.x, y: o.y + dy - offset.y };
        }
        st.updateElements(patches);
        break;
      }

      case 'resize': {
        if (!g.moved) {
          if (dist < 2) return;
          g.moved = true;
          st.checkpoint();
        }
        const templateGroup=st.selection.length===1 && st.groups.some(group=>group.id===st.selection[0] && group.template);
        const patches=computeResize(g.handle, g.origins, g.box, w, { free: e.shiftKey, snap: !e.altKey, ...(templateGroup?{minSize:0.01}:{}) });
        const interim=st.elements.map(el=>patches[el.id]?{...el,...patches[el.id]}:el);
        for(const o of g.origins) {
          const el=interim.find(item=>item.id===o.id)!; const offset=renderedOffset(el,interim,st.look,st.direction,stackOptions);
          patches[o.id] = {...patches[o.id], x:patches[o.id].x!-offset.x, y:patches[o.id].y!-offset.y};
        }
        st.updateElements(patches);
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
          .filter((el) => !st.enteredGroupId || belongsTo(el.id,st.enteredGroupId,st.elements,st.groups))
          .filter((el) => {
            const visual=visualElement(el,stackOptions.pack,st.canvasBackground,stackOptions.frames?.get(el.id));
            const profile=visual.element.props.profile;
            const offset = tiltGeometry(st.look,st.direction,wallPx(profile,el.width,el.height)*(1-.8*visual.frame.press),resolveProfile(profile).recessed).capOffset;
            const hull = sweepBounds(el.type,el.width,el.height,offset);
            const shown=displayedElement(el,st.elements,st.look,st.direction,stackOptions);
            return intersects(box,{...hull,x:shown.x+hull.x,y:shown.y+hull.y});
          })
          .map((el) => topLevelOf(el.id,st.elements,st.groups,st.enteredGroupId));
        const unique = [...new Set(hit)];
        const next = g.base.length ? [...g.base, ...unique.filter((id) => !g.base.includes(id))] : unique;
        if (!sameIds(next, st.selection)) st.setSelection(next);
        break;
      }
    }
  };

  const end = (e: RPointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    gesture.current = null;
    setMarquee(null);
    setResizeOrigins(null);
    setMoving(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!g) return;
    if (g.kind === 'pan') useViewport.setState({ panning: false });
    if (g.kind === 'marquee' && !g.active && useStore.getState().enteredGroupId) useStore.getState().setEnteredGroup(null);
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
      if (inField) return;
      if (mod && key === 'g') { e.preventDefault(); if(e.shiftKey) st.ungroup(); else st.group(); return; }
      if (!mod && (e.key === '[' || e.key === ']' || e.code === 'BracketLeft' || e.code === 'BracketRight')) {
        e.preventDefault(); const forward=e.key === ']' || e.code === 'BracketRight';
        st.reorder(e.shiftKey ? (forward ? 'front' : 'back') : (forward ? 'forward' : 'backward')); return;
      }
      if (!mod && e.key === 'Escape' && st.enteredGroupId) { st.setEnteredGroup(null); return; }
      if (st.mode !== 'face') return;

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
        if (t?.closest?.('.MuiToggleButtonGroup-root, [role="tablist"], [role="menu"], [role="radiogroup"]')) return;
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

  const onDoubleClick = (e: RMouseEvent<SVGSVGElement>) => {
    const st=useStore.getState();
    // Pointer capture retargets dblclick to the SVG; remember the second down target.
    const elId=lastPointerElement.current;
    if(!elId || (st.enteredGroupId && !belongsTo(elId,st.enteredGroupId,st.elements,st.groups))) return;
    const item=topLevelOf(elId,st.elements,st.groups,st.enteredGroupId);
    if(st.groups.some(g=>g.id===item)) { e.preventDefault(); st.setEnteredGroup(item); }
  };

  return {
    marquee,
    resizeOrigins,
    moving,
    handlers: {
      onPointerDown,
      onDoubleClick,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      onAuxClick: (e: RPointerEvent<SVGSVGElement>) => e.preventDefault(),
    },
  };
}
