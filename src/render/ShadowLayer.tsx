import type { EffectSpec } from './effectSpec';
export function ShadowDefinition({ id, spec }: { id:string; spec:EffectSpec }) {
  const { width, height, paths, shadow }=spec;
  const pad = 4 * Math.max(paths.blur, 2) + Math.max(Math.abs(shadow.x),Math.abs(shadow.y)) + 8;
  const region={filterUnits:'userSpaceOnUse' as const,x:-pad,y:-pad,width:width+2*pad,height:height+2*pad};
  return <>
    {!spec.recessed && <><filter id={`${id}-blur`} {...region}><feGaussianBlur stdDeviation={paths.blur}/></filter>
    <filter id={`${id}-contact`} {...region}><feGaussianBlur stdDeviation={1.5}/></filter></>}
    {spec.recessed && <filter id={`${id}-inner`} {...region}><feGaussianBlur stdDeviation={2}/></filter>}
  </>;
}
export function ShadowLayer({ id, spec }: { id:string; spec:EffectSpec }) {
  const { paths, style, mods }=spec;
  return <g pointerEvents="none">
    {style.highlightShadow && <path d={paths.highlight} fill={style.highlightShadow.color} opacity={style.highlightShadow.strength*(spec.mods.length===1?1:spec.mods.strength)} filter={`url(#${id}-blur)`}/>}
    <path d={paths.cast} fill={style.shadow.color} opacity={style.shadow.strength*(mods.length===1?1:mods.strength)} filter={`url(#${id}-blur)`}/>
    <path d={paths.footprint} transform={`translate(${paths.contact.x} ${paths.contact.y})`} fill={style.shadow.color} opacity={Math.min(1,style.shadow.strength*0.6*mods.strength)} filter={`url(#${id}-contact)`}/>
  </g>;
}
