import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Drawer,
  IconButton,
  Tooltip,
  Slider,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AllOutIcon from '@mui/icons-material/AllOut';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { uniform, useStore } from '../store';
import { materialId, resolveMaterial } from '../materials/resolve';
import { resolveStyle } from '../styles/catalog';
import { StyleSelect } from './StyleSelect';
import { MaterialSwatch } from './MaterialSwatch';
import { MaterialPicker } from './MaterialPicker';
import { ColorOverride } from './ColorOverride';
import type { Look, ShapeType, Element } from '../store';
import type { ProfilePresetId, ProfileSettings } from '../profiles/types';
import { PRESETS } from '../profiles/presets';
import { resolveMode } from '../profiles/sample';
import { DirectionPad } from './DirectionPad';
import { LookIcon } from './LookIcon';
import { TipToggle } from './TipToggle';
import { SHAPE_ICONS } from './icons/ShapeIcons';
import { ProfileIcon } from './icons/ProfileIcon';
import { leavesOf, resolveTargets } from '../selection/targets';
import { MatchToggle } from './MatchToggle';
import { PanelHeaderActions } from './PanelHeaderActions';

export const PROPERTIES_WIDTH = 280;
const EMPTY_ELEMENTS:Element[]=[];
const SIZE_MIN = 16;
const SIZE_MAX = 640;

const SHAPES: { value: ShapeType; tip: string }[] = [
  { value: 'rect', tip: 'Rectangle' },
  { value: 'rounded', tip: 'Rounded' },
  { value: 'circle', tip: 'Circle' },
  { value: 'pill', tip: 'Pill' },
  { value: 'hexagon', tip: 'Hexagon' },
];


function Section({ label, labelTooltip, mixed, action, children }: { label: string; labelTooltip?: string; mixed?: boolean; action?: ReactNode; children: ReactNode }) {
  return (
    <Box component="section" sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, minHeight: 20 }}>
        <Tooltip title={labelTooltip ?? ''}><Typography variant="overline" color="text.secondary">{label}</Typography></Tooltip>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{mixed && <Chip size="small" label="Mixed" sx={{ height: 18, fontSize: 10 }} />}{action}</Box>
      </Box>
      {children}
    </Box>
  );
}

