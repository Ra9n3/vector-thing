import type {Point,Ring} from './polygon';
const mid=(a:Point,b:Point):Point=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
const lineDistance=(p:Point,a:Point,b:Point)=>{const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/length)):0;return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));};
/** Flattens a cubic with a maximum control-point distance from its chord. */
export function flattenCubic(a:Point,b:Point,c:Point,d:Point,tolerance=.25):Ring {
 if(!(tolerance>0))throw new Error('Invalid tolerance');const out:Ring=[a];
 const walk=(p:Point,q:Point,r:Point,s:Point,depth:number)=>{if(depth>=20||Math.max(lineDistance(q,p,s),lineDistance(r,p,s))<=tolerance){out.push(s);return;}const pq=mid(p,q),qr=mid(q,r),rs=mid(r,s),pqr=mid(pq,qr),qrs=mid(qr,rs),center=mid(pqr,qrs);walk(p,pq,pqr,center,depth+1);walk(center,qrs,rs,s,depth+1);};
 walk(a,b,c,d,0);return out;
}
export function flattenQuadratic(a:Point,b:Point,c:Point,tolerance=.25):Ring {
 const q={x:a.x+(b.x-a.x)*2/3,y:a.y+(b.y-a.y)*2/3},r={x:c.x+(b.x-c.x)*2/3,y:c.y+(b.y-c.y)*2/3};return flattenCubic(a,q,r,c,tolerance);
}
export function flattenCircle(cx:number,cy:number,radius:number,tolerance=.25):Ring {
 if(!Number.isFinite(radius)||radius<=0||!(tolerance>0))throw new Error('Invalid circle');
 const angle=2*Math.asin(Math.sqrt(Math.min(tolerance,radius)/(2*radius)));
 const count=Math.min(2000,Math.max(8,Math.ceil(Math.PI/angle)));
 return Array.from({length:count},(_,i)=>({x:cx+radius*Math.cos(2*Math.PI*i/count),y:cy+radius*Math.sin(2*Math.PI*i/count)}));
}
