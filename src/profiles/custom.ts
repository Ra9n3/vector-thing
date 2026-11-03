export interface CustomPoint { x:number; y:number }
export interface CustomProfile { points:CustomPoint[]; mirror:boolean; smooth:number }
const clamp=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));

/** Clamp and discard backwards movement while retaining the latest height at each x. */
export function monotoneStroke(input:CustomPoint[]):CustomPoint[] {
  const out:CustomPoint[]=[];
  for(const p of input){if(!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;const point={x:clamp(p.x),y:clamp(p.y)};
    const last=out[out.length-1];if(last&&point.x<last.x)continue;if(last&&point.x===last.x)out[out.length-1]=point;else out.push(point);
  }
  if(!out.length)return [{x:0,y:0},{x:1,y:0}];
  if(out.length===1)return [{x:0,y:out[0].y},{x:1,y:out[0].y}];
  out[0]={...out[0],x:0};out[out.length-1]={...out[out.length-1],x:1};return out;
}

function rdp(points:CustomPoint[],epsilon:number):CustomPoint[] {
  if(points.length<3)return points.slice();const a=points[0],b=points[points.length-1],dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy;
  let distance=-1,index=0;for(let i=1;i<points.length-1;i++){const p=points[i];const t=den?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/den)):0;const d=Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);if(d>distance){distance=d;index=i;}}
  return distance>epsilon?[...rdp(points.slice(0,index+1),epsilon).slice(0,-1),...rdp(points.slice(index),epsilon)]:[a,b];
}
export function simplifyStroke(input:CustomPoint[],maxPoints=12):CustomPoint[] {
  const points=monotoneStroke(input),limit=Math.max(2,Math.min(12,Math.floor(maxPoints)));if(points.length<=limit)return points;
  let lo=0,hi=2,result=rdp(points,hi);for(let i=0;i<32;i++){const mid=(lo+hi)/2,candidate=rdp(points,mid);if(candidate.length>limit)lo=mid;else{hi=mid;result=candidate;}}
  return result;
}

/** Shape-preserving cubic Hermite interpolation, blended with linear interpolation. */
export function customSampler(input:CustomPoint[],smooth=0.5):(x:number)=>number {
  const p=monotoneStroke(input),widths=p.slice(0,-1).map((v,i)=>p[i+1].x-v.x),d=widths.map((w,i)=>(p[i+1].y-p[i].y)/w);
  const slopes=new Array<number>(p.length);slopes[0]=d[0];slopes[p.length-1]=d[d.length-1];
  for(let i=1;i<p.length-1;i++){
    if(d[i-1]*d[i]<=0)slopes[i]=0;
    else {const a=2*widths[i]+widths[i-1],b=widths[i]+2*widths[i-1];slopes[i]=(a+b)/(a/d[i-1]+b/d[i]);}
  }
  const mix=clamp(smooth);
  return (position:number)=>{const x=clamp(position);let i=0;while(i<p.length-2&&x>=p[i+1].x)i++;const w=widths[i],t=clamp((x-p[i].x)/w),y0=p[i].y,y1=p[i+1].y;
    const cubic=(2*t**3-3*t**2+1)*y0+(t**3-2*t**2+t)*w*slopes[i]+(-2*t**3+3*t**2)*y1+(t**3-t**2)*w*slopes[i+1];
    return clamp((1-mix)*(y0+(y1-y0)*t)+mix*cubic);
  };
}
export function customLookup(profile:CustomProfile,mode:'around'|'across'):number[] {
  const sample=customSampler(profile.points,Number.isFinite(profile.smooth)?profile.smooth:.5);
  return Array.from({length:64},(_,i)=>{const x=mode==='across'&&profile.mirror!==false?2*Math.min(i,63-i)/63:i/63;return sample(x);});
}
export function lookupHash(values:number[]):string {
  let hash=2166136261;for(const value of values){const n=Math.round(clamp(value)*1e6);for(let shift=0;shift<32;shift+=8)hash=Math.imul(hash^((n>>>shift)&255),16777619);}return (hash>>>0).toString(36);
}
