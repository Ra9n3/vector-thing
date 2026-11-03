import {useEffect,useRef} from 'react';
import {Tooltip} from '@mui/material';
import type {PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent} from 'react';
import {useStore} from '../store';
import {simplifyStroke} from '../profiles/custom';
import type {CustomPoint,CustomProfile} from '../profiles/custom';

type Active={pointerId:number;kind:'stroke'|'handle';index:number;points:CustomPoint[];profile:CustomProfile;startX:number;startY:number;moved:boolean};
export function CustomProfileEditor({profile,draw,mode,width,amplitude,accent,surface}:{profile:CustomProfile|null;draw:boolean;mode:'around'|'across';width:number;amplitude:number;accent:string;surface:string}) {
 const active=useRef<Active|null>(null),frame=useRef(0),group=useRef<SVGGElement>(null);
 const setCustom=useStore(s=>s.setCustomProfile),cancel=useStore(s=>s.cancelCustomProfile);
 const half=mode==='around'||(profile?.mirror??true);
 const at=(e:ReactPointerEvent<SVGElement>|ReactMouseEvent<SVGElement>):CustomPoint=>{
  const matrix=group.current?.getScreenCTM();const point=new DOMPoint(e.clientX,e.clientY);const p=matrix?point.matrixTransform(matrix.inverse()):point;
  return {x:Math.max(0,Math.min(1,p.x/width*(half?2:1))),y:Math.max(0,Math.min(1,-p.y/Math.max(1,amplitude)))};
 };
 const update=(a:Active)=>{const points=a.kind==='stroke'?simplifyStroke(a.points):a.points;setCustom({...a.profile,points},false);};
 const schedule=(a:Active)=>{if(!frame.current)frame.current=requestAnimationFrame(()=>{frame.current=0;if(active.current===a)update(a);});};
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&active.current){cancelAnimationFrame(frame.current);frame.current=0;active.current=null;cancel();}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);cancelAnimationFrame(frame.current);if(active.current)cancel();};},[cancel]);
 const down=(e:ReactPointerEvent<SVGElement>,index=-1)=>{
  if(e.button!==0||(index<0&&!draw))return;e.stopPropagation();const point=at(e);
  const current=profile??{points:[{x:0,y:point.y},{x:1,y:point.y}],mirror:true,smooth:.5};
  active.current={pointerId:e.pointerId,kind:index<0?'stroke':'handle',index,points:index<0?[point]:current.points.map(p=>({...p})),profile:current,startX:e.clientX,startY:e.clientY,moved:false};
  group.current?.setPointerCapture(e.pointerId);
 };
 const move=(e:ReactPointerEvent<SVGGElement>)=>{const a=active.current;if(!a||a.pointerId!==e.pointerId)return;const p=at(e);if(!a.moved&&Math.hypot(e.clientX-a.startX,e.clientY-a.startY)<1)return;a.moved=true;
  if(a.kind==='stroke')a.points.push(p);else {const i=a.index,prev=a.points[i-1]?.x??0,next=a.points[i+1]?.x??1;p.x=i===0?0:i===a.points.length-1?1:Math.max(prev+.00001,Math.min(next-.00001,p.x));a.points[i]=p;}schedule(a);
 };
 const end=(e:ReactPointerEvent<SVGGElement>)=>{const a=active.current;if(!a||a.pointerId!==e.pointerId)return;move(e);active.current=null;cancelAnimationFrame(frame.current);frame.current=0;
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  if(a.moved)setCustom({...a.profile,points:a.kind==='stroke'?simplifyStroke(a.points):a.points},true);
 };
 const add=(e:ReactMouseEvent<SVGElement>)=>{if(!profile||profile.points.length>=12)return;e.stopPropagation();const p=at(e);if(p.x<=0||p.x>=1||profile.points.some(q=>Math.abs(q.x-p.x)<.00001))return;setCustom({...profile,points:[...profile.points,p].sort((a,b)=>a.x-b.x)},true);};
 return <g ref={group} onPointerMove={move} onPointerUp={end} onPointerCancel={()=>{active.current=null;cancelAnimationFrame(frame.current);frame.current=0;cancel();}}>
  {draw&&<rect x={0} y={-amplitude} width={width} height={amplitude} fill="transparent" pointerEvents="all" onPointerDown={e=>down(e)} />}
  {profile&&<path d={surface} fill="none" stroke="transparent" strokeWidth={16} pointerEvents="stroke" onPointerDown={e=>down(e)} onDoubleClick={add} />}
  {profile?.points.map((p,i)=><Tooltip key={i} title={`Point ${i+1}`}><circle cx={width*p.x/(half?2:1)} cy={-amplitude*p.y} r={5} fill="#f3f1ff" stroke={accent} strokeWidth={2} role="slider" aria-label={`Point ${i+1}`} tabIndex={0}
   style={{cursor:'move',touchAction:'none'}} onPointerDown={e=>down(e,i)} onDoubleClick={e=>{e.stopPropagation();if(profile.points.length>2)setCustom({...profile,points:profile.points.filter((_,j)=>j!==i)},true);}} /></Tooltip>)}
 </g>;
}
