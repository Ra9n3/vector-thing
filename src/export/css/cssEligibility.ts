import type { Element } from '../../selection/types';
import { resolveMaterial } from '../../materials/resolve';
export function cssEligibility(elements:Element[]) {
  return {eligible:!elements.some(e=>(e.type==='hexagon'||String(e.type)==='path')||e.props.profile.kind==='custom'),textureDropped:elements.some(e=>!!resolveMaterial(e.props.material,e.props.customColor).texture)};
}
