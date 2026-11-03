import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Chip } from '@mui/material';
import { PRESET_BY_ID, defaultProfile } from '../profiles/presets';
import { resolveMode, resolveProfile, sampleProfile } from '../profiles/sample';
import type { Element } from '../store';
import { resolveMaterial } from '../materials/resolve';
import { selectionColor, isLightColor } from '../render/contrast';
import { useStore } from '../store';
import { Handle } from './Handle';
import { sectionPathFromSamples, sectionSamples, sectionSurface } from './sectionPath';

function useMorphedSamples(preset: string, target: number[]) {
  const [shown, setShown] = useState(target);
  const current = useRef(target);
  const previousPreset = useRef(preset);
  useEffect(() => {
    const changed = previousPreset.current !== preset;
    previousPreset.current = preset;
    if (!changed || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      current.current = target; setShown(target); return;
    }
    const startValues = current.current;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / 150);
      const eased = t * t * (3 - 2 * t);
      const values = target.map((v, i) => startValues[i] + (v - startValues[i]) * eased);
      current.current = values; setShown(values);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [preset, target]);
  return shown;
}

export function SectionView({ primary, selected, width, height }: { primary: Element; selected: Element[]; width: number; height: number }) {
  const background = useStore((s) => s.canvasBackground);
  const accent = selectionColor(background);
  const settings = primary.props.profile;
  const resolved = useMemo(() => resolveProfile(settings), [settings]);
  const preset = PRESET_BY_ID[settings.preset];
  const heightValue = settings.height ?? 0.5;
  const params = useMemo<Record<string, number>>(() => ({ ...settings.params, height: heightValue }), [settings.params, heightValue]);
  const target = useMemo(() => sectionSamples(resolved, heightValue), [resolved, heightValue]);
  const shown = useMorphedSamples(settings.preset, target);
  const ghost = useMemo(() => sectionSamples(resolveProfile(defaultProfile(settings.preset)), 0.5), [settings.preset]);
  const mixed = selected.some((el) => el.props.profile.preset !== settings.preset);
  const ids = useMemo(() => selected.filter((el) => el.props.profile.preset === settings.preset).map((el) => el.id), [selected, settings.preset]);
  const [dragging, setDragging] = useState(false);
  const mode = resolveMode(settings, primary.type);
  const extent = mode === 'around' ? Math.min(primary.width, primary.height)
    : settings.acrossAxis === 'vertical' ? primary.height : primary.width;
  const sectionWidth = Math.max(1, Math.min(width - 80, (height - 100) / 0.8, Math.max(300, extent * 3)));
  const x = (width - sectionWidth) / 2;
  const y = height / 2;
  const amplitude = (0.15 + 0.25 * heightValue) * sectionWidth;
  const direction = resolved.recessed ? 1 : -1;
  const color = resolveMaterial(primary.props.material, primary.props.customColor).color;

  return <>
    {mixed && <Box sx={{ position: 'absolute', top: 16, right: 16 }}><Chip size="small" label="Mixed" /></Box>}
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} aria-label="Side profile"
      style={{ display: 'block', position: 'absolute', inset: 0, touchAction: 'none' }}>
      <g transform={`translate(${x} ${y})`}>
        <path d={sectionPathFromSamples(ghost, sectionWidth)} fill={color} stroke={accent} strokeWidth={1}
          opacity={dragging ? 0.22 : 0} style={{ transition: 'opacity 180ms ease', pointerEvents: 'none' }} />
        <path d={sectionPathFromSamples(shown, sectionWidth)} fill={color} fillOpacity={0.5} />
        <path d={sectionSurface(shown, sectionWidth)} fill="none" stroke={accent} strokeWidth={1.5} strokeLinejoin="round" />
        <line x1={-12} x2={sectionWidth + 12} y1={0} y2={0} stroke={isLightColor(background) ? '#42454d' : '#a6a9b1'} strokeOpacity={0.55} strokeWidth={1} />
        {preset.handles.flatMap((handle, i) => {
          const position = handle.position(params, resolved);
          // Depth on a rib is at its peak; its inverse coordinate stores groove depth.
          const u = position.u;
          const surfaceHeight = handle.paramKey === 'height' || (settings.preset === 'ribbed' && handle.paramKey === 'depth')
            ? sampleProfile(resolved, u) : position.h;
          const cy = direction * amplitude * surfaceHeight;
          const defaultValue = handle.paramKey === 'height' ? 0.5 : preset.params.find((p) => p.key === handle.paramKey)?.default ?? 0.5;
          const halves: ('left' | 'right')[] = u >= 0.999999 ? ['left'] : ['left', 'right'];
          return halves.map((side) => <Handle key={`${i}-${side}`} handle={handle} params={params} profile={resolved} width={sectionWidth}
            side={side} ids={ids} x={sectionWidth * (side === 'left' ? u / 2 : 1 - u / 2)} y={cy}
            defaultValue={defaultValue} accent={accent} onDrag={setDragging} anyDragging={dragging} />);
        })}
      </g>
    </svg>
  </>;
}
