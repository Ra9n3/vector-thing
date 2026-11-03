import { useMemo } from 'react';
import { Paper } from '@mui/material';
import { resolveMode } from '../profiles/sample';
import { ShadedElement, useShadingDefinitions } from '../render/ShadedElement';
import type { Element } from '../store';
import { useStore } from '../store';
import { resolveStyle } from '../styles/catalog';
import { selectionColor } from '../render/contrast';

const SIZE = 160;
const PADDING = 16;
const NO_SELECTION: string[] = [];

export function FacePreview({ primary }: { primary: Element }) {
  const background = useStore((s) => s.canvasBackground);
  const style=resolveStyle(useStore(s=>s.styleId));
  const look=useStore(s=>s.look), direction=useStore(s=>s.direction);
  const accent = selectionColor(background);
  const element = useMemo(() => ({ ...primary, x: 0, y: 0 }), [primary]);
  const list = useMemo(() => [element], [element]);
  const shading = useShadingDefinitions(list, NO_SELECTION, {elements:list,style,look,direction,background,surfaceOnly:true});
  const scale = Math.min((SIZE - 2 * PADDING) / element.width, (SIZE - 2 * PADDING) / element.height);
  const x = (SIZE - element.width * scale) / 2;
  const y = (SIZE - element.height * scale) / 2;
  const vertical = resolveMode(element.props.profile, element.type) === 'across' && element.props.profile.acrossAxis === 'vertical';
  const x1 = vertical ? SIZE / 2 : x;
  const y1 = vertical ? y : SIZE / 2;
  const x2 = vertical ? SIZE / 2 : SIZE - x;
  const y2 = vertical ? SIZE - y : SIZE / 2;
  return <Paper variant="outlined" aria-label="Face preview" sx={{ position: 'absolute', left: 16, bottom: 16,
    width: SIZE, height: SIZE, bgcolor: background, borderColor: 'divider', overflow: 'hidden' }}>
    <svg width="100%" height="100%" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
      {shading.defs}
      <g transform={`translate(${x} ${y}) scale(${scale})`}><ShadedElement tilt={false} el={shading.visuals.get(element.id)?.element ?? element} material={shading.visuals.get(element.id)?.material} shadingId={shading.elementIds.get(element.id)!} heightId={shading.heightIds.get(element.id)} glowId={shading.glowIds.get(element.id)} textureId={shading.textureIds.get(element.id)} /></g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth={1.25} strokeDasharray="4 3" />
      <circle cx={x1} cy={y1} r={3} fill={accent} />
    </svg>
  </Paper>;
}
