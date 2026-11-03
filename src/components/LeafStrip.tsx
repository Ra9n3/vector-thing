import { useId } from 'react';
import { Box, Tooltip } from '@mui/material';
import type { Element } from '../selection/types';
import { useStore } from '../store';
import { resolveMaterial } from '../materials/resolve';
import { shadeColor, colorString } from '../render/shade';
import { shapePath } from '../geometry/shapePath';

function LeafThumbnail({el}:{el:Element}) {
  const id=`leaf-${useId().replace(/[^a-zA-Z0-9_-]/g,'')}`;
  const m=resolveMaterial(el.props.material,el.props.customColor);
  const scale=Math.min(22/el.width,22/el.height), x=(28-el.width*scale)/2,y=(28-el.height*scale)/2;
  return <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
    <defs><radialGradient id={id} cx="32%" cy="27%" r="75%"><stop offset="0" stopColor={colorString(shadeColor(m,0.3,0.3))}/><stop offset="0.6" stopColor={colorString(shadeColor(m,0,0))}/><stop offset="1" stopColor={colorString(shadeColor(m,-0.8,-0.8))}/></radialGradient></defs>
    <path d={shapePath(el.type,el.width,el.height)} transform={`translate(${x} ${y}) scale(${scale})`} fill={`url(#${id})`} opacity={m.opacity}/>
  </svg>;
}
export function LeafStrip({leaves}:{leaves:Element[]}) {
  const activeId=useStore(s=>s.activeId), setActiveId=useStore(s=>s.setActiveId), setHovered=useStore(s=>s.setHoveredId);
  const active=leaves.some(e=>e.id===activeId)?activeId:leaves.at(-1)?.id;
  return <Box sx={{display:'flex',gap:0.5,overflowX:'auto',mt:1,pb:0.25}} onMouseLeave={()=>setHovered(null)}>
    {leaves.map((el,i)=><Tooltip key={el.id} title={`Element ${i+1}`}><Box component="button" type="button" aria-label={`Element ${i+1}`} aria-pressed={active===el.id}
      onMouseEnter={()=>setHovered(el.id)} onFocus={()=>setHovered(el.id)} onBlur={()=>setHovered(null)} onClick={()=>setActiveId(el.id)}
      sx={{display:'grid',placeItems:'center',flex:'0 0 36px',height:36,p:0,border:'1px solid',borderColor:active===el.id?'primary.main':'divider',borderRadius:1,bgcolor:'transparent',cursor:'pointer','&:focus-visible':{outline:'2px solid',outlineColor:'primary.main'}}}>
      <LeafThumbnail el={el}/>
    </Box></Tooltip>)}
  </Box>;
}
