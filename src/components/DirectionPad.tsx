import type { ReactElement } from 'react';
import { ToggleButtonGroup } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import NorthWestIcon from '@mui/icons-material/NorthWest';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import AdjustIcon from '@mui/icons-material/Adjust';
import { useStore } from '../store';
import type { Direction } from '../store';
import { TipToggle } from './TipToggle';

const CELLS: { value: Direction; tip: string; icon: ReactElement }[] = [
  { value: 'nw', tip: 'Up left', icon: <NorthWestIcon /> },
  { value: 'n', tip: 'Up', icon: <ArrowUpwardIcon /> },
  { value: 'ne', tip: 'Up right', icon: <NorthEastIcon /> },
  { value: 'w', tip: 'Left', icon: <ArrowBackIcon /> },
  { value: 'c', tip: 'Straight on', icon: <AdjustIcon /> },
  { value: 'e', tip: 'Right', icon: <ArrowForwardIcon /> },
  { value: 'sw', tip: 'Down left', icon: <SouthWestIcon /> },
  { value: 's', tip: 'Down', icon: <ArrowDownwardIcon /> },
  { value: 'se', tip: 'Down right', icon: <SouthEastIcon /> },
];

export function DirectionPad({ disabled }: { disabled?: boolean }) {
  const direction = useStore((s) => s.direction);
  const setDirection = useStore((s) => s.setDirection);

  return (
    <ToggleButtonGroup
      exclusive
      disabled={disabled}
      value={direction}
      onChange={(_, v: Direction | null) => v && setDirection(v)}
      aria-label="View direction"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 40px)',
        gridAutoRows: 40,
        gap: 0.5,
        justifyContent: 'start',
      }}
    >
      {CELLS.map((c) => (
        <TipToggle
          key={c.value}
          value={c.value}
          tip={c.tip}
          disabled={disabled}
          sx={{ width: 40, height: 40, p: 0 }}
        >
          {c.icon}
        </TipToggle>
      ))}
    </ToggleButtonGroup>
  );
}

