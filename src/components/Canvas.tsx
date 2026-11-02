import { useRef } from 'react';
import type { DragEvent } from 'react';
import { Box, Chip, Paper, Tooltip } from '@mui/material';
import { useStore } from '../store';
import { ElementView } from '../canvas/ElementView';
import { SelectionBox } from '../canvas/SelectionBox';
import { useCanvasInteractions } from '../canvas/useCanvasInteractions';
import { useViewport, useViewportControls } from '../canvas/useViewport';
import { LIBRARY_DRAG_TYPE, placeLibraryItem } from '../library';

const DOT_SPACING = 32; // world units

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const mode = useStore((s) => s.mode);
  const elements = useStore((s) => s.elements);
  const zoom = useViewport((s) => s.zoom);
  const panX = useViewport((s) => s.panX);
  const panY = useViewport((s) => s.panY);
  const width = useViewport((s) => s.width);
  const height = useViewport((s) => s.height);
  const space = useViewport((s) => s.space);
  const panning = useViewport((s) => s.panning);
  const resetZoom = useViewport((s) => s.resetZoom);

  useViewportControls(containerRef);
  const { handlers, marquee } = useCanvasInteractions(svgRef);

  const onDragOver = (e: DragEvent) => {
    if (mode === 'face' && e.dataTransfer.types.includes(LIBRARY_DRAG_TYPE)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  };
  const onDrop = (e: DragEvent) => {
    const id = e.dataTransfer.getData(LIBRARY_DRAG_TYPE);
    if (!id || mode !== 'face') return;
    e.preventDefault();
    const r = containerRef.current!.getBoundingClientRect();
    const w = useViewport.getState().screenToWorld(e.clientX - r.left, e.clientY - r.top);
    placeLibraryItem(id, w.x, w.y);
  };

  const dot = DOT_SPACING * zoom;

  return (
    <Box
      ref={containerRef}
      component="main"
      onDragOver={onDragOver}
      onDrop={onDrop}
      sx={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        bgcolor: '#0d0e10',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: `${dot}px ${dot}px`,
        backgroundPosition: `${panX}px ${panY}px`,
        overflow: 'hidden',
        cursor: panning ? 'grabbing' : space ? 'grab' : 'default',
      }}
    >
      {width > 0 && (
        <svg
          ref={svgRef}
          data-view={mode}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: 'absolute', inset: 0, display: 'block', touchAction: 'none', userSelect: 'none' }}
          {...handlers}
        >
          {/* Pan/zoom wrapper */}
          <g
            data-viewport
            transform={`translate(${panX} ${panY}) scale(${zoom})`}
            opacity={mode === 'side' ? 0.3 : 1}
            pointerEvents={mode === 'side' ? 'none' : undefined}
          >
            {elements.map((el) => (
              <ElementView key={el.id} el={el} />
            ))}
          </g>
          <SelectionBox marquee={marquee} />
        </svg>
      )}

      {mode === 'side' && (
        <Paper
          variant="outlined"
          aria-label="Face preview"
          sx={{
            position: 'absolute',
            left: 16,
            bottom: 16,
            width: 160,
            height: 160,
            bgcolor: 'background.paper',
            borderColor: 'divider',
          }}
        />
      )}

      <Tooltip title="Reset zoom" placement="left">
        <Chip
          size="small"
          label={`${Math.round(zoom * 100)}%`}
          onClick={resetZoom}
          sx={{
            position: 'absolute',
            right: 16,
            bottom: 16,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            fontVariantNumeric: 'tabular-nums',
            minWidth: 52,
          }}
        />
      </Tooltip>
    </Box>
  );
}
