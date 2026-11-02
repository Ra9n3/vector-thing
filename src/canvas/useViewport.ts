import { useEffect } from 'react';
import type { RefObject } from 'react';
import { create } from 'zustand';

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

interface ViewportState {
  zoom: number;
  panX: number; // screen position of world origin
  panY: number;
  width: number; // container size in px
  height: number;
  space: boolean;
  panning: boolean;

  setSize: (w: number, h: number) => void;
  setPan: (x: number, y: number) => void;
  zoomAt: (sx: number, sy: number, zoom: number) => void;
  resetZoom: () => void;
  screenToWorld: (sx: number, sy: number) => { x: number; y: number };
  visibleCenter: () => { x: number; y: number };
}

export const useViewport = create<ViewportState>((set, get) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  width: 0,
  height: 0,
  space: false,
  panning: false,

  setSize: (width, height) =>
    set((s) =>
      s.width === 0
        ? { width, height, panX: width / 2, panY: height / 2 }
        : {
            width,
            height,
            panX: s.panX + (width - s.width) / 2,
            panY: s.panY + (height - s.height) / 2,
          },
    ),
  setPan: (panX, panY) => set({ panX, panY }),
  zoomAt: (sx, sy, z) =>
    set((s) => {
      const zoom = clampZoom(z);
      const wx = (sx - s.panX) / s.zoom;
      const wy = (sy - s.panY) / s.zoom;
      return { zoom, panX: sx - wx * zoom, panY: sy - wy * zoom };
    }),
  resetZoom: () => {
    const s = get();
    s.zoomAt(s.width / 2, s.height / 2, 1);
  },
  screenToWorld: (sx, sy) => {
    const s = get();
    return { x: (sx - s.panX) / s.zoom, y: (sy - s.panY) / s.zoom };
  },
  visibleCenter: () => {
    const s = get();
    return s.screenToWorld(s.width / 2, s.height / 2);
  },
}));

/** Measures the container, handles wheel zoom, and tracks the Space pan key. */
export function useViewportControls(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const vp = useViewport;
    let inside = false;

    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) vp.getState().setSize(r.width, r.height);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0015));
      const s = vp.getState();
      s.zoomAt(e.clientX - r.left, e.clientY - r.top, s.zoom * factor);
    };
    el.addEventListener('wheel', onWheel, { passive: false });

    const onEnter = () => (inside = true);
    const onLeave = () => (inside = false);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);

    const isTyping = (t: EventTarget | null) =>
      (t as HTMLElement | null)?.closest?.('input, textarea, select, [contenteditable="true"]');

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || !inside || isTyping(e.target)) return;
      e.preventDefault();
      if (!vp.getState().space) vp.setState({ space: true });
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (vp.getState().space) {
        e.preventDefault();
        vp.setState({ space: false });
      }
    };
    const onBlur = () => vp.setState({ space: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      ro.disconnect();
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [containerRef]);
}
