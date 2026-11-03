import {Box,IconButton,Slider,TextField,Tooltip} from '@mui/material';
import DrawIcon from '@mui/icons-material/Draw';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ClearIcon from '@mui/icons-material/Clear';
import FlipIcon from '@mui/icons-material/Flip';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAddOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import {useStore} from '../store';
import type {ProfileSettings} from '../profiles/types';
export function CustomProfileControls({profile,disabled}:{profile:ProfileSettings;disabled:boolean}) {
 const draw=useStore(s=>s.drawProfile),toggle=useStore(s=>s.setDrawProfile),set=useStore(s=>s.setCustomProfile);
 const undo=useStore(s=>s.undo),redo=useStore(s=>s.redo),reset=useStore(s=>s.setSideProfile),save=useStore(s=>s.saveProfilePreset);
 const presets=useStore(s=>s.userProfiles),rename=useStore(s=>s.renameProfilePreset),remove=useStore(s=>s.deleteProfilePreset);
 const custom=profile.kind==='custom'?profile.custom:undefined;
 return <Box sx={{display:'grid',gap:1}}>
  <Box sx={{display:'flex',gap:.5}}>
   <Tooltip title="Draw profile"><span><IconButton aria-label="Draw profile" color={draw?'primary':'default'} disabled={disabled} onClick={()=>toggle(!draw)}><DrawIcon fontSize="small"/></IconButton></span></Tooltip>
   <Tooltip title="Undo"><IconButton aria-label="Undo" onClick={undo}><UndoIcon fontSize="small"/></IconButton></Tooltip>
   <Tooltip title="Redo"><IconButton aria-label="Redo" onClick={redo}><RedoIcon fontSize="small"/></IconButton></Tooltip>
   <Tooltip title="Clear custom profile"><span><IconButton aria-label="Clear custom profile" disabled={!custom||disabled} onClick={()=>reset(profile.preset)}><ClearIcon fontSize="small"/></IconButton></span></Tooltip>
   <Tooltip title="Mirror"><span><IconButton aria-label="Mirror" color={custom?.mirror?'primary':'default'} disabled={!custom||disabled} onClick={()=>custom&&set({...custom,mirror:!custom.mirror},true)}><FlipIcon fontSize="small"/></IconButton></span></Tooltip>
   <Tooltip title="Save preset"><span><IconButton aria-label="Save preset" disabled={!custom||disabled} onClick={()=>custom&&save(custom)}><BookmarkAddIcon fontSize="small"/></IconButton></span></Tooltip>
  </Box>
  <Tooltip title="Smooth"><span><Slider aria-label="Smooth" disabled={!custom||disabled} min={0} max={1} step={.01} value={custom?.smooth??.5} onChange={(_,v)=>custom&&set({...custom,smooth:v as number},false)} onChangeCommitted={(_,v)=>custom&&set({...custom,smooth:v as number},true)} valueLabelDisplay="auto"/></span></Tooltip>
  {presets.map(p=><Box key={p.id} sx={{display:'flex',alignItems:'center'}}><TextField aria-label="Preset name" size="small" defaultValue={p.name} key={`${p.id}:${p.name}`} onBlur={e=>rename(p.id,e.target.value)} onKeyDown={e=>{if(e.key==='Enter')(e.target as HTMLElement).blur();}}/><Tooltip title="Delete preset"><IconButton aria-label="Delete preset" onClick={()=>remove(p.id)}><DeleteIcon fontSize="small"/></IconButton></Tooltip></Box>)}
 </Box>;
}
