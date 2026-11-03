import { Box } from '@mui/material';
import { CodeView } from './CodeView';
import type { CssOutput } from '../export/css/buildCss';
import type { ExportSettings } from '../export/settings';
export function ExportPreview({svg,settings,css,background}:{svg:string;settings:ExportSettings;css:CssOutput|null;background:string}) {
  if(settings.format==='css') {
    if(settings.code!=='preview')return <CodeView code={settings.code==='html' ? css?.html??'' : css?.css??''}/>;
    const srcdoc=`<!doctype html><html><head><style>html,body{margin:0;height:100%;}body{display:flex;align-items:center;justify-content:center;background:${background};overflow:auto;}${css?.css??''}</style></head><body>${css?.html??''}</body></html>`;
    return <Box component="iframe" title="CSS preview" sandbox="" srcDoc={srcdoc} sx={{width:'100%',height:'100%',border:0,display:'block'}}/>;
  }
  return <Box sx={{width:'100%',height:'100%',display:'flex',justifyContent:'center',alignItems:'center',overflow:'hidden',backgroundColor:settings.background?background:'#ddd',
    backgroundImage:settings.background?'none':'linear-gradient(45deg,#bbb 25%,transparent 25%),linear-gradient(-45deg,#bbb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#bbb 75%),linear-gradient(-45deg,transparent 75%,#bbb 75%)',backgroundSize:'16px 16px',backgroundPosition:'0 0,0 8px,8px -8px,-8px 0'}}>
    {svg && <img src={svg} alt="Export preview" style={{display:'block',maxWidth:'94%',maxHeight:'94%',objectFit:'contain'}}/>}
  </Box>;
}