export function PropertiesPanel() {
  const look = useStore((s) => s.look);
  const setLook = useStore((s) => s.setLook);
  const properties = useStore((s) => s.properties);
  const styleId = useStore((s) => s.styleId);
  const palette = resolveStyle(styleId).palette;
  const elements = useStore((s) => s.selection.length ? s.elements : EMPTY_ELEMENTS);
  const selection = useStore((s) => s.selection);
  const groups = useStore((s) => s.groups);
  const matchMode = useStore((s) => s.matchMode);
  const activeId = useStore((s) => s.activeId);
  const setShapeType = useStore((s) => s.setShapeType);
  const setSideProfile = useStore((s) => s.setSideProfile);
  const setProfileMode = useStore((s) => s.setProfileMode);
  const setProfileAxis = useStore((s) => s.setProfileAxis);
  const setMaterial = useStore((s) => s.setMaterial);
  const setSize = useStore((s) => s.setSize);
  const setWall = useStore((s) => s.setWall);

  const leaves = useMemo(() => leavesOf(selection,elements,groups), [selection,elements,groups]);
  const sel = useMemo(() => { const ids=new Set(resolveTargets(selection,elements,groups,matchMode,activeId)); return elements.filter(e=>ids.has(e.id)); }, [selection,elements,groups,matchMode,activeId]);

  const mainGroup = matchMode && selection.length===1 && groups.some(g=>g.id===selection[0] && g.template);
  const colorIds=useMemo(()=>new Set(resolveTargets(selection,elements,groups,matchMode,activeId,e=>!!e.main)),[selection,elements,groups,matchMode,activeId]);
  const colorSel=useMemo(()=>elements.filter(e=>colorIds.has(e.id)),[elements,colorIds]);
  const has = sel.length > 0;
  const inactive = !has;

  // Values reflect the selection; undefined means the selected elements differ.
  const shape = has ? uniform(sel.map((e) => e.type)) : properties.shape;
  const profile = has ? uniform(sel.map((e) => e.props.profile.preset)) : properties.profile.preset;
  const profileMode = has ? uniform(sel.map((e) => e.props.profile.mode)) : properties.profile.mode;
  const profileAxis = has ? uniform(sel.map((e) => e.props.profile.acrossAxis)) : properties.profile.acrossAxis;
  const resolvedMode = has
    ? uniform(sel.map((e) => resolveMode(e.props.profile, e.type)))
    : resolveMode(properties.profile, properties.shape);
  const material = has ? uniform(colorSel.map((e) => e.props.material)) : properties.material;
  const wall = has ? uniform(sel.map((e) => e.props.profile.wall ?? 1)) : 1;
  const sizes = sel.map((e) => Math.round(Math.max(e.width, e.height)));
  const size = has ? uniform(sizes) : properties.size;
  const groupSize = mainGroup && sel.length ? Math.max(Math.max(...sel.map(e=>e.x+e.width))-Math.min(...sel.map(e=>e.x)),Math.max(...sel.map(e=>e.y+e.height))-Math.min(...sel.map(e=>e.y))) : undefined;
  const sizeShown = groupSize ?? size ?? (has ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length) : SIZE_MIN);

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
        <PanelHeaderActions />
        <MatchToggle leaves={leaves} />
        <StyleSelect />
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
            onChange={(event, v: ProfilePresetId | null) => {
              const preset = v ?? (event.currentTarget as HTMLButtonElement).value as ProfilePresetId;
              if (preset) setSideProfile(preset);
            }}
            aria-label="Side profile"
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}
          >
            {PRESETS.map(({ id: value, label }) => {
              return (
                <TipToggle
                  key={value}
                  value={value}
                  tip={label}
                  disabled={inactive}
                  sx={{ width: '100%', height: 36, p: 0 }}
                >
                  <ProfileIcon preset={value} />
                </TipToggle>
              );
            })}
          </ToggleButtonGroup>
        </Section>

        <Section label="Material" labelTooltip={mainGroup ? "Main parts" : undefined} mixed={has && material === undefined} action={<MaterialPicker disabled={inactive} />}>
          <ToggleButtonGroup
            exclusive
            disabled={inactive}
            value={material && palette.some((entry) => materialId(entry) === material) ? material : null}
            onChange={(_, v: string | null) => v && setMaterial(v)}
            aria-label="Material"
            sx={{ flexWrap: 'wrap' }}
          >
            {palette.map((entry) => { const m = resolveMaterial(entry); return (
              <TipToggle
                key={m.id}
                value={m.id}
                tip={m.label}
                disabled={inactive}
                sx={{ width: 32, height: 32, p: 0, borderRadius: '50% !important' }}
              >
                <MaterialSwatch material={m} disabled={inactive} />
              </TipToggle>
            ); })}
          </ToggleButtonGroup>
        </Section>

        <Section label="Look">
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={look}
            onChange={(_, v: Look | null) => v && setLook(v)}
            aria-label="Look"
            sx={{ '& > span': { flex: 1 }, '& button': { width: '100%' } }}
          >
            {([['flat', 'Flat'], ['slight', 'Slight 3D'], ['strong', 'Strong 3D']] as const).map(([value, tip]) =>
              <TipToggle key={value} value={value} tip={tip} sx={{ flex:1 }}><LookIcon look={value} /></TipToggle>)}
          </ToggleButtonGroup>
        </Section>

        <Section label="View">
          <DirectionPad />
        </Section>

        <Section label="Size" mixed={has && !mainGroup && size === undefined}>
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
            <AccordionDetails sx={{ minHeight: 48, display: 'grid', gap: 1.5 }}>
              <ColorOverride selected={colorSel} mainParts={mainGroup} />
              {has && <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="overline" color="text.secondary">Wall</Typography>
                  <Tooltip title="Reset wall"><IconButton aria-label="Reset wall" size="small" disabled={wall === 1} onClick={() => setWall(1)}><RestartAltIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
                <Tooltip title="Wall height"><Slider aria-label="Wall" min={0} max={2} step={0.01} value={wall ?? 1} onChange={(_, value) => setWall(value as number)} valueLabelDisplay="auto" /></Tooltip>
              </Box>}
              <Box>
                <Typography variant="overline" color="text.secondary">Mode</Typography>
                <ToggleButtonGroup exclusive fullWidth disabled={inactive} value={profileMode ?? null} sx={{ '& > span': { flex: 1 }, '& button': { width: '100%' } }}
                  onChange={(_, v: ProfileSettings['mode'] | null) => v && setProfileMode(v)} aria-label="Profile mode">
                  <TipToggle value="auto" tip="Auto" disabled={inactive} sx={{ flex: 1 }}><AutoAwesomeIcon fontSize="small" /></TipToggle>
                  <TipToggle value="around" tip="Around" disabled={inactive} sx={{ flex: 1 }}><AllOutIcon fontSize="small" /></TipToggle>
                  <TipToggle value="across" tip="Across" disabled={inactive} sx={{ flex: 1 }}><ViewStreamIcon fontSize="small" /></TipToggle>
                </ToggleButtonGroup>
              </Box>
              {resolvedMode === 'across' && <Box>
                <Typography variant="overline" color="text.secondary">Axis</Typography>
                <ToggleButtonGroup exclusive fullWidth disabled={inactive} value={profileAxis ?? null} sx={{ '& > span': { flex: 1 }, '& button': { width: '100%' } }}
                  onChange={(_, v: ProfileSettings['acrossAxis'] | null) => v && setProfileAxis(v)} aria-label="Across axis">
                  <TipToggle value="vertical" tip="Vertical" disabled={inactive} sx={{ flex: 1 }}><SwapVertIcon fontSize="small" /></TipToggle>
                  <TipToggle value="horizontal" tip="Horizontal" disabled={inactive} sx={{ flex: 1 }}><SwapHorizIcon fontSize="small" /></TipToggle>
                </ToggleButtonGroup>
              </Box>}
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Drawer>
  );
}
