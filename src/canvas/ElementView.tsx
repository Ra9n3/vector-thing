import { memo, useMemo } from 'react';
import { shapePath } from '../geometry/shapePath';
import type { Element } from '../store';

export const ElementView = memo(function ElementView({ el }: { el: Element }) {
  const d = useMemo(() => shapePath(el.type, el.width, el.height), [el.type, el.width, el.height]);
  return (
    <path
      data-el={el.id}
      d={d}
      transform={`translate(${el.x} ${el.y})`}
      fill="#80858e"
      stroke="#4a4e56"
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
      style={{ cursor: 'move' }}
    />
  );
});
