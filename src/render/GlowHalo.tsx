import type { Material } from '../materials/types';

export function GlowDefinition({ id, width, height, radius }: { id: string; width: number; height: number; radius: number }) {
  const pad = Math.max(1, radius * 2);
  return <filter id={id} filterUnits="userSpaceOnUse" x={-pad} y={-pad} width={width + 2 * pad} height={height + 2 * pad}>
    <feGaussianBlur stdDeviation={radius / 2} />
  </filter>;
}

export function GlowHalo({ path, material, filterId }: { path: string; material: Material; filterId?: string }) {
  if (!material.glow || !filterId) return null;
  return <path d={path} fill={material.glow.color} opacity={material.glow.strength}
    filter={`url(#${filterId})`} pointerEvents="none" />;
}
