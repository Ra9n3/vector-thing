import { memo, useId } from 'react';
import type { ThumbGeometry } from '../render/thumbGeometry';

export const DirectionThumb = memo(function DirectionThumb({ geometry }: { geometry: ThumbGeometry }) {
  const id = `direction-thumb-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const { cap, capOffset, wall, shadow, shadowColor, shadowOpacity, highlight, stops, opacity } = geometry;
  return <svg aria-hidden="true" width="40" height="40" viewBox="0 0 40 40" style={{ display: 'block' }}>
    <defs><radialGradient id={id} cx="32%" cy="27%" r="75%">
      {stops.map((color, i) => <stop key={i} offset={['0%', '23%', '58%', '100%'][i]} stopColor={color} />)}
    </radialGradient></defs>
    <g transform="translate(10 10)">
      {highlight && <path d={cap} transform={`translate(${-shadow.x} ${-shadow.y})`} fill={highlight.color} opacity={highlight.strength * 0.28} />}
      <path d={cap} transform={`translate(${shadow.x} ${shadow.y})`} fill={shadowColor} opacity={shadowOpacity} />
      <g opacity={opacity}>
        {wall.map((facet, i) => <path key={i} d={facet.d} fill={facet.fill} stroke={facet.fill} strokeWidth={0.2} />)}
        <path d={cap} transform={`translate(${capOffset.x} ${capOffset.y})`} fill={`url(#${id})`} />
      </g>
    </g>
  </svg>;
});
