import {Box,Button,IconButton,Slider,TextField,ToggleButton,ToggleButtonGroup,Tooltip} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import type {BooleanOperation} from '../boolean/polygon';
import {normalizeRepeat,REPEAT_PRESETS} from '../repeat/repeat';
import type {RepeatMetadata} from '../repeat/repeat';
interface Props {
 selectedCount:number;
 repeat:RepeatMetadata|null;
 onCombine:(operation:BooleanOperation)=>void;
 onCreateRepeat:(mode:'linear'|'radial')=>RepeatMetadata;
 onChangeRepeat:(repeat:RepeatMetadata,commit:boolean)=>void;
 onDetach:()=>void;
}
/** Place in the collapsed Customize accordion after its selection model supports paths/repeats. */
export function BooleanRepeatControls({selectedCount,repeat,onCombine,onCreateRepeat,onChangeRepeat,onDetach}:Props) {
 const canRepeat=selectedCount===1, active=repeat?normalizeRepeat(repeat):null;
 const apply=(next:RepeatMetadata,commit=true)=>onChangeRepeat(normalizeRepeat(next),commit);
 const setMode=(mode:'linear'|'radial')=>{if(!canRepeat)return;const next=active?.mode===mode?active:onCreateRepeat(mode);apply(next);};
 const numeric=(label:string,value:number,update:(n:number)=>void)=><Tooltip title={label}><TextField type="number" size="small" aria-label={label} value={value} onChange={e=>{const n=Number(e.target.value);if(Number.isFinite(n))update(n);}}/></Tooltip>;
 return <Box sx={{display:'grid',gap:1}}>
  <Box sx={{display:'flex'}}>
   <Tooltip title="Union"><span><IconButton aria-label="Union" disabled={selectedCount<2} onClick={()=>onCombine('union')}><AddIcon fontSize="small"/></IconButton></span></Tooltip>
   <Tooltip title="Subtract"><span><IconButton aria-label="Subtract" disabled={selectedCount<2} onClick={()=>onCombine('subtract')}><RemoveIcon fontSize="small"/></IconButton></span></Tooltip>
   <Tooltip title="Intersect"><span><IconButton aria-label="Intersect" disabled={selectedCount<2} onClick={()=>onCombine('intersect')}><FilterCenterFocusIcon fontSize="small"/></IconButton></span></Tooltip>
  </Box>
  <ToggleButtonGroup exclusive size="small" value={active?.mode??null} disabled={!canRepeat} onChange={(_,mode:'linear'|'radial'|null)=>mode&&setMode(mode)} aria-label="Repeat mode">
   <Tooltip title="Linear"><ToggleButton value="linear" aria-label="Linear">Linear</ToggleButton></Tooltip><Tooltip title="Radial"><ToggleButton value="radial" aria-label="Radial">Radial</ToggleButton></Tooltip>
  </ToggleButtonGroup>
  {active&&<>
   <Tooltip title="Count"><Slider aria-label="Count" min={2} max={active.mode==='linear'?20:36} step={1} value={active.count} onChange={(_,v)=>apply({...active,count:v as number},false)} onChangeCommitted={(_,v)=>apply({...active,count:v as number},true)} valueLabelDisplay="auto"/></Tooltip>
   {active.mode==='linear'?<Box sx={{display:'flex',gap:1}}>{numeric('X',active.dx,n=>apply({...active,dx:n}))}{numeric('Y',active.dy,n=>apply({...active,dy:n}))}</Box>:<>
    {([['Radius','radius',0,300],['Start','start',-360,360],['Sweep','sweep',-360,360]] as const).map(([label,key,min,max])=><Tooltip key={key} title={label}><Slider aria-label={label} min={min} max={max} value={active[key]} onChange={(_,v)=>apply({...active,[key]:v as number},false)} onChangeCommitted={(_,v)=>apply({...active,[key]:v as number},true)} valueLabelDisplay="auto"/></Tooltip>)}
   </>}
   <Tooltip title="Detach"><IconButton aria-label="Detach" onClick={onDetach}><CallSplitIcon fontSize="small"/></IconButton></Tooltip>
  </>}
  <Box sx={{display:'flex',flexWrap:'wrap',gap:.5}}>{(['ticks','spokes','grip','ribs'] as const).map(name=><Tooltip key={name} title={name[0].toUpperCase()+name.slice(1)}><span><Button size="small" disabled={!canRepeat} onClick={()=>{const preset=REPEAT_PRESETS[name];const next=onCreateRepeat(preset.mode);apply({...next,...preset} as RepeatMetadata);}}>{name[0].toUpperCase()+name.slice(1)}</Button></span></Tooltip>)}</Box>
 </Box>;
}
