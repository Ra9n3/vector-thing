import type {OutlineNode} from './types';
export interface Point {x:number;y:number}
export const OUTLINE_TOLERANCE=0.25;
export const OUTLINE_MAX_VERTICES=2000;
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const dist=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
const mix=(a:Point,b:Point,t:number):Point=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const near=(a:Point,b:Point)=>dist(a,b)<1e-9;
const pointSegmentDistance=(p:Point,a:Point,b:Point)=>{const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/d,0,1):0;return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};
function cubic(out:Point[],a:Point,b:Point,c:Point,d:Point,tolerance:number,depth=0):void {
 if(depth>=16||Math.max(pointSegmentDistance(b,a,d),pointSegmentDistance(c,a,d))<=tolerance){out.push(d);return;}
 const ab=mix(a,b,.5),bc=mix(b,c,.5),cd=mix(c,d,.5),abc=mix(ab,bc,.5),bcd=mix(bc,cd,.5),m=mix(abc,bcd,.5);
 cubic(out,a,ab,abc,m,tolerance,depth+1);cubic(out,m,bcd,cd,d,tolerance,depth+1);
}
function arc(out:Point[],a:Point,b:Point,bulge:number,tolerance:number):void {
 const chord=dist(a,b),v=clamp(bulge,-1,1);if(chord<1e-9||Math.abs(v)<1e-9){out.push(b);return;}
 const theta=4*Math.atan(v),r=chord*(1+v*v)/(4*Math.abs(v)),offset=chord*(1-v*v)/(4*v);
 const center={x:(a.x+b.x)/2-(b.y-a.y)/chord*offset,y:(a.y+b.y)/2+(b.x-a.x)/chord*offset};
 const start=Math.atan2(a.y-center.y,a.x-center.x),angle=2*Math.asin(Math.sqrt(Math.min(tolerance,r)/(2*r)));
 const count=Math.min(OUTLINE_MAX_VERTICES,Math.max(1,Math.ceil(Math.abs(theta)/(2*angle))));
 for(let i=1;i<count;i++){const t=start+theta*i/count;out.push({x:center.x+r*Math.cos(t),y:center.y+r*Math.sin(t)});}out.push(b);
}
/** Deterministic polyline in local pixel coordinates, with implicit closure. */
export function flattenOutline(nodes:OutlineNode[],w:number,h:number,tolerance=OUTLINE_TOLERANCE):Point[] {
 if(nodes.length<3||!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)return [];
 const safe=nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)&&Number.isFinite(n.radius)&&Number.isFinite(n.edge.bulge));if(!safe)return [];
 tolerance=Number.isFinite(tolerance)&&tolerance>0?tolerance:OUTLINE_TOLERANCE;
 const points=nodes.map(n=>({x:n.x*w,y:n.y*h})),n=points.length;
 const corners=points.map((p,i)=>{
  const prev=points[(i+n-1)%n],next=points[(i+1)%n],a=dist(p,prev),b=dist(p,next),radius=Math.max(0,nodes[i].radius)*Math.min(w,h);
  if(!radius||a<1e-9||b<1e-9||nodes[i].edge.type==='arc'||nodes[(i+n-1)%n].edge.type==='arc')return {enter:p,exit:p,bulge:0};
  const u={x:(prev.x-p.x)/a,y:(prev.y-p.y)/a},v={x:(next.x-p.x)/b,y:(next.y-p.y)/b};
  const inner=Math.acos(clamp(u.x*v.x+u.y*v.y,-1,1)),tan=Math.tan(inner/2);
  if(!Number.isFinite(tan)||tan<1e-8)return {enter:p,exit:p,bulge:0};
  const d=Math.min(radius/tan,a/2,b/2),cross=(-u.x)*v.y-(-u.y)*v.x,turn=Math.PI-inner;
  return {enter:{x:p.x+u.x*d,y:p.y+u.y*d},exit:{x:p.x+v.x*d,y:p.y+v.y*d},bulge:Math.sign(cross)*Math.tan(turn/4)};
 });
 const result:Point[]=[corners[0].exit];
 for(let i=0;i<n;i++){
  const j=(i+1)%n,a=corners[i].exit,b=corners[j].enter;
  if(nodes[i].edge.type==='arc')arc(result,a,b,nodes[i].edge.bulge,tolerance);
  else if((nodes[i].smooth||nodes[j].smooth)&&nodes[(i+n-1)%n].edge.type!=='arc'&&nodes[j].edge.type!=='arc'&&!corners[i].bulge&&!corners[j].bulge){
   const before=points[(i+n-1)%n],after=points[(j+1)%n],length=dist(a,b),ta=dist(before,b),tb=dist(a,after);
   const c1=nodes[i].smooth&&ta?{x:a.x+(b.x-before.x)*length/(3*ta),y:a.y+(b.y-before.y)*length/(3*ta)}:mix(a,b,1/3);
   const c2=nodes[j].smooth&&tb?{x:b.x-(after.x-a.x)*length/(3*tb),y:b.y-(after.y-a.y)*length/(3*tb)}:mix(a,b,2/3);
   cubic(result,a,c1,c2,b,tolerance);
  }else result.push(b);
  if(corners[j].bulge)arc(result,corners[j].enter,corners[j].exit,corners[j].bulge,tolerance);
 }
 const unique=result.filter((p,i)=>!i||!near(p,result[i-1]));if(unique.length>1&&near(unique[0],unique[unique.length-1]))unique.pop();
 if(unique.length<=OUTLINE_MAX_VERTICES)return unique;
 return Array.from({length:OUTLINE_MAX_VERTICES},(_,i)=>unique[Math.floor(i*unique.length/OUTLINE_MAX_VERTICES)]);
}
export function outlinePath(nodes:OutlineNode[],w:number,h:number):string {
 const pts=flattenOutline(nodes,w,h);if(pts.length<3)return '';
 const fmt=(v:number)=>Number(v.toFixed(4));return `M${pts.map(p=>`${fmt(p.x)} ${fmt(p.y)}`).join('L')}Z`;
}
/** Hash includes the complete canonical node list, for stable geometry cache identities. */
export function outlineHash(nodes:OutlineNode[]):string {
 const text=JSON.stringify(nodes);let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return (h>>>0).toString(36);
}
