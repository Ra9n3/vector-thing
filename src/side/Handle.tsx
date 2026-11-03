import { useState } from 'react';
import { Tooltip } from '@mui/material';
import type { HandleDef } from '../profiles/presets';
import type { ResolvedProfile } from '../profiles/types';
import { useStore } from '../store';
import { useHandleDrag } from './useHandleDrag';
import { snapHandleValue } from './handleMath';

interface Props {
  handle: HandleDef; params: Record<string, number>; profile: ResolvedProfile;
  width: number; side: 'left' | 'right'; ids: string[]; x: number; y: number;
  defaultValue: number; accent: string; onDrag: (dragging: boolean) => void; anyDragging: boolean;
}
export function Handle({ handle, params, profile, width, side, ids, x, y, defaultValue, accent, onDrag, anyDragging }: Props) {
  const [hovered, setHovered] = useState(false);
  const { dragging, down, move, end } = useHandleDrag({ handle, params, profile, width, side, ids, onDrag });
  const setParam = useStore((s) => s.setProfileParam);
  const value = params[handle.paramKey] ?? defaultValue;
  const label = `${handle.label} ${Math.round(value * 100)}%`;
  return <Tooltip title={label} open={dragging || hovered} onOpen={() => setHovered(true)} onClose={() => setHovered(false)} arrow>
    <circle r={5} cx={x} cy={y} fill={dragging ? accent : '#f3f1ff'} stroke={accent} strokeWidth={2}
      role="slider" aria-label={handle.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}
      tabIndex={0} data-handle-param={handle.paramKey} data-half={side}
      style={{ cursor: handle.axis === 'x' ? 'ew-resize' : 'ns-resize', touchAction: 'none',
        transition: anyDragging ? 'none' : 'cx 150ms ease, cy 150ms ease' }}
      onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
      onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); setParam(ids, handle.paramKey, defaultValue, true); }}
      onKeyDown={(e) => {
        const delta = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
        if (!delta) return;
        e.preventDefault(); e.stopPropagation();
        setParam(ids, handle.paramKey, snapHandleValue(value + delta * (handle.snap === 'integer' ? 0.25 : 0.05), handle.snap === 'integer', false), true);
      }}
    />
  </Tooltip>;
}
