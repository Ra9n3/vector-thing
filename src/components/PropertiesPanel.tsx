import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Drawer,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MATERIALS, uniform, useStore } from '../store';
import type { Look, ShapeType, SideProfile } from '../store';
import { DirectionPad } from './DirectionPad';
import { TipToggle } from './TipToggle';
import { SHAPE_ICONS } from './icons/ShapeIcons';
import { PROFILE_ICONS, PROFILE_LABELS } from './icons/ProfileIcons';

export const PROPERTIES_WIDTH = 280;
const SIZE_MIN = 16;
const SIZE_MAX = 640;

const SHAPES: { value: ShapeType; tip: string }[] = [
  { value: 'rect', tip: 'Rectangle' },
  { value: 'rounded', tip: 'Rounded' },
  { value: 'circle', tip: 'Circle' },
  { value: 'pill', tip: 'Pill' },
  { value: 'hexagon', tip: 'Hexagon' },
];

const PROFILES = Object.keys(PROFILE_LABELS) as SideProfile[];

function Section({ label, mixed, children }: { label: string; mixed?: boolean; children: ReactNode }) {
  return (
    <Box component="section" sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, minHeight: 20 }}>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        {mixed && <Chip size="small" label="Mixed" sx={{ height: 18, fontSize: 10 }} />}
      </Box>
      {children}
    </Box>
  );
}

export function PropertiesPanel() {
  const look = useStore((s) => s.look);
  const setLook = useStore((s) => s.setLook);
  const properties = useStore((s) => s.properties);
  const elements = useStore((s) => s.elements);
  const selection = useStore((s) => s.selection);
  const setShapeType = useStore((s) => s.setShapeType);
  const setSideProfile = useStore((s) => s.setSideProfile);
  const setMaterial = useStore((s) => s.setMaterial);
  const setSize = useStore((s) => s.setSize);

  const sel = useMemo(() => {
    const set = new Set(selection);
    return elements.filter((e) => set.has(e.id));
  }, [elements, selection]);

  const has = sel.length > 0;
  const inactive = !has;
  const padDisabled = inactive || look === 'flat';

  // Values reflect the selection; undefined means the selected elements differ.
  const shape = has ? uniform(sel.map((e) => e.type)) : properties.shape;
  const profile = has ? uniform(sel.map((e) => e.props.sideProfile)) : properties.sideProfile;
  const material = has ? uniform(sel.map((e) => e.props.material)) : properties.material;
  const sizes = sel.map((e) => Math.round(Math.max(e.width, e.height)));
  const size = has ? uniform(sizes) : properties.size;
  const sizeShown = size ?? (has ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length) : SIZE_MIN);

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width: PROPERTIES_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: PROPERTIES_WIDTH,
          position: 'relative',
          borderLeft: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ overflowY: 'auto', flex: 1 }}>
        <Section label="Shape" mixed={has && shape === undefined}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            disabled={inactive}
            value={shape ?? null}
            onChange={(_, v: ShapeType | null) => v && setShapeType(v)}
            aria-label="Shape"
          >
            {SHAPES.map(({ value, tip }) => {
              const Icon = SHAPE_ICONS[value];
              return (
                <TipToggle key={value} value={value} tip={tip} disabled={inactive} sx={{ flex: 1, py: 0.75 }}>
                  <Icon />
                </TipToggle>
              );
            })}
          </ToggleButtonGroup>
        </Section>

        <Section label="Side" mixed={has && profile === undefined}>
          <ToggleButtonGroup
            exclusive
            disabled={inactive}
            value={profile ?? null}
            onChange={(_, v: SideProfile | null) => v && setSideProfile(v)}
            aria-label="Side profile"
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}
          >
            {PROFILES.map((value) => {
              const Icon = PROFILE_ICONS[value];
              return (
                <TipToggle
                  key={value}
                  value={value}
                  tip={PROFILE_LABELS[value]}
                  disabled={inactive}
                  sx={{ width: '100%', height: 36, p: 0 }}
                >
                  <Icon />
                </TipToggle>
              );
            })}
          </ToggleButtonGroup>
        </Section>

        <Section label="Material" mixed={has && material === undefined}>
          <ToggleButtonGroup
            exclusive
            disabled={inactive}
            value={material ?? null}
            onChange={(_, v: string | null) => v && setMaterial(v)}
            aria-label="Material"
            sx={{ flexWrap: 'wrap' }}
          >
            {MATERIALS.map((m) => (
              <TipToggle
                key={m.id}
                value={m.id}
                tip={m.label}
                disabled={inactive}
                sx={{ width: 32, height: 32, p: 0, borderRadius: '50% !important' }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: m.color,
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
                    opacity: inactive ? 0.4 : 1,
                  }}
                />
              </TipToggle>
            ))}
          </ToggleButtonGroup>
        </Section>

        <Section label="Look">
          <ToggleButtonGroup
            exclusive
            fullWidth
            disabled={inactive}
            value={look}
            onChange={(_, v: Look | null) => v && setLook(v)}
            aria-label="Look"
          >
            <ToggleButton value="flat">Flat</ToggleButton>
            <ToggleButton value="slight">Slight 3D</ToggleButton>
            <ToggleButton value="strong">Strong 3D</ToggleButton>
          </ToggleButtonGroup>
        </Section>

        <Section label="View">
          <DirectionPad disabled={padDisabled} />
        </Section>

        <Section label="Size" mixed={has && size === undefined}>
          <Slider
            disabled={inactive}
            min={SIZE_MIN}
            max={SIZE_MAX}
            value={Math.min(SIZE_MAX, Math.max(SIZE_MIN, sizeShown))}
            onChange={(_, v) => setSize(v as number)}
            aria-label="Size"
            valueLabelDisplay="auto"
            sx={{ display: 'block', mx: 'auto', width: 'calc(100% - 12px)' }}
          />
        </Section>

        <Box sx={{ px: 2, py: 1.5 }}>
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
              <Typography variant="overline" color="text.secondary">
                Customize
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ minHeight: 48 }} />
          </Accordion>
        </Box>
      </Box>
    </Drawer>
  );
}
