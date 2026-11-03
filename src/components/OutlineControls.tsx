import {Box,IconButton,Slider,Tooltip} from '@mui/material';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GridOnIcon from '@mui/icons-material/GridOn';
import FlipIcon from '@mui/icons-material/Flip';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import type {Element} from '../selection/types';
import {useStore} from '../store';
import {useOutlineEditor} from '../outline/editorState';
import {presetOutline} from '../outline/presets';
import type {OutlineData} from '../outline/types';
export function OutlineControls({selected}:{selected:Element[]}) {
 const el=selected.length===1?selected[0]:undefined,editor=useOutlineEditor(),convert=useStore(s=>s.convertToOutline),setOutline=useStore(s=>s.setOutline);
 const active=!!el&&el.type==='path'&&editor.id===el.id,outline=el?.outline,node=active&&editor.node!==null?outline?.nodes[editor.node]:undefined,edge=active&&editor.edge!==null?outline?.nodes[editor.edge]:undefined;
 const update=(next:OutlineData,commit=true)=>{if(el)setOutline(el.id,next,commit);};
 const updateNode=(index:number,patch:Partial<OutlineData['nodes'][number]>,commit=true)=>{if(outline)update({...outline,preset:undefined,nodes:outline.nodes.map((n,i)=>i===index?{...n,...patch}:n)},commit);};
 const toggle=(label:string,on:boolean,fn:()=>void,icon:React.ReactNode)=><Tooltip title={label}><IconButton aria-label={label} color={on?'primary':'default'} size="small" onClick={fn}>{icon}</IconButton></Tooltip>;
 return <Box sx={{display:'grid',gap:1}}>
  <Tooltip title={el?'Edit outline':'Select one shape'}><span><IconButton aria-label="Edit outline" size="small" disabled={!el} color={active?'primary':'default'} onClick={()=>{if(!el)return;if(active)editor.setId(null);else{convert(el.id);editor.setId(el.id);}}}><EditOutlinedIcon fontSize="small"/></IconButton></span></Tooltip>
  {outline?.preset==='polygon'&&<Tooltip title="Sides"><Slider aria-label="Sides" min={3} max={12} step={1} value={outline.sides??6} onChange={(_,v)=>update(presetOutline('polygon',v as number),false)} onChangeCommitted={(_,v)=>update(presetOutline('polygon',v as number),true)} valueLabelDisplay="auto"/></Tooltip>}
  {outline?.preset==='star'&&<>
   <Tooltip title="Points"><Slider aria-label="Points" min={3} max={12} step={1} value={outline.points??6} onChange={(_,v)=>update(presetOutline('star',v as number,outline.innerRatio),false)} onChangeCommitted={(_,v)=>update(presetOutline('star',v as number,outline.innerRatio),true)} valueLabelDisplay="auto"/></Tooltip>
   <Tooltip title="Inner ratio"><Slider aria-label="Inner ratio" min={.3} max={.9} step={.01} value={outline.innerRatio??.5} onChange={(_,v)=>update(presetOutline('star',outline.points,v as number),false)} onChangeCommitted={(_,v)=>update(presetOutline('star',outline.points,v as number),true)} valueLabelDisplay="auto"/></Tooltip>
  </>}
  {active&&<Box sx={{display:'flex',gap:.5}}>
   {toggle('Pen',editor.pen,()=>editor.setPen(!editor.pen),<CreateOutlinedIcon fontSize="small"/>)}
   {toggle('Snap to grid',editor.grid,()=>editor.setGrid(!editor.grid),<GridOnIcon fontSize="small"/>)}
   {toggle('Mirror horizontal',editor.mirrorX,()=>editor.setMirrorX(!editor.mirrorX),<FlipIcon fontSize="small"/>)}
   {toggle('Mirror vertical',editor.mirrorY,()=>editor.setMirrorY(!editor.mirrorY),<FlipIcon fontSize="small" sx={{transform:'rotate(90deg)'}}/>)}
  </Box>}
  {node&&editor.node!==null&&<Box>
   <Tooltip title="Corner radius"><Slider aria-label="Corner radius" min={0} max={.5} step={.005} value={node.radius} onChange={(_,v)=>updateNode(editor.node!,{radius:v as number},false)} onChangeCommitted={(_,v)=>updateNode(editor.node!,{radius:v as number},true)} valueLabelDisplay="auto"/></Tooltip>
   {toggle('Smooth',node.smooth,()=>updateNode(editor.node!,{smooth:!node.smooth}),<TimelineIcon fontSize="small"/>)}
  </Box>}
  {edge&&editor.edge!==null&&<Box>
   {toggle('Arc',edge.edge.type==='arc',()=>updateNode(editor.edge!,{edge:edge.edge.type==='arc'?{type:'straight',bulge:0}:{type:'arc',bulge:.25}}),<ShowChartIcon fontSize="small"/>)}
   {edge.edge.type==='arc'&&<Tooltip title="Bulge"><Slider aria-label="Bulge" min={-1} max={1} step={.01} value={edge.edge.bulge} onChange={(_,v)=>updateNode(editor.edge!,{edge:{type:'arc',bulge:v as number}},false)} onChangeCommitted={(_,v)=>updateNode(editor.edge!,{edge:{type:'arc',bulge:v as number}},true)} valueLabelDisplay="auto"/></Tooltip>}
  </Box>}
 </Box>;
}
