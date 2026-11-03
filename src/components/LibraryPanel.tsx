import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogTitle, Drawer } from '@mui/material';
import { useStore } from '../store';
import { resolveStyle } from '../styles/catalog';
import { BUILTIN_TEMPLATES } from '../library/catalog';
import type { Category } from '../library/types';
import { LibraryTabs } from './LibraryTabs';
import { TemplateTile } from './TemplateTile';
import { usePreviewValue } from './usePreviewValue';
export const LIBRARY_WIDTH=220;
export function LibraryPanel() {
  const [category,setCategory]=useState<Category>('buttons');const [deleting,setDeleting]=useState<string|null>(null);
  const selected=useStore(s=>s.selectedLibraryItem), userTemplates=useStore(s=>s.userTemplates);
  const styleId=useStore(s=>s.styleId),look=useStore(s=>s.look),direction=useStore(s=>s.direction),remove=useStore(s=>s.deleteUserTemplate);
  const previewStyle=resolveStyle(usePreviewValue(styleId)),previewLook=usePreviewValue(look),previewDirection=usePreviewValue(direction);
  useEffect(()=>{if(category==='my' && !userTemplates.length)setCategory('buttons')},[category,userTemplates.length]);
  const confirmDelete=useCallback((id:string)=>setDeleting(id),[]);
  const activeCategory=category==='my' && !userTemplates.length?'buttons':category;
  const visible=activeCategory==='my'?userTemplates:BUILTIN_TEMPLATES.filter(t=>t.category===activeCategory);
  return <Drawer variant="permanent" anchor="left" sx={{width:LIBRARY_WIDTH,flexShrink:0,'& .MuiDrawer-paper':{width:LIBRARY_WIDTH,position:'relative',borderRight:'1px solid',borderColor:'divider'}}}>
    <Box sx={{borderBottom:1,borderColor:'divider'}}><LibraryTabs value={activeCategory} onChange={setCategory} hasMy={userTemplates.length>0}/></Box>
    <Box sx={{p:1.5,display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:1,overflowY:'auto',alignContent:'start'}}>
      {visible.map(t=><TemplateTile key={t.id} template={t} style={previewStyle} look={previewLook} direction={previewDirection} selected={selected===t.id} onDelete={confirmDelete}/>)}
    </Box>
    <Dialog open={!!deleting} onClose={()=>setDeleting(null)}><DialogTitle>Delete?</DialogTitle><DialogActions><Button onClick={()=>setDeleting(null)}>Cancel</Button><Button onClick={()=>{if(deleting)remove(deleting);setDeleting(null);}}>Delete</Button></DialogActions></Dialog>
  </Drawer>;
}
