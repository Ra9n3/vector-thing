import type {OutlineNode} from './types';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export function addNode(nodes:OutlineNode[],edge:number,x:number,y:number):OutlineNode[] {
 if(edge<0||edge>=nodes.length||!Number.isFinite(x)||!Number.isFinite(y))return nodes;
 const out=nodes.map(n=>({...n,edge:{...n.edge}}));out[edge].edge={type:'straight',bulge:0};out.splice(edge+1,0,{x:clamp(x),y:clamp(y),radius:0,smooth:false,edge:{type:'straight',bulge:0}});return out;
}
export function deleteNode(nodes:OutlineNode[],index:number):OutlineNode[] {return nodes.length<=3||index<0||index>=nodes.length?nodes:nodes.filter((_,i)=>i!==index);}
export function moveNode(nodes:OutlineNode[],index:number,x:number,y:number,mirrorX=false,mirrorY=false):OutlineNode[] {
 if(index<0||index>=nodes.length||!Number.isFinite(x)||!Number.isFinite(y))return nodes;
 const original=nodes[index],result=nodes.map(n=>({...n,edge:{...n.edge}}));
 const targets=new Map<string,{x:number;y:number}>();targets.set(`${original.x},${original.y}`,{x:clamp(x),y:clamp(y)});
 if(mirrorX)targets.set(`${1-original.x},${original.y}`,{x:clamp(1-x),y:clamp(y)});
 if(mirrorY)targets.set(`${original.x},${1-original.y}`,{x:clamp(x),y:clamp(1-y)});
 if(mirrorX&&mirrorY)targets.set(`${1-original.x},${1-original.y}`,{x:clamp(1-x),y:clamp(1-y)});
 for(const n of result)for(const [key,p] of targets){const [tx,ty]=key.split(',').map(Number);if(Math.abs(n.x-tx)<1e-6&&Math.abs(n.y-ty)<1e-6){n.x=p.x;n.y=p.y;break;}}
 return result;
}
