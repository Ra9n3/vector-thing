import { useState } from 'react';
import type { DragEvent, ReactElement } from 'react';
import { Box, Card, CardActionArea, Drawer, Tab, Tabs, Typography } from '@mui/material';
import SmartButtonOutlinedIcon from '@mui/icons-material/SmartButtonOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { useStore } from '../store';
import { LIBRARY_DRAG_TYPE, placeLibraryItem } from '../library';
import { useViewport } from '../canvas/useViewport';
import { ACCENT } from '../theme';

export const LIBRARY_WIDTH = 220;

const CATEGORIES = [
  { id: 'buttons', label: 'Buttons', icon: <SmartButtonOutlinedIcon fontSize="small" /> },
  { id: 'knobs', label: 'Knobs', icon: <RadioButtonCheckedIcon fontSize="small" /> },
  { id: 'faders', label: 'Faders', icon: <TuneOutlinedIcon fontSize="small" /> },
  { id: 'toggles', label: 'Toggles', icon: <ToggleOnOutlinedIcon fontSize="small" /> },
  { id: 'cards', label: 'Cards', icon: <CreditCardOutlinedIcon fontSize="small" /> },
  { id: 'badges', label: 'Badges', icon: <NewReleasesOutlinedIcon fontSize="small" /> },
] as const;

const TILE_ICONS: Record<string, ReactElement> = {
  buttons: <SmartButtonOutlinedIcon />,
  knobs: <RadioButtonCheckedIcon />,
  faders: <LinearScaleIcon />,
  toggles: <ToggleOnOutlinedIcon />,
  cards: <CreditCardOutlinedIcon />,
  badges: <NewReleasesOutlinedIcon />,
};

const TILE_COUNT = 6;

export function LibraryPanel() {
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const selected = useStore((s) => s.selectedLibraryItem);
  const setSelected = useStore((s) => s.setSelectedLibraryItem);
  const mode = useStore((s) => s.mode);
  const current = CATEGORIES.find((c) => c.id === category)!;

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: LIBRARY_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: LIBRARY_WIDTH,
          position: 'relative',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={category}
          onChange={(_, v: string) => setCategory(v)}
          variant="scrollable"
          scrollButtons={false}
          aria-label="Category"
        >
          {CATEGORIES.map((c) => (
            <Tab key={c.id} value={c.id} label={c.label} />
          ))}
        </Tabs>
      </Box>

      <Box
        sx={{
          p: 1.5,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1,
          overflowY: 'auto',
          alignContent: 'start',
        }}
      >
        {Array.from({ length: TILE_COUNT }, (_, i) => {
          const id = `${current.id}-${i + 1}`;
          const isSelected = selected === id;
          return (
            <Card
              key={id}
              sx={{
                borderColor: isSelected ? ACCENT : 'divider',
                backgroundColor: isSelected ? 'rgba(139,124,255,0.16)' : undefined,
              }}
            >
              <CardActionArea
                component="div"
                draggable
                onDragStart={(e: DragEvent) => {
                  setSelected(id);
                  e.dataTransfer.setData(LIBRARY_DRAG_TYPE, id);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => {
                  if (mode === 'face') {
                    const c = useViewport.getState().visibleCenter();
                    placeLibraryItem(id, c.x, c.y);
                  } else {
                    setSelected(id);
                  }
                }}
                aria-pressed={isSelected}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.75,
                  py: 1.5,
                  px: 0.5,
                  color: isSelected ? '#fff' : 'text.secondary',
                }}
              >
                {i % 2 === 0 || current.id !== 'toggles' ? (
                  TILE_ICONS[current.id]
                ) : (
                  <CheckBoxOutlineBlankIcon />
                )}
                <Typography variant="caption" noWrap sx={{ maxWidth: '100%', color: 'inherit' }}>
                  {`${current.label.replace(/s$/, '')} ${i + 1}`}
                </Typography>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Drawer>
  );
}
