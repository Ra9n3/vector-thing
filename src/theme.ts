import { createTheme, alpha } from '@mui/material/styles';

export const ACCENT = '#8b7cff';
const BG = '#121316';
const PANEL = '#18191d';
const SURFACE = '#202228';
const BORDER = 'rgba(255,255,255,0.08)';
const RADIUS = 10;

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: ACCENT },
    background: { default: BG, paper: PANEL },
    text: { primary: '#e6e7ea', secondary: '#8b8f98' },
    divider: BORDER,
  },
  shape: { borderRadius: RADIUS },
  spacing: 8,
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: 12,
    button: { textTransform: 'none', fontWeight: 500, fontSize: 12 },
    overline: { fontSize: 10, letterSpacing: '0.08em', fontWeight: 600, lineHeight: 1.4 },
    subtitle2: { fontSize: 12, fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': { height: '100%', overflow: 'hidden' },
        body: { backgroundColor: BG },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'default' },
      styleOverrides: {
        root: {
          backgroundColor: PANEL,
          backgroundImage: 'none',
          borderBottom: `1px solid ${BORDER}`,
        },
      },
    },
    MuiToolbar: {
      defaultProps: { variant: 'dense' },
      styleOverrides: { dense: { minHeight: 48 } },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: PANEL, backgroundImage: 'none', borderColor: BORDER },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, size: 'small' },
      styleOverrides: {
        root: { borderRadius: RADIUS, padding: '5px 12px' },
        outlined: {
          borderColor: BORDER,
          color: '#e6e7ea',
          '&:hover': { borderColor: alpha(ACCENT, 0.6), backgroundColor: alpha(ACCENT, 0.08) },
        },
        contained: { backgroundColor: ACCENT, color: '#0e0d17', '&:hover': { backgroundColor: '#a094ff' } },
      },
    },
    MuiIconButton: { defaultProps: { size: 'small' } },
    MuiToggleButtonGroup: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          gap: 4,
          '&& .MuiToggleButtonGroup-grouped': {
            margin: 0,
            border: `1px solid ${BORDER}`,
            borderRadius: RADIUS,
          },
          '&& .MuiToggleButtonGroup-grouped.Mui-selected': {
            borderColor: ACCENT,
          },
        },
      },
    },
    MuiToggleButton: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          color: '#a3a7b0',
          border: `1px solid ${BORDER}`,
          borderRadius: RADIUS,
          backgroundColor: 'transparent',
          padding: '5px 10px',
          lineHeight: 1.4,
          transition: 'background-color .12s, border-color .12s, color .12s',
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
          '&.Mui-selected': {
            color: '#fff',
            borderColor: ACCENT,
            backgroundColor: alpha(ACCENT, 0.18),
            '&:hover': { backgroundColor: alpha(ACCENT, 0.26) },
          },
          '&.Mui-disabled': {
            color: 'rgba(255,255,255,0.22)',
            borderColor: 'rgba(255,255,255,0.05)',
          },
          '&.Mui-selected.Mui-disabled': {
            color: 'rgba(255,255,255,0.4)',
            borderColor: alpha(ACCENT, 0.3),
            backgroundColor: alpha(ACCENT, 0.08),
          },
        },
        sizeSmall: { padding: '5px 10px' },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 32 },
        indicator: { backgroundColor: ACCENT, height: 2, borderRadius: 2 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { minHeight: 32, padding: '6px 10px', fontSize: 12, textTransform: 'none' },
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: { backgroundColor: SURFACE, borderColor: BORDER, borderRadius: RADIUS },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: { '&.Mui-focusVisible .MuiCardActionArea-focusHighlight': { opacity: 0.08 } },
      },
    },
    MuiSlider: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: { height: 4 },
        rail: { opacity: 0.2 },
        thumb: {
          width: 14,
          height: 14,
          backgroundColor: '#fff',
          border: `2px solid ${ACCENT}`,
          '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 6px ${alpha(ACCENT, 0.2)}` },
        },
      },
    },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0, square: true },
      styleOverrides: {
        root: {
          backgroundColor: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: RADIUS,
          '&::before': { display: 'none' },
          '&:first-of-type, &:last-of-type': { borderRadius: RADIUS },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: { minHeight: 36, padding: '0 12px' },
        content: { margin: '8px 0' },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { backgroundColor: SURFACE, border: `1px solid ${BORDER}`, marginTop: 4 },
        list: { padding: 4 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { borderRadius: 8, minHeight: 30, fontSize: 12 },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true, enterDelay: 400 },
      styleOverrides: {
        tooltip: {
          backgroundColor: '#2b2d35',
          border: `1px solid ${BORDER}`,
          fontSize: 11,
          padding: '4px 8px',
          borderRadius: 8,
        },
        arrow: { color: '#2b2d35' },
      },
    },
  },
});
