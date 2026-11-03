import { ROUNDED_RATIO } from './shapePath';
import type { ShapeType } from './shapePath';

const f = (n: number) => Number(n.toFixed(3));

/** The inward parallel curve, in the same coordinates as shapePath. */
export function insetPath(type: ShapeType, w: number, h: number, d: number): string {
  w = Math.max(0, w); h = Math.max(0, h);
  d = Math.max(0, d);
  const cx = w / 2, cy = h / 2;
  if (type === 'circle') {
    const r = Math.max(0, Math.min(w, h) / 2 - d);
    if (!r) return `M${f(cx)} ${f(cy)}Z`;
    return `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;
  }
  if (type === 'hexagon') {
    const r = Math.min(w / 2, h / Math.sqrt(3));
    const inner = Math.max(0, r - 2 * d / Math.sqrt(3));
    if (!inner) return `M${f(cx)} ${f(cy)}Z`;
    const hh = inner * Math.sqrt(3) / 2;
    const points = [[cx + inner, cy], [cx + inner / 2, cy + hh], [cx - inner / 2, cy + hh],
      [cx - inner, cy], [cx - inner / 2, cy - hh], [cx + inner / 2, cy - hh]];
    return `M${points.map(([x, y]) => `${f(x)} ${f(y)}`).join('L')}Z`;
  }
  const inset = Math.min(d, Math.min(w, h) / 2);
  const iw = w - 2 * inset, ih = h - 2 * inset;
  if (iw <= 0 || ih <= 0) return `M${f(cx)} ${f(cy)}Z`;
  const radius = type === 'rounded' ? Math.max(0, Math.min(w, h) * ROUNDED_RATIO - inset)
    : type === 'pill' ? Math.min(iw, ih) / 2 : 0;
  if (!radius) return `M${f(inset)} ${f(inset)}h${f(iw)}v${f(ih)}h${f(-iw)}Z`;
  const x = inset, y = inset, r = radius;
  return `M${f(x + r)} ${f(y)}H${f(x + iw - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + iw)} ${f(y + r)}V${f(y + ih - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + iw - r)} ${f(y + ih)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + ih - r)}V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`;
}
