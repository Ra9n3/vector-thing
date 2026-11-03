import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { HandleDef } from '../profiles/presets';
import { sampleProfile } from '../profiles/sample';
import type { ResolvedProfile } from '../profiles/types';
import { useStore } from '../store';
import { snapHandleValue } from './handleMath';

interface Options {
  handle: HandleDef;
  params: Record<string, number>;
  profile: ResolvedProfile;
  width: number;
  side: 'left' | 'right';
  ids: string[];
  onDrag: (dragging: boolean) => void;
}
interface Active {
  pointerId: number; x: number; y: number; value: number; moved: boolean; u: number; h: number;
  ids: string[]; key: string; width: number; amplitude: number; surface: number;
  inset: boolean; side: 'left' | 'right'; handle: HandleDef;
}

export function useHandleDrag({ handle, params, profile, width, side, ids, onDrag }: Options) {
  const active = useRef<Active | null>(null);
  const frame = useRef(0);
  const [dragging, setDragging] = useState(false);
  const setParam = useStore((s) => s.setProfileParam);
  const onDragRef = useRef(onDrag);
  onDragRef.current = onDrag;
  useEffect(() => () => {
    const a = active.current;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    if (a?.moved) useStore.getState().setProfileParam(a.ids, a.key, a.value, true);
    if (a) onDragRef.current(false);
    active.current = null;
  }, []);

  const down = (e: PointerEvent<SVGCircleElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const pos = handle.position(params, profile);
    const value = params[handle.paramKey] ?? 0.5;
    active.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, value, moved: false,
      u: pos.u, h: pos.h, ids: [...ids], key: handle.paramKey, width,
      amplitude: (0.15 + 0.25 * (params.height ?? 0.5)) * width,
      surface: sampleProfile(profile, pos.u), inset: profile.recessed, side, handle };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true); onDragRef.current(true);
  };
  const move = (e: PointerEvent<SVGCircleElement>) => {
    const a = active.current;
    if (!a || e.pointerId !== a.pointerId) return;
    const dx = e.clientX - a.x, dy = e.clientY - a.y;
    if (!a.moved && Math.abs(a.handle.axis === 'x' ? dx : dy) < 1) return;
    a.moved = true;
    const u = a.u + (a.side === 'left' ? 1 : -1) * 2 * dx / a.width;
    const sign = a.inset ? 1 : -1;
    const h = a.key === 'height'
      ? a.h + sign * dy / (0.25 * a.width * Math.max(a.surface, 0.15))
      : a.h + sign * dy / Math.max(a.amplitude, 1);
    a.value = snapHandleValue(a.handle.fromDrag({ u, h }), a.handle.snap === 'integer', e.altKey);
    if (!frame.current) frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      if (active.current === a) setParam(a.ids, a.key, a.value, false);
    });
  };
  const end = (e: PointerEvent<SVGCircleElement>) => {
    const a = active.current;
    if (!a || e.pointerId !== a.pointerId) return;
    active.current = null;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (a.moved) setParam(a.ids, a.key, a.value, true);
    setDragging(false); onDragRef.current(false);
  };
  return { dragging, down, move, end };
}
