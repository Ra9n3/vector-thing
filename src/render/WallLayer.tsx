import type { EffectSpec } from './effectSpec';

export function WallDefinition({ id, spec }: { id:string; spec:EffectSpec }) {
  const { capOffset, facets, material } = spec;
  return <>
    {material.opacity >= 1 && facets.length > 0 && <linearGradient id={`${id}-ao`} gradientUnits="userSpaceOnUse" x1={capOffset.x} y1={capOffset.y} x2={0} y2={0}>
      <stop offset="0" stopColor="#000" stopOpacity={0}/><stop offset="1" stopColor="#000" stopOpacity={0.25}/>
    </linearGradient>}
    <g id={`${id}-wall`} opacity={material.opacity} pointerEvents="none">
      {facets.map((facet,i)=><path key={i} d={facet.d} fill={facet.fill} stroke={facet.fill} strokeWidth={0.5} strokeLinejoin="round" />)}
      {material.opacity >= 1 && facets.length > 0 && <path d={facets.map(f=>f.d).join('')} fill={`url(#${id}-ao)`} />}
    </g>
  </>;
}
export function WallLayer({ id }: { id:string }) { return <use href={`#${id}-wall`} pointerEvents="none" />; }
