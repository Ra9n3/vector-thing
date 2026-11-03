import { useEffect,useMemo,useState } from 'react';
import { Box,Button,IconButton,Popover,ToggleButton,ToggleButtonGroup,Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CodeIcon from '@mui/icons-material/Code';
import CropFreeIcon from '@mui/icons-material/CropFree';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ContrastIcon from '@mui/icons-material/Contrast';
import { useStore } from '../store';
import { resolveStyle } from '../styles/catalog';
import { exportName,exportScene } from '../export/scene';
import { buildSvg } from '../export/buildSvg';
import { buildFlatSvg } from '../export/flat/flatSvg';
import { pngScaleAvailable,rasterizePng } from '../export/png';
import { zipFiles,exportFilename } from '../export/zip';
import { buildCss } from '../export/css/buildCss';
import { cssEligibility } from '../export/css/cssEligibility';
import { EXPORT_SETTINGS_KEY,loadExportSettings,saveExportSettings } from '../export/settings';
import type { ExportSettings } from '../export/settings';
import { visualElement } from '../states/visual';
import { resolveMode } from '../profiles/sample';
import { ExportPreview } from './ExportPreview';
import { TipToggle } from './TipToggle';

export function ExportPopover({anchor,onClose}:{anchor:HTMLElement|null;onClose:()=>void}) {
  const elements=useStore(s=>s.elements),groups=useStore(s=>s.groups),selection=useStore(s=>s.selection),look=useStore(s=>s.look),direction=useStore(s=>s.direction),pack=resolveStyle(useStore(s=>s.styleId));
  const [settings,setSettings]=useState<ExportSettings>(()=>{const value=loadExportSettings();try{if(!localStorage.getItem(EXPORT_SETTINGS_KEY))value.scope=selection.length?'selection':'all';}catch{value.scope=selection.length?'selection':'all';}return value;});
  const [url,setUrl]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const set=<K extends keyof ExportSettings>(key:K,value:ExportSettings[K])=>setSettings(s=>({...s,[key]:value}));
  useEffect(()=>saveExportSettings(settings),[settings]);
  useEffect(()=>{if(!selection.length && settings.scope==='selection')set('scope','all');},[selection.length,settings.scope]);
  const scope=selection.length?settings.scope:'all';
  const opts=useMemo(()=>({elements,groups,selection,scope,states:settings.format==='css'?'all' as const:settings.states,look,direction,pack,background:settings.background}),[elements,groups,selection,scope,settings.format,settings.states,settings.background,look,direction,pack]);
  const variants=useMemo(()=>anchor?exportScene(opts):[],[anchor,opts]);
  const selected=variants[0]?.elements ?? [];
  const eligibility=cssEligibility(selected);
  useEffect(()=>{if(!eligibility.eligible && settings.format==='css')set('format','svg');},[eligibility.eligible,settings.format]);
  const css=useMemo(()=>settings.format==='css'&&eligibility.eligible?buildCss(variants,exportName(opts)):null,[settings.format,eligibility.eligible,variants,opts]);
  const [preview,setPreview]=useState('');
  useEffect(()=>{if(!anchor || !selected.length || settings.format==='css'){setPreview('');return;}
    const timer=window.setTimeout(()=>{try{setPreview(settings.format==='flat'?buildFlatSvg(variants[0]):buildSvg(variants[0]));}catch{setPreview('');}},150);return ()=>clearTimeout(timer);
  },[anchor,variants,settings.format,selected.length]);
  useEffect(()=>{if(!preview){setUrl('');return;}const objectUrl=URL.createObjectURL(new Blob([preview],{type:'image/svg+xml'}));setUrl(objectUrl);return ()=>URL.revokeObjectURL(objectUrl);},[preview]);
  const bounds=variants[0]?.bounds ?? {x:0,y:0,w:1,h:1};
  const available=pngScaleAvailable(bounds,settings.scale);
  const approximations:string[]=settings.format==='css' ? [...(css?.approximations??[])] : [];
  if(settings.format==='flat') {
    if(variants.some(v=>v.elements.some(e=>{const vis=visualElement(e,v.pack,v.pack.canvasBackground);return resolveMode(vis.element.props.profile,e.type)==='around';})))approximations.push('Around profile');
    if(pack.shadow.strength>0)approximations.push('Shadows');
    if(variants.some(v=>v.elements.some(e=>!!visualElement(e,v.pack,v.pack.canvasBackground).material.glow)))approximations.push('Glow');
    if(variants.some(v=>v.elements.some(e=>!!visualElement(e,v.pack,v.pack.canvasBackground).material.texture)))approximations.push('Texture');
  }
  const name=exportName(opts);
  const download=async()=>{
    if(!selected.length||busy||settings.format==='png'&&!available)return;setBusy(true);
    try {
      setError('');let blob:Blob,filename:string;
      if(settings.format==='css'){blob=new Blob([css?.document??''],{type:'text/html'});filename=`${name}.html`;}
      else {
        const ext=settings.format==='png'?'png':'svg';
        const files=await Promise.all(variants.map(async v=>{
          const svg=settings.format==='flat'?buildFlatSvg(v):buildSvg(v);
          const data=ext==='png'?await rasterizePng(svg,v.bounds,settings.scale):new Blob([svg],{type:'image/svg+xml'});
          return {name:exportFilename(name,v.state,ext,settings.scale),data};
        }));
        if(files.length===1){blob=files[0].data;filename=files[0].name;}else {const bytes=zipFiles(await Promise.all(files.map(async f=>({name:f.name,data:new Uint8Array(await f.data.arrayBuffer())}))));blob=new Blob([new Uint8Array(bytes)],{type:'application/zip'});filename=`${name}.zip`;}
      }
      const objectUrl=URL.createObjectURL(blob);const a=document.createElement('a');a.href=objectUrl;a.download=filename;a.click();window.setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
    } catch {setError('Download failed');} finally {setBusy(false);}
  };
  const copy=async()=>{try {const text=settings.format==='css'?(settings.code==='html'?css?.html:css?.css):settings.format==='flat'?buildFlatSvg(variants[0]):buildSvg(variants[0]);if(text)await navigator.clipboard.writeText(text);setError('');}catch{setError('Copy failed');}};
  return <Popover open={!!anchor} anchorEl={anchor} onClose={onClose} anchorOrigin={{vertical:'bottom',horizontal:'right'}} transformOrigin={{vertical:'top',horizontal:'right'}}
    slotProps={{paper:{onKeyDown:(e:React.KeyboardEvent)=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();void download();}},sx:{width:380,maxWidth:'calc(100vw - 24px)',p:1.5}}}}>
    <Box sx={{display:'flex',flexDirection:'column',gap:1}}>
      <ToggleButtonGroup exclusive value={settings.format} onChange={(_,v:ExportSettings['format']|null)=>v&&set('format',v)} aria-label="Format">
        <TipToggle value="svg" tip="Exact at natural size"><ImageOutlinedIcon fontSize="small"/> SVG</TipToggle>
        <TipToggle value="flat" tip="Flat SVG"><ImageOutlinedIcon fontSize="small"/> Flat</TipToggle>
        <TipToggle value="png" tip="PNG"><ImageOutlinedIcon fontSize="small"/> PNG</TipToggle>
        <TipToggle value="css" tip={eligibility.eligible?'CSS':selected.some(e=>e.props.profile.kind==='custom')?'Custom profile unsupported':selected.some(e=>String(e.type)==='path')?'Path unsupported':'Hexagon unsupported'} disabled={!eligibility.eligible}><CodeIcon fontSize="small"/> CSS</TipToggle>
      </ToggleButtonGroup>
      <ToggleButtonGroup exclusive value={scope} onChange={(_,v:ExportSettings['scope']|null)=>v&&set('scope',v)} aria-label="Scope">
        <TipToggle value="selection" tip="Selection" disabled={!selection.length}><CropFreeIcon fontSize="small"/> Selection</TipToggle>
        <TipToggle value="all" tip="All"><SelectAllIcon fontSize="small"/> All</TipToggle>
      </ToggleButtonGroup>
      {settings.format!=='css' && <ToggleButtonGroup exclusive value={settings.states} onChange={(_,v:ExportSettings['states']|null)=>v&&set('states',v)} aria-label="States">
        <TipToggle value="current" tip="Current"><LayersOutlinedIcon fontSize="small"/> Current</TipToggle>
        <TipToggle value="all" tip="All three"><LayersOutlinedIcon fontSize="small"/> All three</TipToggle>
      </ToggleButtonGroup>}
      <Box sx={{display:'flex',alignItems:'center',gap:1}}>
        {settings.format==='png' && <ToggleButtonGroup exclusive value={settings.scale} onChange={(_,v:ExportSettings['scale']|null)=>v&&set('scale',v)} aria-label="Scale">
          {([1,2,3] as const).map(scale=><TipToggle key={scale} value={scale} disabled={!pngScaleAvailable(bounds,scale)} tip={pngScaleAvailable(bounds,scale)?`${scale}×`:'Exceeds 8192 pixels'}>{scale}×</TipToggle>)}
        </ToggleButtonGroup>}
        {settings.format!=='css' && <Tooltip title="Background"><ToggleButton aria-label="Background" value="background" selected={settings.background} onChange={()=>set('background',!settings.background)}><ContrastIcon fontSize="small"/></ToggleButton></Tooltip>}
        {approximations.length>0 && <Tooltip title={approximations.join(', ')}><WarningAmberIcon aria-label="Approximations" fontSize="small" sx={{color:'text.secondary'}}/></Tooltip>}
      </Box>
      {settings.format==='css' && <ToggleButtonGroup exclusive value={settings.code} onChange={(_,v:ExportSettings['code']|null)=>v&&set('code',v)} aria-label="Code view">
        <TipToggle value="preview" tip="Preview">Preview</TipToggle><TipToggle value="html" tip="HTML">HTML</TipToggle><TipToggle value="css" tip="CSS">CSS</TipToggle>
      </ToggleButtonGroup>}
      <Box sx={{height:220,border:1,borderColor:'divider',borderRadius:1,overflow:'hidden'}}><ExportPreview svg={url} settings={settings} css={css} background={pack.canvasBackground}/></Box>
      <Box sx={{display:'flex',gap:1,alignItems:'center'}}><Button variant="contained" disabled={!selected.length || busy || settings.format==='png'&&!available} onClick={()=>void download()}>Download</Button>
        {error && <Tooltip title={error}><WarningAmberIcon aria-label={error} fontSize="small" color="error"/></Tooltip>}
        {settings.format!=='png' && <Tooltip title="Copy"><span><IconButton aria-label="Copy" disabled={!selected.length} onClick={()=>void copy()}><ContentCopyIcon fontSize="small"/></IconButton></span></Tooltip>}</Box>
    </Box>
  </Popover>;
}
