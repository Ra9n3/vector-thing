import type {ShapeType} from '../geometry/shapePath';
import type {OutlineData,OutlineNode,OutlinePreset} from './types';
const node=(x:number,y:number,radius=0,smooth=false,bulge=0):OutlineNode=>({x,y,radius,smooth,edge:{type:bulge?'arc':'straight',bulge}});
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function presetOutline(preset:OutlinePreset,sides=6,innerRatio=.5):OutlineData {
 const count=Math.round(clamp(Number.isFinite(sides)?sides:6,3,12)),ratio=clamp(Number.isFinite(innerRatio)?innerRatio:.5,.3,.9);
 if(preset==='polygon'||preset==='star'){
  const total=preset==='star'?count*2:count;
  return {preset,...(preset==='star'?{points:count,innerRatio:ratio}:{sides:count}),nodes:Array.from({length:total},(_,i)=>{
   const a=-Math.PI/2+i*2*Math.PI/total,r=preset==='star'&&i%2?ratio:1;return node(.5+.5*r*Math.cos(a),.5+.5*r*Math.sin(a));
  })};
 }
 if(preset==='triangle')return {preset,nodes:[node(.5,0),node(1,1),node(0,1)]};
 if(preset==='arrow')return {preset,nodes:[node(0,.3),node(.55,.3),node(.55,0),node(1,.5),node(.55,1),node(.55,.7),node(0,.7)]};
 return {preset,nodes:[node(.33,0),node(.67,0),node(.67,.33),node(1,.33),node(1,.67),node(.67,.67),node(.67,1),node(.33,1),node(.33,.67),node(0,.67),node(0,.33),node(.33,.33)]};
}
/** Convert the five built-in primitives to dimension-independent nodes. */
export function primitiveOutline(type:ShapeType,w:number,h:number):OutlineData {
 if(type==='rect'||type==='rounded')return {nodes:[node(0,0,type==='rounded'?.18:0),node(1,0,type==='rounded'?.18:0),node(1,1,type==='rounded'?.18:0),node(0,1,type==='rounded'?.18:0)]};
 if(type==='hexagon'){
  const r=Math.min(w/2,h/Math.sqrt(3)),hh=r*Math.sqrt(3)/2,cx=w/2,cy=h/2;
  return {nodes:[[cx+r,cy],[cx+r/2,cy+hh],[cx-r/2,cy+hh],[cx-r,cy],[cx-r/2,cy-hh],[cx+r/2,cy-hh]].map(([x,y])=>node(x/w,y/h))};
 }
 if(type==='circle'){
  const r=Math.min(w,h)/2,cx=w/2,cy=h/2,q=Math.tan(Math.PI/8);
  return {nodes:[[cx,cy-r],[cx+r,cy],[cx,cy+r],[cx-r,cy]].map(([x,y])=>node(x/w,y/h,0,true,q))};
 }
 const r=Math.min(w,h)/2;
 if(w>=h)return {nodes:[node(r/w,0,0,true),node((w-r)/w,0,0,true,1),node((w-r)/w,1,0,true),node(r/w,1,0,true,1)]};
 return {nodes:[node(1,r/h,0,true),node(1,(h-r)/h,0,true,1),node(0,(h-r)/h,0,true),node(0,r/h,0,true,1)]};
}
