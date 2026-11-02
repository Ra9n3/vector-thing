import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { TopBar } from './components/TopBar';
import { LibraryPanel } from './components/LibraryPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Canvas } from './components/Canvas';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
          <LibraryPanel />
          <Canvas />
          <PropertiesPanel />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
