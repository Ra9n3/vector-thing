import { describe,expect,it } from 'vitest';
import { pngScaleAvailable,pngSize } from './png';
import { exportFilename,zipFiles } from './zip';
import { unzipSync,strFromU8 } from 'fflate';
describe('PNG and zip',()=>{
 it('rounds dimensions and rejects scales exceeding 8192',()=>{const b={x:0,y:0,w:4096.1,h:3.3};expect(pngSize(b,2)).toEqual({width:8193,height:7});expect(pngScaleAvailable(b,2)).toBe(false);expect(pngScaleAvailable(b,1)).toBe(true);});
 it('names and packages state variants',()=>{const name=exportFilename('knob','pressed','png',2);expect(name).toBe('knob-pressed@2x.png');const zip=unzipSync(zipFiles([{name,data:'hello'}]));expect(strFromU8(zip[name])).toBe('hello');});
});
