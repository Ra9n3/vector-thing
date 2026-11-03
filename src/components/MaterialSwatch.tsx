import { useId } from 'react';
import type { Material } from '../materials/types';
import { colorString, shadeColor } from '../render/shade';

export function MaterialSwatch({ material, disabled = false }: { material: Material; disabled?: boolean }) {
  const id = `swatch-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const highlight = colorString(shadeColor(material, 0.28, 0.28));
  const light = colorString(shadeColor(material, 0.18, 0.18));
  const middle = colorString(shadeColor(material, 0, 0));
  const edge = colorString(shadeColor(material, -0.8, -0.8));
  return <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" style={{ opacity: disabled ? 0.4 : 1 }}>
    <defs><radialGradient id={id} cx="32%" cy="27%" r="75%">
      <stop offset="0" stopColor={highlight} /><stop offset="0.23" stopColor={light} />
      <stop offset="0.58" stopColor={middle} /><stop offset="1" stopColor={edge} />
    </radialGradient></defs>
    <circle cx="11" cy="11" r="9" fill={`url(#${id})`} opacity={material.opacity} stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
  </svg>;
}
