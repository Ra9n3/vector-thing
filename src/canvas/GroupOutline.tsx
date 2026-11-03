import { shapePath } from '../geometry/shapePath';
import type { Element } from '../selection/types';
export function GroupOutline({element,panX,panY,zoom,accent,dashed=false,hover=false}: {element:Element;panX:number;panY:number;zoom:number;accent:string;dashed?:boolean;hover?:boolean}) {
  const transform=`translate(${panX+element.x*zoom} ${panY+element.y*zoom}) scale(${zoom})`;
  return <path d={shapePath(element.type,element.width,element.height)} transform={transform} fill="none" stroke={accent}
    strokeWidth={hover?2:1.25} strokeDasharray={dashed?'3 3':undefined} vectorEffect="non-scaling-stroke" pointerEvents="none" />;
}
