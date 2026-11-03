import { useMemo, useRef } from 'react';
import type { DragEvent } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { useStore } from '../store';
import { ElementView } from '../canvas/ElementView';
import { SelectionBox } from '../canvas/SelectionBox';
import { useCanvasInteractions } from '../canvas/useCanvasInteractions';
import { useViewport, useViewportControls } from '../canvas/useViewport';
import { LIBRARY_DRAG_TYPE, placeLibraryItem } from '../library';
import { useShadingDefinitions } from '../render/ShadedElement';
import { SectionView } from '../side/SectionView';
import { FacePreview } from '../side/FacePreview';
import type { Element } from '../store';
import { isLightColor } from '../render/contrast';
import { resolveStyle } from '../styles/catalog';
import { leavesOf, resolveTargets, belongsTo } from '../selection/targets';
import { useStateAnimation } from '../states/animate';
import { displayedElement, stackedShadowClip } from '../render/stack';

const EMPTY_ELEMENTS: Element[] = [];
const DOT_SPACING = 32; // world units

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const mode = useStore((s) => s.mode);
  const canvasBackground = useStore((s) => s.canvasBackground);
  const look = useStore((s) => s.look);
  const direction = useStore((s) => s.direction);
  const style = resolveStyle(useStore((s) => s.styleId));
  const elements = useStore((s) => s.elements);
  const selection = useStore((s) => s.selection);
  const groups = useStore((s) => s.groups);
  const enteredGroupId = useStore((s) => s.enteredGroupId);
  const matchMode = useStore((s) => s.matchMode);
  const activeId = useStore((s) => s.activeId);
  const zoom = useViewport((s) => s.zoom);
  const panX = useViewport((s) => s.panX);
  const panY = useViewport((s) => s.panY);
  const width = useViewport((s) => s.width);
  const height = useViewport((s) => s.height);
  const space = useViewport((s) => s.space);
  const panning = useViewport((s) => s.panning);
  const resetZoom = useViewport((s) => s.resetZoom);

  const version=useStore(s=>s.stateChangeVersion),instantVersion=useStore(s=>s.instantStateVersion);
  const frames=useStateAnimation(elements,style,version,instantVersion);
  const stackOptions=useMemo(()=>({pack:style,frames}),[style,frames]);
  const animatingIds=useMemo(()=>{
    const active=new Set(frames.keys()),byId=new Map(elements.map(el=>[el.id,el]));
    for(const el of elements){let parent=el.sitsOn;const seen=new Set<string>();while(parent && !seen.has(parent)){seen.add(parent);if(frames.has(parent)){active.add(el.id);break;}parent=byId.get(parent)?.sitsOn;}}
    return active;
  },[elements,frames]);
  useViewportControls(containerRef, mode === 'face');
  const { handlers, marquee, resizeOrigins, moving } = useCanvasInteractions(svgRef,stackOptions);

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
  const originalSizes = useMemo(() => new Map(resizeOrigins?.map((el) => [el.id, el]) ?? []), [resizeOrigins]);
  const shadingElements = useMemo(() => resizeOrigins ? elements.map((el) => {
    const original = originalSizes.get(el.id);
    return original ? { ...el, width: original.width, height: original.height } : el;
  }) : elements, [elements, resizeOrigins, originalSizes]);
  const selectedLeaves = useMemo(() => leavesOf(selection,elements,groups), [selection,elements,groups]);
  const selectedIds = useMemo(() => selectedLeaves.map(e=>e.id), [selectedLeaves]);
  const shading = useShadingDefinitions(mode === 'face' ? shadingElements : EMPTY_ELEMENTS, selectedIds, { elements: mode === 'face' ? elements : EMPTY_ELEMENTS, look, direction, style, background:canvasBackground, frames });
  const targetIds = useMemo(() => new Set(resolveTargets(selection,elements,groups,matchMode,activeId)), [selection,elements,groups,matchMode,activeId]);
  const selected = useMemo(() => selectedLeaves.filter(e=>targetIds.has(e.id)), [selectedLeaves,targetIds]);
  const primary = selected[selected.length - 1];

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
        bgcolor: canvasBackground,
        backgroundImage: mode === 'face' ? `radial-gradient(${isLightColor(canvasBackground) ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)'} 1px, transparent 1px)` : 'none',
        backgroundSize: `${dot}px ${dot}px`,
        backgroundPosition: `${panX}px ${panY}px`,
        overflow: 'hidden',
        cursor: mode === 'face' && panning ? 'grabbing' : mode === 'face' && space ? 'grab' : 'default',
      }}
    >
      {mode === 'face' && width > 0 && (
        <svg
          ref={svgRef}
          data-view={mode}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{ position: 'absolute', inset: 0, display: 'block', touchAction: 'none', userSelect: 'none' }}
          {...handlers}
        >
          {shading.defs}
          <style>{'[data-dimmed] * { pointer-events: none !important; }'}</style>
          {/* Pan/zoom wrapper */}
          <g
            data-viewport
            transform={`translate(${panX} ${panY}) scale(${zoom})`}
          >
            {elements.map((el) => {
              const preview = shading.previews.get(shading.elementIds.get(el.id)!);
              const original = originalSizes.get(el.id) ?? (moving && selectedIds.length > 1 && selectedIds.includes(el.id) && preview ? el : undefined);
              const dimmed = !!enteredGroupId && !belongsTo(el.id,enteredGroupId,elements,groups);
              const visual=shading.visuals.get(el.id)!;
              const shown = {...displayedElement(el,elements,look,direction,stackOptions),props:visual.element.props};
              const shadowClip = stackedShadowClip(el,elements,look,direction,stackOptions);
              return <g key={el.id} data-dimmed={dimmed ? '' : undefined} opacity={dimmed ? 0.4 : 1} pointerEvents={dimmed ? 'none' : undefined}><ElementView el={shown} material={visual.material} animating={animatingIds.has(el.id) && !moving && !resizeOrigins} shadowClip={shadowClip} effect={shading.effectsByElement.get(el.id)} shadingId={shading.elementIds.get(el.id)!} heightId={shading.heightIds.get(el.id)} glowId={shading.glowIds.get(el.id)} textureId={shading.textureIds.get(el.id)} original={original} preview={original ? preview : undefined} /></g>;
            })}
          </g>
          <SelectionBox marquee={marquee} stackOptions={stackOptions} />
        </svg>
      )}

      {mode === 'side' && primary && width > 0 && height > 0 && <>
        <SectionView primary={primary} selected={selected} width={width} height={height} />
        <FacePreview primary={primary} />
      </>}

      {mode === 'face' && <Tooltip title="Reset zoom" placement="left">
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
      </Tooltip>}
    </Box>
  );
}
