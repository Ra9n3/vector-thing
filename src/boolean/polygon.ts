export interface Point { x:number; y:number }
export type Ring=Point[];
export type Polygon=Ring[];
export type BooleanOperation='union'|'subtract'|'intersect';
const EPS=1e-9;
const cross=(a:Point,b:Point)=>a.x*b.y-a.y*b.x;
const sub=(a:Point,b:Point):Point=>({x:a.x-b.x,y:a.y-b.y});
const lerp=(a:Point,b:Point,t:number):Point=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const sq=(a:Point,b:Point)=>(a.x-b.x)**2+(a.y-b.y)**2;
const round=(n:number)=>Math.round(n*1e7)/1e7;
const key=(p:Point)=>`${round(p.x)},${round(p.y)}`;
export function ringArea(ring:Ring):number {let a=0;for(let i=0;i<ring.length;i++){const p=ring[i],q=ring[(i+1)%ring.length];a+=p.x*q.y-q.x*p.y;}return a/2;}
export function polygonArea(polygons:Polygon[]):number {return polygons.reduce((sum,p)=>sum+p.reduce((v,r,i)=>v+(i===0?1:-1)*Math.abs(ringArea(r)),0),0);}
function cleaned(ring:Ring):Ring {const out:Ring=[];for(const p of ring){if(!Number.isFinite(p.x)||!Number.isFinite(p.y))throw new Error('Non-finite polygon coordinate');if(!out.length||sq(p,out[out.length-1])>EPS**2)out.push({x:p.x,y:p.y});}if(out.length>1&&sq(out[0],out[out.length-1])<=EPS**2)out.pop();return out.length>=3&&Math.abs(ringArea(out))>EPS?out:[];}
function simplifyOpen(points:Ring,tolerance:number):Ring {
 const n=points.length,keep=new Uint8Array(n);keep[0]=keep[n-1]=1;const pending:[number,number][]=[[0,n-1]];
 while(pending.length){const [a,b]=pending.pop()!,p=points[a],q=points[b],v=sub(q,p),len=v.x*v.x+v.y*v.y;let max=-1,at=-1;
  for(let i=a+1;i<b;i++){const w=sub(points[i],p),t=len?Math.max(0,Math.min(1,(w.x*v.x+w.y*v.y)/len)):0,d=sq(points[i],lerp(p,q,t));if(d>max){max=d;at=i;}}
  if(at>=0&&max>tolerance*tolerance){keep[at]=1;pending.push([a,at],[at,b]);}
 }return points.filter((_,i)=>keep[i]);
}
function simplifyRing(r:Ring,limit:number):Ring {
 if(r.length<=limit)return r;let far=1;for(let i=2;i<r.length;i++)if(sq(r[0],r[i])>sq(r[0],r[far]))far=i;
 const first=r.slice(0,far+1),second=[...r.slice(far),r[0]];let lo=0,hi=1;
 const one=(t:number)=>{const a=simplifyOpen(first,t),b=simplifyOpen(second,t);return [...a.slice(0,-1),...b.slice(0,-1)];};
 while(one(hi).length>limit)hi*=2;
 for(let i=0;i<36;i++){const mid=(lo+hi)/2;if(one(mid).length>limit)lo=mid;else hi=mid;}
 const result=one(hi);return result.length>=3?result:[r[0],r[Math.floor(r.length/3)],r[Math.floor(2*r.length/3)]];
}
/** Normalizes rings and caps the total vertices in one operand at 2000. */
export function preparePolygons(polygons:Polygon[],limit=2000):Polygon[] {
 const parsed=polygons.map(p=>p.map(cleaned).filter(r=>r.length>=3)).filter(p=>p.length>0);
 const rings=parsed.flat(),total=rings.reduce((n,r)=>n+r.length,0);if(total<=limit)return parsed;
 if(rings.length*3>limit)throw new Error('Too many rings for vertex budget');
 let remaining=limit,remainingVertices=total,remainingRings=rings.length;
 return parsed.map(p=>p.map(r=>{const allotted=Math.max(3,Math.min(r.length,remaining-3*(remainingRings-1),Math.floor(remaining*r.length/remainingVertices)));remaining-=allotted;remainingVertices-=r.length;remainingRings--;return simplifyRing(r,allotted);}));
}
interface Edges {a:Point;b:Point;cuts:number[];minX:number;maxX:number;minY:number;maxY:number}
function edgesOf(polygons:Polygon[]):Edges[] {return polygons.flatMap(p=>p.flatMap(r=>r.map((a,i)=>{const b=r[(i+1)%r.length];return {a,b,cuts:[0,1],minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),minY:Math.min(a.y,b.y),maxY:Math.max(a.y,b.y)};})));}
function split(a:Edges,b:Edges):void {
 if(a.maxX<b.minX-EPS||b.maxX<a.minX-EPS||a.maxY<b.minY-EPS||b.maxY<a.minY-EPS)return;
 const r=sub(a.b,a.a),s=sub(b.b,b.a),v=sub(b.a,a.a),den=cross(r,s);
 if(Math.abs(den)>EPS){const t=cross(v,s)/den,u=cross(v,r)/den;if(t>=-EPS&&t<=1+EPS&&u>=-EPS&&u<=1+EPS){a.cuts.push(Math.max(0,Math.min(1,t)));b.cuts.push(Math.max(0,Math.min(1,u)));}return;}
 if(Math.abs(cross(v,r))>EPS)return;
 const rr=r.x*r.x+r.y*r.y,ss=s.x*s.x+s.y*s.y;if(!rr||!ss)return;
 for(const p of [b.a,b.b]){const t=((p.x-a.a.x)*r.x+(p.y-a.a.y)*r.y)/rr;if(t>=-EPS&&t<=1+EPS)a.cuts.push(Math.max(0,Math.min(1,t)));}
 for(const p of [a.a,a.b]){const t=((p.x-b.a.x)*s.x+(p.y-b.a.y)*s.y)/ss;if(t>=-EPS&&t<=1+EPS)b.cuts.push(Math.max(0,Math.min(1,t)));}
}
function inRing(p:Point,ring:Ring):boolean {let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
export function containsPoint(polygons:Polygon[],p:Point):boolean {return polygons.some(poly=>{let inside=false;for(const ring of poly)if(inRing(p,ring))inside=!inside;return inside;});}
function canonical(r:Ring):Ring {let start=0;for(let i=1;i<r.length;i++)if(r[i].x<r[start].x||(r[i].x===r[start].x&&r[i].y<r[start].y))start=i;return [...r.slice(start),...r.slice(0,start)].map(p=>({x:round(p.x),y:round(p.y)}));}
/** Even-odd polygons in; even-odd polygons out. Inputs are not mutated. */
export function booleanOp(aInput:Polygon[],bInput:Polygon[],op:BooleanOperation):Polygon[] {
 const a=preparePolygons(aInput),b=preparePolygons(bInput),ea=edgesOf(a),eb=edgesOf(b);for(const x of ea)for(const y of eb)split(x,y);
 const included=(p:Point)=>{const x=containsPoint(a,p),y=containsPoint(b,p);return op==='union'?x||y:op==='subtract'?x&&!y:x&&y;};
 const all=[...ea,...eb],extent=all.length?Math.max(1,...all.map(e=>Math.max(Math.abs(e.a.x),Math.abs(e.a.y),Math.abs(e.b.x),Math.abs(e.b.y)))):1;
 const pieces=new Map<string,{a:Point;b:Point}>();
 for(const edge of all){edge.cuts.sort((x,y)=>x-y);const cuts=edge.cuts.filter((x,i)=>i===0||x-edge.cuts[i-1]>1e-10);
  for(let i=0;i<cuts.length-1;i++){const p=lerp(edge.a,edge.b,cuts[i]),q=lerp(edge.a,edge.b,cuts[i+1]),v=sub(q,p),length=Math.hypot(v.x,v.y);if(length<EPS)continue;
   const mid=lerp(p,q,.5),d=Math.min(length*1e-5,extent*1e-7),normal={x:-v.y/length*d,y:v.x/length*d};
   const left=included({x:mid.x+normal.x,y:mid.y+normal.y}),right=included({x:mid.x-normal.x,y:mid.y-normal.y});if(left===right)continue;
   const start=left?p:q,end=left?q:p;pieces.set(`${key(start)}>${key(end)}`,{a:start,b:end});
  }
 }
 const outgoing=new Map<string,{a:Point;b:Point}[]>();for(const edge of pieces.values()){const k=key(edge.a),list=outgoing.get(k)??[];list.push(edge);outgoing.set(k,list);}
 const unused=new Set(pieces.values()),rings:Ring[]=[];
 while(unused.size){const first=unused.values().next().value!;let edge=first;const ring:Ring=[];let guard=0;
  while(unused.has(edge)&&guard++<=pieces.size){unused.delete(edge);ring.push(edge.a);const target=key(edge.b);if(target===key(first.a))break;const candidates=(outgoing.get(target)??[]).filter(e=>unused.has(e));if(!candidates.length){ring.length=0;break;}
   const incoming=Math.atan2(edge.b.y-edge.a.y,edge.b.x-edge.a.x);
   candidates.sort((x,y)=>{const turn=(c:typeof x)=>{const theta=Math.atan2(c.b.y-c.a.y,c.b.x-c.a.x)-incoming;return (theta+Math.PI*2)%(Math.PI*2);};return turn(x)-turn(y)||key(x.b).localeCompare(key(y.b));});edge=candidates[0];
  }
  const valid=cleaned(ring);if(valid.length)rings.push(canonical(valid));
 }
 const outers=rings.filter(r=>ringArea(r)>0).sort((x,y)=>Math.abs(ringArea(y))-Math.abs(ringArea(x))||key(x[0]).localeCompare(key(y[0]))),holes=rings.filter(r=>ringArea(r)<0);
 const result:Polygon[]=outers.map(r=>[r]);for(const hole of holes){let best=-1,area=Infinity;for(let i=0;i<outers.length;i++){const size=Math.abs(ringArea(outers[i]));if(size<area&&inRing(hole[0],outers[i])){best=i;area=size;}}if(best>=0)result[best].push(hole);}
 for(const poly of result)poly.splice(1,poly.length-1,...poly.slice(1).sort((x,y)=>key(x[0]).localeCompare(key(y[0]))));
 return result.sort((x,y)=>key(x[0][0]).localeCompare(key(y[0][0])));
}
