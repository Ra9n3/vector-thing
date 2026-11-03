import { Tabs, Tab } from '@mui/material';
import type { Category } from '../library/types';
const categories: {id:Category;label:string}[]=[{id:'buttons',label:'Buttons'},{id:'knobs',label:'Knobs'},{id:'faders',label:'Faders'},{id:'toggles',label:'Toggles'},{id:'cards',label:'Cards'},{id:'badges',label:'Badges'},{id:'parts',label:'Parts'}];
export function LibraryTabs({value,onChange,hasMy}:{value:Category;onChange:(value:Category)=>void;hasMy:boolean}) {
  return <Tabs value={value} onChange={(_,v:Category)=>onChange(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="Category">
    {[...categories,...(hasMy?[{id:'my' as const,label:'My'}]:[])].map(c=><Tab key={c.id} value={c.id} label={c.label}/>)}
  </Tabs>;
}
