import { memo, useMemo } from 'react';
import type { DragEvent } from 'react';
import { Box, Card, CardActionArea, IconButton, Tooltip } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import type { ComponentTemplate } from '../library/types';
import type { StylePack } from '../styles/types';
import type { Direction, Look } from '../viewTypes';
import { instantiate } from '../library/instantiate';
import { displayedElement, stackedShadowClip } from '../render/stack';
import { ShadedElement, useShadingDefinitions } from '../render/ShadedElement';
import { LIBRARY_DRAG_TYPE } from '../library';
import { useViewport } from '../canvas/useViewport';
import { useStore } from '../store';

const NONE:string[]=[];
const TemplatePreview=memo(function TemplatePreview({template,style,look,direction}:{template:ComponentTemplate;style:StylePack;look:Look;direction:Direction}) {
  const result=useMemo(()=>instantiate(template,{x:template.size.w/2,y:template.size.h/2},1,style,[],[]),[template,style]);
  const shading=useShadingDefinitions(result.elements,NONE,{elements:result.elements,look,direction,style});
  const max=Math.max(template.size.w,template.size.h), side=max*1.55, cx=template.size.w/2,cy=template.size.h/2;
  return <svg aria-hidden="true" width="100%" height="100%" viewBox={`${cx-side/2} ${cy-side/2} ${side} ${side}`} style={{display:'block',background:style.canvasBackground}}>
    {shading.defs}
    {result.elements.map(el=><ShadedElement key={el.id} material={shading.visuals.get(el.id)?.material} el={{...displayedElement(el,result.elements,look,direction,{pack:style}),props:shading.visuals.get(el.id)!.element.props}} effect={shading.effectsByElement.get(el.id)}
      shadowClip={stackedShadowClip(el,result.elements,look,direction,{pack:style})} shadingId={shading.elementIds.get(el.id)!} heightId={shading.heightIds.get(el.id)} glowId={shading.glowIds.get(el.id)} textureId={shading.textureIds.get(el.id)}/>)}
  </svg>;
});
export const TemplateTile=memo(function TemplateTile({template,style,look,direction,selected,onDelete}:{template:ComponentTemplate;style:StylePack;look:Look;direction:Direction;selected:boolean;onDelete:(id:string)=>void}) {
  const place=useStore(s=>s.placeTemplate),setSelected=useStore(s=>s.setSelectedLibraryItem),mode=useStore(s=>s.mode);
  const drag=(event:DragEvent<HTMLButtonElement>)=>{setSelected(template.id);event.dataTransfer.setData(LIBRARY_DRAG_TYPE,template.id);event.dataTransfer.effectAllowed='copy';event.dataTransfer.setDragImage(event.currentTarget,40,40);};
  return <Card sx={{position:'relative',aspectRatio:'1',borderColor:selected?'primary.main':'divider','&:hover':{borderColor:'primary.main'},'&:hover .delete-template, &:focus-within .delete-template':{opacity:1,pointerEvents:'auto'}}}>
    <Tooltip title={template.label}><CardActionArea component="button" draggable onDragStart={drag} onClick={()=>{if(mode==='face'){const c=useViewport.getState().visibleCenter();place(template.id,c);}else setSelected(template.id);}}
      aria-label={template.label} aria-pressed={selected} sx={{display:'block',width:'100%',height:'100%'}}>
      <TemplatePreview template={template} style={style} look={look} direction={direction}/>
    </CardActionArea></Tooltip>
    {template.category==='my' && <Box className="delete-template" sx={{position:'absolute',right:1,top:1,opacity:0,pointerEvents:'none',transition:'opacity .15s'}}>
      <Tooltip title="Delete"><IconButton aria-label="Delete template" onClick={()=>onDelete(template.id)} sx={{bgcolor:'background.paper','&:hover':{bgcolor:'background.paper'}}}><DeleteOutlineIcon fontSize="small"/></IconButton></Tooltip>
    </Box>}
  </Card>;
});
