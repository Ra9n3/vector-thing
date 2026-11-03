import { Box, IconButton, Tooltip } from '@mui/material';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import { useStore } from '../store';
import { groupSelection, reorderSelection } from '../selection/groupOps';
import type { ReorderAction } from '../selection/groupOps';

export function PanelHeaderActions() {
  const elements=useStore(s=>s.elements), groups=useStore(s=>s.groups), selection=useStore(s=>s.selection);
  const group=useStore(s=>s.group), ungroup=useStore(s=>s.ungroup), reorder=useStore(s=>s.reorder), save=useStore(s=>s.saveToLibrary);
  const state={elements,groups,selection};
  let candidate='__group_preview__'; while(elements.some(e=>e.id===candidate)||groups.some(g=>g.id===candidate)) candidate+='_';
  const actions: {tip:string; disabled:boolean; run:()=>void; icon:React.ReactNode}[] = [
    {tip:'Save to library',disabled:selection.length!==1 || ![...elements,...groups].some(item=>item.id===selection[0]),run:save,icon:<BookmarkAddOutlinedIcon/>},
    {tip:'Group (Ctrl/⌘ G)',disabled:groupSelection(state,candidate)===state,run:group,icon:<GroupWorkOutlinedIcon/>},
    {tip:'Ungroup (Ctrl/⌘ Shift G)',disabled:!selection.some(id=>groups.some(g=>g.id===id)),run:ungroup,icon:<LinkOffIcon/>},
    ...([['forward','Bring forward (])',<KeyboardArrowUpIcon/>],['backward','Send backward ([)',<KeyboardArrowDownIcon/>],['front','Bring to front (Shift ])',<VerticalAlignTopIcon/>],['back','Send to back (Shift [)',<VerticalAlignBottomIcon/>]] as [ReorderAction,string,React.ReactNode][]).map(([action,tip,icon])=>({tip,disabled:reorderSelection(state,action)===state,run:()=>reorder(action),icon})),
  ];
  return <Box sx={{display:'flex',gap:0.25,px:1.5,py:1,borderBottom:1,borderColor:'divider'}}>
    {actions.map(a=><Tooltip key={a.tip} title={a.tip}><span><IconButton aria-label={a.tip} disabled={a.disabled} onClick={a.run} sx={{width:34,height:36}}>{a.icon}</IconButton></span></Tooltip>)}
  </Box>;
}
