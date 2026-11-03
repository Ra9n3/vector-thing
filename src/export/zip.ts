import { zipSync,strToU8 } from 'fflate';
import type { ElementState } from '../selection/types';
export function exportFilename(name:string,state:ElementState|'current',ext:'svg'|'png'|'html',scale=1):string {
  return `${name}${state==='current'?'':`-${state}`}${ext==='png' && scale>1?`@${scale}x`:''}.${ext}`;
}
export function zipFiles(files:{name:string;data:string|Uint8Array}[]):Uint8Array {return zipSync(Object.fromEntries(files.map(f=>[f.name,typeof f.data==='string'?strToU8(f.data):f.data])));}
