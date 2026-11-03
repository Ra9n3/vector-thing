import { Box, Chip, ToggleButtonGroup } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useStore } from '../store';
import { TipToggle } from './TipToggle';
import { LeafStrip } from './LeafStrip';
import type { Element } from '../selection/types';

export function MatchToggle({leaves}:{leaves:Element[]}) {
  const matchMode=useStore(s=>s.matchMode), setMatchMode=useStore(s=>s.setMatchMode);
  if(leaves.length<2) return null;
  return <Box sx={{px:2,py:1.25,borderBottom:1,borderColor:'divider'}}>
    <Box sx={{display:'flex',alignItems:'center',gap:1}}>
      <ToggleButtonGroup exclusive value={matchMode?'match':'individual'} aria-label="Selection mode" onChange={(_,v:string|null)=>{if(v)setMatchMode(v==='match')}}>
        <TipToggle value="match" tip="Match"><LinkIcon fontSize="small"/></TipToggle>
        <TipToggle value="individual" tip="Individual"><LinkOffIcon fontSize="small"/></TipToggle>
      </ToggleButtonGroup>
      <Chip aria-label={`${leaves.length} selected`} label={leaves.length} size="small" />
    </Box>
    {!matchMode && <LeafStrip leaves={leaves}/>}
  </Box>;
}
