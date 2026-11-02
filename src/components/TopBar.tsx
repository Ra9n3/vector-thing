import { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from '@mui/material';
import HexagonOutlinedIcon from '@mui/icons-material/HexagonOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useStore } from '../store';
import type { ElementState, Mode } from '../store';
import { ACCENT } from '../theme';

export function TopBar() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const elementState = useStore((s) => s.elementState);
  const setElementState = useStore((s) => s.setElementState);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);

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
        >
          <ToggleButton value="default" sx={{ px: 1.5 }}>Default</ToggleButton>
          <ToggleButton value="pressed" sx={{ px: 1.5 }}>Pressed</ToggleButton>
          <ToggleButton value="disabled" sx={{ px: 1.5 }}>Disabled</ToggleButton>
        </ToggleButtonGroup>

        <Button
          variant="contained"
          startIcon={<FileDownloadOutlinedIcon />}
          endIcon={<KeyboardArrowDownIcon />}
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchor)}
          sx={{ ml: 1 }}
        >
          Export
        </Button>
        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={close}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={close}>SVG</MenuItem>
          <MenuItem onClick={close}>PNG</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
