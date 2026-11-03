import { memo, useMemo, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Box, Tooltip } from '@mui/material';
import { useStore } from '../store';
import type { Direction } from '../viewTypes';
import { resolveStyle } from '../styles/catalog';
import { resolveMaterial } from '../materials/resolve';
import { thumbGeometry } from '../render/thumbGeometry';
import { DirectionThumb } from './DirectionThumb';
import { usePreviewValue } from './usePreviewValue';
import { DIRECTION_GRID, navigateDirection } from './directionNavigation';

const LABEL: Record<Direction, string> = {
  nw: 'Top left', n: 'Top', ne: 'Top right', w: 'Left', c: 'Straight on', e: 'Right',
  sw: 'Bottom left', s: 'Bottom', se: 'Bottom right',
};
const ANGLE: Record<Direction, number> = { n:0, ne:45, e:90, se:135, s:180, sw:225, w:270, nw:315, c:0 };

export const DirectionPad = memo(function DirectionPad() {
  const direction = useStore((s) => s.direction);
  const look = useStore((s) => s.look);
  const setDirection = useStore((s) => s.setDirection);
  const styleId = useStore((s) => s.styleId);
  const style = resolveStyle(styleId);
  const previewStyle = resolveStyle(usePreviewValue(styleId));
  const previewLook = usePreviewValue(look);
  const buttons = useRef(new Map<Direction, HTMLButtonElement>());
  const thumbs = useMemo(() => {
    const material = resolveMaterial(previewStyle.palette[0]);
    return Object.fromEntries(DIRECTION_GRID.flat().map((d) => [d, thumbGeometry(d, previewLook, material, previewStyle)])) as Record<Direction, ReturnType<typeof thumbGeometry>>;
  }, [previewStyle, previewLook]);
  const selected = look === 'flat' ? 'c' : direction === 'c' ? style.direction : direction;
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: Direction) => {
    const next = navigateDirection(current, event.key);
    if (!next) return;
    event.preventDefault();
    event.stopPropagation();
    setDirection(next);
    buttons.current.get(next)?.focus();
  };

  return <Box role="radiogroup" aria-label="View direction" sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gridAutoRows: '40px', gap: 0.5, justifyContent: 'start' }}>
    {DIRECTION_GRID.flat().map((d) => {
      const recommended = d !== 'c' && d !== 'n' && d !== 'nw' && d !== 'w' && (d === style.direction || style.goodDirections.includes(d));
      const label = `${LABEL[d]}${recommended ? ' — Recommended' : ''}`;
      return <Tooltip key={d} title={label}>
        <Box component="button" type="button" role="radio" aria-label={label} aria-checked={selected === d} tabIndex={selected === d ? 0 : -1}
          ref={(node: HTMLButtonElement | null) => { if (node) buttons.current.set(d, node); else buttons.current.delete(d); }}
          onClick={() => setDirection(d)} onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => onKeyDown(e, d)}
          sx={{ position:'relative', width:40, height:40, padding:0, display:'block', border:'1px solid', borderColor:selected === d ? 'primary.main' : 'divider', borderRadius:1,
            bgcolor:selected === d ? 'rgba(139,124,255,0.18)' : 'transparent', cursor:'pointer', color:'text.primary',
            '&:hover': { bgcolor:'rgba(255,255,255,0.07)' }, '&:focus-visible': { outline:'2px solid', outlineColor:'primary.main', outlineOffset:2, zIndex:1 } }}>
          <Box aria-hidden="true" sx={{ opacity: look === 'flat' ? 0.45 : 1 }}>
            <DirectionThumb geometry={thumbs[d]} />
            <svg width="9" height="9" viewBox="0 0 10 10" style={{ position:'absolute', left:3, bottom:3, color:'#f6f6f8' }}>
              {d === 'c' ? <circle cx="5" cy="5" r="1.7" fill="currentColor" stroke="#121316" strokeWidth="1"/> : <>
                <path d="M5 8V2M2.5 4.5L5 2l2.5 2.5" fill="none" stroke="#121316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" transform={`rotate(${ANGLE[d]} 5 5)`}/>
                <path d="M5 8V2M2.5 4.5L5 2l2.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform={`rotate(${ANGLE[d]} 5 5)`}/>
              </>}
            </svg>
            {recommended && <Box component="span" sx={{position:'absolute', top:3, right:3, width:d === style.direction ? 6 : 4, height:d === style.direction ? 6 : 4, borderRadius:'50%', bgcolor:'primary.main', boxShadow:'0 0 0 1px #18191d'}}/>}
          </Box>
        </Box>
      </Tooltip>;
    })}
  </Box>;
});
