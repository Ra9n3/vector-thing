import { useMemo } from 'react';
import { boundsOf } from '../geometry/bounds';
import type { HandleId } from '../geometry/bounds';
import { shapePath } from '../geometry/shapePath';
import { useStore } from '../store';
import { isLightColor, selectionColor } from '../render/contrast';
import { useViewport } from './useViewport';
import { leavesOf, belongsTo } from '../selection/targets';
import { GroupOutline } from './GroupOutline';
import type { StackOptions } from '../render/stack';
import { displayedElement } from '../render/stack';

export interface ScreenRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const HANDLES: { id: HandleId; fx: number; fy: number; cursor: string }[] = [
  { id: 'nw', fx: 0, fy: 0, cursor: 'nwse-resize' },
  { id: 'n', fx: 0.5, fy: 0, cursor: 'ns-resize' },
  { id: 'ne', fx: 1, fy: 0, cursor: 'nesw-resize' },
  { id: 'e', fx: 1, fy: 0.5, cursor: 'ew-resize' },
  { id: 'se', fx: 1, fy: 1, cursor: 'nwse-resize' },
  { id: 's', fx: 0.5, fy: 1, cursor: 'ns-resize' },
  { id: 'sw', fx: 0, fy: 1, cursor: 'nesw-resize' },
  { id: 'w', fx: 0, fy: 0.5, cursor: 'ew-resize' },
];

const HANDLE = 8; // visible size, px
const HIT = 16; // hit size, px

// Drawn in screen space, so sizes and strokes never change with zoom.
export function SelectionBox({ marquee, stackOptions }: { marquee: ScreenRect | null; stackOptions:StackOptions }) {
  const mode = useStore((s) => s.mode);
  const background = useStore((s) => s.canvasBackground);
  const accent = selectionColor(background);
  const elements = useStore((s) => s.elements);
  const selection = useStore((s) => s.selection);
  const groups = useStore((s) => s.groups);
  const hoveredId = useStore((s) => s.hoveredId);
  const look = useStore((s) => s.look), direction = useStore((s) => s.direction);
  const zoom = useViewport((s) => s.zoom);
  const panX = useViewport((s) => s.panX);
  const panY = useViewport((s) => s.panY);

  const selected = useMemo(() => {
    return leavesOf(selection,elements,groups).map(e=>displayedElement(e,elements,look,direction,stackOptions));
  }, [elements, selection, groups, look, direction, stackOptions]);

  if (mode === 'side') return null;
  const b = boundsOf(selected);

  return (
    <g pointerEvents="none">
      {selected.map((e) => {
        const dashed = selection.some(id => groups.some(g=>g.id===id) && belongsTo(e.id,id,elements,groups));
        return dashed ? <GroupOutline key={e.id} element={e} panX={panX} panY={panY} zoom={zoom} accent={accent} dashed /> : <g key={e.id}>
          <path d={shapePath(e.type,e.width,e.height)} transform={`translate(${panX+e.x*zoom} ${panY+e.y*zoom}) scale(${zoom})`} fill="none" stroke={isLightColor(background)?'#fff':'#16171a'} strokeWidth={3.5} vectorEffect="non-scaling-stroke" />
          <GroupOutline element={e} panX={panX} panY={panY} zoom={zoom} accent={accent}/>
        </g>;
      })}
      {hoveredId && (() => { const raw=elements.find(e=>e.id===hoveredId); const el=raw && displayedElement(raw,elements,look,direction,stackOptions); return el ? <GroupOutline element={el} panX={panX} panY={panY} zoom={zoom} accent={accent} hover/> : null; })()}

      {b && (() => {
        const sx = panX + b.x * zoom;
        const sy = panY + b.y * zoom;
        const sw = b.w * zoom;
        const sh = b.h * zoom;
        return (
          <g>
            <rect
              x={sx}
              y={sy}
              width={sw}
              height={sh}
              fill="none"
              stroke={accent}
              strokeWidth={1}
              strokeOpacity={0.7}
              strokeDasharray={selected.length > 1 ? '4 3' : undefined}
            />
            {HANDLES.map((h) => {
              if ((h.id === 'n' || h.id === 's') && sw < 36) return null;
              if ((h.id === 'e' || h.id === 'w') && sh < 36) return null;
              const cx = sx + h.fx * sw;
              const cy = sy + h.fy * sh;
              return (
                <g key={h.id} data-handle={h.id} style={{ cursor: h.cursor }}>
                  <rect
                    x={cx - HIT / 2}
                    y={cy - HIT / 2}
                    width={HIT}
                    height={HIT}
                    fill="transparent"
                    pointerEvents="all"
                  />
                  <rect
                    x={cx - HANDLE / 2}
                    y={cy - HANDLE / 2}
                    width={HANDLE}
                    height={HANDLE}
                    rx={2}
                    fill="#fff"
                    stroke={accent}
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}
          </g>
        );
      })()}

      {marquee && (
        <rect
          x={marquee.x}
          y={marquee.y}
          width={marquee.w}
          height={marquee.h}
          fill={accent}
          fillOpacity={0.12}
          stroke={accent}
          strokeWidth={1}
        />
      )}
    </g>
  );
}
