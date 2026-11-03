import { useState } from 'react';
import { Box, IconButton, Popover, Tooltip, Typography } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { resolveMaterial } from '../materials/resolve';
import { useStore } from '../store';
import type { Element } from '../store';

export function ColorOverride({ selected, mainParts = false }: { selected: Element[]; mainParts?: boolean }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const setColor = useStore((s) => s.setCustomColor);
  if (!selected.length) return null;
  const primary = selected[selected.length - 1];
  const color = resolveMaterial(primary.props.material, primary.props.customColor).color;
  const hasOverride = selected.some((el) => el.props.customColor !== undefined);
  return <Box>
    <Tooltip title={mainParts ? 'Main parts' : ''}><Typography variant="overline" color="text.secondary" sx={{ display: 'block' }}>Color</Typography></Tooltip>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Tooltip title="Color"><IconButton aria-label="Color" onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ border: 1, borderColor: 'divider', borderRadius: 1, width: 32, height: 32 }}>
        <Box sx={{ width: 19, height: 19, borderRadius: 0.5, bgcolor: color, border: '1px solid rgba(255,255,255,0.25)' }} />
      </IconButton></Tooltip>
      <Tooltip title="Reset color"><span><IconButton aria-label="Reset color" disabled={!hasOverride} onClick={() => setColor(undefined)}>
        <RestartAltIcon fontSize="small" />
      </IconButton></span></Tooltip>
      <Popover open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Box sx={{ p: 1 }}><input aria-label="Color picker" type="color" value={color} onChange={(e) => setColor(e.target.value)}
          style={{ width: 48, height: 32, border: 0, padding: 0, cursor: 'pointer', background: 'transparent' }} /></Box>
      </Popover>
    </Box>
  </Box>;
}
