export type ShapeType = 'rect' | 'rounded' | 'circle' | 'pill' | 'hexagon';

export const ROUNDED_RATIO = 0.18; // of the shorter side
export const HEX_RATIO = 2 / Math.sqrt(3); // flat-top regular hexagon, width / height
export const MIN_SIZE = 16;

const f = (n: number) => Number(n.toFixed(3));

function roundRect(w: number, h: number, r: number): string {
  r = Math.min(r, w / 2, h / 2);
  if (r <= 0) return `M0 0H${f(w)}V${f(h)}H0Z`;
  return [
    `M${f(r)} 0`,
    `H${f(w - r)}`,
    `A${f(r)} ${f(r)} 0 0 1 ${f(w)} ${f(r)}`,
    `V${f(h - r)}`,
    `A${f(r)} ${f(r)} 0 0 1 ${f(w - r)} ${f(h)}`,
    `H${f(r)}`,
    `A${f(r)} ${f(r)} 0 0 1 0 ${f(h - r)}`,
    `V${f(r)}`,
    `A${f(r)} ${f(r)} 0 0 1 ${f(r)} 0`,
    'Z',
  ].join('');
}

/** SVG path "d" for a shape fitted to a w x h box, origin at 0,0. */
export function shapePath(type: ShapeType, w: number, h: number): string {
  switch (type) {
    case 'rect':
      return `M0 0H${f(w)}V${f(h)}H0Z`;
    case 'rounded':
      return roundRect(w, h, Math.min(w, h) * ROUNDED_RATIO);
    case 'pill':
      return roundRect(w, h, Math.min(w, h) * 0.5);
    case 'circle': {
      const r = Math.min(w, h) / 2;
      const cx = w / 2;
      const cy = h / 2;
      return `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;
    }
    case 'hexagon': {
      const r = Math.min(w / 2, h / Math.sqrt(3)); // circumradius, fitted to box
      const hh = (r * Math.sqrt(3)) / 2;
      const cx = w / 2;
      const cy = h / 2;
      const pts = [
        [cx + r, cy],
        [cx + r / 2, cy + hh],
        [cx - r / 2, cy + hh],
        [cx - r, cy],
        [cx - r / 2, cy - hh],
        [cx + r / 2, cy - hh],
      ];
      return `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
    }
  }
}

/** Fixed width/height ratio for shapes that must stay regular, else null. */
export function aspectLock(type: ShapeType): number | null {
  if (type === 'circle') return 1;
  if (type === 'hexagon') return HEX_RATIO;
  return null;
}

/** Size to use when changing to `type`, keeping approximate area. */
export function fitSize(type: ShapeType, w: number, h: number) {
  const ratio = aspectLock(type);
  if (ratio === null) return { width: w, height: h };
  const s = Math.sqrt(w * h);
  let nh = s / Math.sqrt(ratio);
  let nw = nh * ratio;
  if (nh < MIN_SIZE) {
    nh = MIN_SIZE;
    nw = MIN_SIZE * ratio;
  }
  return { width: f(nw), height: f(nh) };
}
