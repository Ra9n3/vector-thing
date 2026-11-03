import { useEffect, useRef, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography, Tooltip,
} from '@mui/material';
import HexagonOutlinedIcon from '@mui/icons-material/HexagonOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useStore } from '../store';
import type { ElementState, Mode } from '../store';
import { leavesOf } from '../selection/targets';
import { uniform } from '../store';
import { ExportPopover } from './ExportPopover';
import { StateIcon } from './StateIcon';
import { ACCENT } from '../theme';

export function TopBar() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const elements=useStore(s=>s.elements), selection=useStore(s=>s.selection), groups=useStore(s=>s.groups);
  const targets=selection.length ? leavesOf(selection,elements,groups) : elements;
  const elementState=uniform(targets.map(e=>e.state ?? 'default')) ?? null;
  const setElementState = useStore((s) => s.setElementState);
  const exportButton=useRef<HTMLButtonElement>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='e'&&elements.length){e.preventDefault();setAnchor(exportButton.current);}};window.addEventListener('keydown',key);return ()=>window.removeEventListener('keydown',key);},[elements.length]);

  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: 2, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 204 }}>
          <HexagonOutlinedIcon sx={{ color: ACCENT, fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 14, letterSpacing: '0.01em' }}>
            Name
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            exclusive
            value={mode}
            onChange={(_, v: Mode | null) => v && setMode(v)}
            aria-label="Mode"
          >
            <ToggleButton value="face" sx={{ px: 2 }}>Face</ToggleButton>
            <ToggleButton value="side" sx={{ px: 2 }}>Side</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <ToggleButtonGroup
          exclusive
          value={elementState}
          onChange={(_, v: ElementState | null) => v && setElementState(v)}
          aria-label="State"
          disabled={!elements.length}
        >
          {(['default','pressed','disabled'] as const).map(state=><ToggleButton key={state} value={state} sx={{px:1.5,gap:.5}}><Tooltip title={state[0].toUpperCase()+state.slice(1)}><Box sx={{display:'flex',alignItems:'center',gap:.5}}><StateIcon state={state}/>{state[0].toUpperCase()+state.slice(1)}</Box></Tooltip></ToggleButton>)}
        </ToggleButtonGroup>

        <Button
          variant="contained"
          ref={exportButton}
          disabled={!elements.length}
          startIcon={<FileDownloadOutlinedIcon />}
          endIcon={<KeyboardArrowDownIcon />}
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-haspopup="dialog"
          aria-expanded={Boolean(anchor)}
          sx={{ ml: 1 }}
        >
          Export
        </Button>
        {anchor && <ExportPopover anchor={anchor} onClose={close} />}
      </Toolbar>
    </AppBar>
  );
}
