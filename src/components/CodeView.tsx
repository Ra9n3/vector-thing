import { Box } from '@mui/material';
export function CodeView({code}:{code:string}) {return <Box component="pre" aria-label="Code" tabIndex={0} sx={{m:0,p:1.5,height:'100%',boxSizing:'border-box',overflow:'auto',whiteSpace:'pre',fontFamily:'monospace',fontSize:11,userSelect:'text',bgcolor:'#101115',color:'text.primary'}}>{code}</Box>;}
