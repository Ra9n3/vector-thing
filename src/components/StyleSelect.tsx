import { Box, MenuItem, Select, Typography } from '@mui/material';
import { STYLES } from '../styles/catalog';
import type { StylePack } from '../styles/types';
import { resolveMaterial } from '../materials/resolve';
import { useStore } from '../store';

function StyleOption({ style }: { style: StylePack }) {
  return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
    <Box sx={{ display: 'flex', borderRadius: '3px', overflow: 'hidden', flexShrink: 0 }}>
      {style.palette.map((entry, index) => <Box key={index} sx={{ bgcolor: resolveMaterial(entry).color, width: 6, height: 14 }} />)}
    </Box>
    <Typography variant="body2" noWrap>{style.label}</Typography>
  </Box>;
}

export function StyleSelect() {
  const styleId = useStore((s) => s.styleId);
  const setStyle = useStore((s) => s.setStyle);
  return <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Style</Typography>
    <Select size="small" fullWidth value={styleId} onChange={(e) => setStyle(e.target.value)} aria-label="Style"
      renderValue={(id) => <StyleOption style={STYLES.find((s) => s.id === id)!} />}>
      {STYLES.map((style) => <MenuItem key={style.id} value={style.id}><StyleOption style={style} /></MenuItem>)}
    </Select>
  </Box>;
}
