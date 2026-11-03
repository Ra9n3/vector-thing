import type { ReactNode } from 'react';
import { shapePath } from '../geometry/shapePath';
import type { EffectSpec } from './effectSpec';
import { WallLayer } from './WallLayer';
export function RecessDefinition({id,spec}:{id:string;spec:EffectSpec}) {
  return <clipPath id={`${id}-rim`} clipPathUnits="userSpaceOnUse"><path d={shapePath(spec.type,spec.width,spec.height)} /></clipPath>;
}
export function RecessLayer({ id, spec, children }: { id:string; spec:EffectSpec; children:ReactNode }) {
  const offset = Math.min(4,0.15*spec.wall)*Math.SQRT1_2;
  return <g clipPath={`url(#${id}-rim)`}>
    <WallLayer id={id}/>
    {children}
    <path d={spec.innerPath} fill={spec.style.shadow.color} fillRule="evenodd" opacity={spec.style.shadow.strength*(spec.mods.length===1?1:spec.mods.strength)}
      transform={`translate(${offset} ${offset})`} filter={`url(#${id}-inner)`} pointerEvents="none"/>
  </g>;
}
