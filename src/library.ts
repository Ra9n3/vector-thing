import { useStore } from './store';
import type { ShapeType } from './store';

const HEX_W = 96;

// Temporary mapping for placeholder tiles.
export const CATEGORY_SHAPES: Record<string, { type: ShapeType; width: number; height: number }> = {
  buttons: { type: 'rounded', width: 120, height: 48 },
  knobs: { type: 'circle', width: 96, height: 96 },
  faders: { type: 'rect', width: 160, height: 40 },
  toggles: { type: 'pill', width: 88, height: 44 },
  cards: { type: 'rounded', width: 240, height: 160 },
  badges: { type: 'hexagon', width: HEX_W, height: Number(((HEX_W * Math.sqrt(3)) / 2).toFixed(3)) },
};

export const LIBRARY_DRAG_TYPE = 'application/x-library-item';

/** Adds the shape for a library tile, centered at a world point. */
export function placeLibraryItem(id: string, cx: number, cy: number) {
  const spec = CATEGORY_SHAPES[id.split('-')[0]];
  if (!spec) return;
  const st = useStore.getState();
  st.setSelectedLibraryItem(id);
  st.addElement(spec.type, spec.width, spec.height, cx, cy);
}
