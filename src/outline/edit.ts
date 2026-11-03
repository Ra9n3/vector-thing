import type {OutlineNode} from './types';
import {OUTLINE_MAX_VERTICES} from './geometry';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export function addNode(nodes:OutlineNode[],edge:number,x:number,y:number,w=1,h=1):OutlineNode[] {
 if(nodes.length>=OUTLINE_MAX_VERTICES||edge<0||edge>=nodes.length||!Number.isFinite(x)||!Number.isFinite(y)||w<=0||h<=0)return nodes;
 const out=nodes.map(n=>({...n,edge:{...n.edge}})),a=out[edge],b=out[(edge+1)%out.length],dx=(b.x-a.x)*w,dy=(b.y-a.y)*h,chord=Math.hypot(dx,dy),v=Math.max(-1,Math.min(1,a.edge.bulge));
 let px=x*w,py=y*h,first=0,second=0;
 if(a.edge.type==='arc'&&Math.abs(v)>1e-9&&chord>1e-9){
  const offset=chord*(1-v*v)/(4*v),cx=(a.x+b.x)*w/2-dy/chord*offset,cy=(a.y+b.y)*h/2+dx/chord*offset,r=chord*(1+v*v)/(4*Math.abs(v));
  const start=Math.atan2(a.y*h-cy,a.x*w-cx),theta=4*Math.atan(v),angle=Math.atan2(py-cy,px-cx);let delta=angle-start;
  if(theta>0){while(delta<0)delta+=2*Math.PI;}else{while(delta>0)delta-=2*Math.PI;}
  const t=Math.max(0,Math.min(1,delta/theta)),at=start+theta*t;px=cx+r*Math.cos(at);py=cy+r*Math.sin(at);first=Math.tan(theta*t/4);second=Math.tan(theta*(1-t)/4);
 }else{const t=chord?Math.max(0,Math.min(1,((px-a.x*w)*dx+(py-a.y*h)*dy)/(chord*chord))):0;px=a.x*w+t*dx;py=a.y*h+t*dy;}
 out[edge].edge={type:first?'arc':'straight',bulge:first};out.splice(edge+1,0,{x:px/w,y:py/h,radius:0,smooth:false,edge:{type:second?'arc':'straight',bulge:second}});return out;
}
export function deleteNode(nodes:OutlineNode[],index:number):OutlineNode[] {return nodes.length<=3||index<0||index>=nodes.length?nodes:nodes.filter((_,i)=>i!==index);}
export function moveNode(nodes:OutlineNode[],index:number,x:number,y:number,mirrorX=false,mirrorY=false):OutlineNode[] {
 if(index<0||index>=nodes.length||!Number.isFinite(x)||!Number.isFinite(y))return nodes;
 const original=nodes[index];if(mirrorX&&Math.abs(original.x-.5)<1e-6)x=.5;if(mirrorY&&Math.abs(original.y-.5)<1e-6)y=.5;
 const result=nodes.map(n=>({...n,edge:{...n.edge}}));
 const targets=new Map<string,{x:number;y:number}>();targets.set(`${original.x},${original.y}`,{x:clamp(x),y:clamp(y)});
 if(mirrorX)targets.set(`${1-original.x},${original.y}`,{x:clamp(1-x),y:clamp(y)});
 if(mirrorY)targets.set(`${original.x},${1-original.y}`,{x:clamp(x),y:clamp(1-y)});
 if(mirrorX&&mirrorY)targets.set(`${1-original.x},${1-original.y}`,{x:clamp(1-x),y:clamp(1-y)});
 for(const n of result)for(const [key,p] of targets){const [tx,ty]=key.split(',').map(Number);if(Math.abs(n.x-tx)<1e-6&&Math.abs(n.y-ty)<1e-6){n.x=p.x;n.y=p.y;break;}}
 return result;
}
