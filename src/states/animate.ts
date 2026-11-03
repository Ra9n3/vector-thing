import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Element } from '../selection/types';
import type { StylePack } from '../styles/types';
import { finalFrame, type StateFrame } from './visual';
export const STEPS=[0,.25,.5,.75,1] as const;
export const quantizePress=(value:number)=>Math.round(Math.max(0,Math.min(1,value))*4)/4;
export const animationSteps=(reducedMotion:boolean)=>reducedMotion?[1]:[...STEPS];
export function useStateAnimation(elements:Element[],pack:StylePack,version:number,instantVersion:number):Map<string,StateFrame> {
  const previous=useRef({elements,pack,version,instantVersion});
  const timers=useRef<number[]>([]);
  const [frames,setFrames]=useState<Map<string,StateFrame>>(new Map());
  const cancel=()=>{timers.current.forEach(clearTimeout);timers.current=[];};
  useEffect(()=>()=>cancel(),[]);
  // Update only after commit: mutating this ref during render loses the previous
  // state under StrictMode's intentional double render.
  useLayoutEffect(()=>{
    const before=previous.current; previous.current={elements,pack,version,instantVersion};
    if(before.instantVersion!==instantVersion || before.pack!==pack) {cancel();setFrames(new Map());return;}
    if(before.version===version)return;
    cancel();
    if(typeof window!=='undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {setFrames(new Map());return;}
    const oldById=new Map(before.elements.map(e=>[e.id,e]));
    const changed=elements.filter(e=>{const old=oldById.get(e.id);if(!old || (old.state ?? 'default')===(e.state ?? 'default'))return false;
      return e.pressable!==false || !!e.stateOverrides || old.state==='disabled' || e.state==='disabled';
    });
    if(!changed.length){setFrames(new Map());return;}
    const calc=(t:number)=>new Map(changed.map(e=>{
      const old=finalFrame(oldById.get(e.id)!,pack),next=finalFrame(e,pack);
      return [e.id,{state:t<.5?old.state:next.state,press:quantizePress(old.press+(next.press-old.press)*t),
        offset:{x:old.offset.x+(next.offset.x-old.offset.x)*t,y:old.offset.y+(next.offset.y-old.offset.y)*t}}] as const;
    }));
    setFrames(calc(0));
    timers.current=STEPS.slice(1).map(t=>window.setTimeout(()=>setFrames(calc(t)),t*120));
    timers.current.push(window.setTimeout(()=>setFrames(new Map()),150));
  });
  return frames;
}
