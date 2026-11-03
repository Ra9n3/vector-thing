import { useState } from 'react';
import { Box, IconButton, Popover, Tooltip } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { MATERIALS } from '../materials/resolve';
import { useStore } from '../store';
import { MaterialSwatch } from './MaterialSwatch';

/** Materials not present in the active six-slot palette remain accessible. */
export function MaterialPicker({ disabled }: { disabled: boolean }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const setMaterial = useStore((s) => s.setMaterial);
  return <>
    <Tooltip title="More materials"><span><IconButton size="small" aria-label="More materials" disabled={disabled} onClick={(e) => setAnchor(e.currentTarget)}>
      <MoreHorizIcon fontSize="small" />
    </IconButton></span></Tooltip>
    <Popover open={!!anchor && !disabled} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 32px)', gap: 0.5, p: 1 }}>
        {MATERIALS.map((material) => <Tooltip key={material.id} title={material.label}>
          <IconButton aria-label={material.label} onClick={() => { setMaterial(material.id); setAnchor(null); }} sx={{ width: 32, height: 32 }}>
            <MaterialSwatch material={material} />
          </IconButton>
        </Tooltip>)}
      </Box>
    </Popover>
  </>;
}
