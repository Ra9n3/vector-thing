import {readFile} from 'node:fs/promises';
export async function resolve(specifier,context,nextResolve){
 try{return await nextResolve(specifier,context);}catch(error){if(error.code!=='ERR_MODULE_NOT_FOUND'||!specifier.startsWith('.'))throw error;for(const ext of ['.ts','.tsx','.json']){try{return await nextResolve(specifier+ext,context);}catch(e){if(e.code!=='ERR_MODULE_NOT_FOUND')throw e;}}throw error;}
}
export async function load(url,context,nextLoad){if(url.endsWith('.json'))return {format:'module',shortCircuit:true,source:`export default ${await readFile(new URL(url),'utf8')}`};return nextLoad(url,context);}
