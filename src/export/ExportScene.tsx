import { ShadedElement,useShadingDefinitions } from '../render/ShadedElement';
import { displayedElement,stackedShadowClip } from '../render/stack';
import type { ExportVariant } from './scene';
const NONE:string[]=[];
export function ExportScene({variant,filterScale=1}:{variant:ExportVariant;filterScale?:number}) {
  const {elements,context,bounds,look,direction,pack,background}=variant;
  const shading=useShadingDefinitions(elements,NONE,{elements,look,direction,style:pack,background:pack.canvasBackground,filterScale});
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${bounds.w} ${bounds.h}`} width={bounds.w} height={bounds.h}>
    {shading.defs}
    {background && <rect width={bounds.w} height={bounds.h} fill={pack.canvasBackground}/>}
    <g transform={`translate(${-bounds.x} ${-bounds.y})`}>
      {elements.map(el=>{const visual=shading.visuals.get(el.id)!;const shown={...displayedElement(el,context,look,direction,{pack}),props:visual.element.props};
        return <ShadedElement key={el.id} el={shown} interactive={false} material={visual.material} effect={shading.effectsByElement.get(el.id)}
          shadowClip={stackedShadowClip(el,context,look,direction,{pack})} shadingId={shading.elementIds.get(el.id)!} heightId={shading.heightIds.get(el.id)} glowId={shading.glowIds.get(el.id)} textureId={shading.textureIds.get(el.id)}/>})}
    </g>
  </svg>;
}
