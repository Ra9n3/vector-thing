import type { Rect } from './scene';
export const MAX_PNG_SIDE=8192;
export function pngSize(bounds:Rect,scale:number){return {width:Math.ceil(bounds.w*scale),height:Math.ceil(bounds.h*scale)};}
export function pngScaleAvailable(bounds:Rect,scale:number){const {width,height}=pngSize(bounds,scale);return width<=MAX_PNG_SIDE && height<=MAX_PNG_SIDE;}
export async function rasterizePng(svg:string,bounds:Rect,scale:number):Promise<Blob> {
  if(!pngScaleAvailable(bounds,scale))throw new Error('PNG exceeds 8192 pixels');
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  try { const image=new Image();await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('SVG could not be rasterized'));image.src=url;});
    const {width,height}=pngSize(bounds,scale);const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');ctx.drawImage(image,0,0,width,height);
    return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG encoding failed')),'image/png'));
  } finally {URL.revokeObjectURL(url);}
}
