import { memo } from 'react';
import type { Element } from '../store';
import { ShadedElement } from '../render/ShadedElement';
import type { Material } from '../materials/types';
import type { EffectSpec } from '../render/effectSpec';

export const ElementView = memo(function ElementView({ el, shadingId, heightId, glowId, textureId, original, preview, effect, shadowClip, material, animating }: { el: Element; shadingId: string; heightId?: string; glowId?: string; textureId?: string; original?: Element; preview?: string; effect?: { id:string; spec:EffectSpec }; shadowClip?: {type:Element['type'];outline?:Element['outline'];width:number;height:number;x:number;y:number}; material?:Material; animating?:boolean }) {
  if (import.meta.env.DEV) {
    const counts = (globalThis as typeof globalThis & { __qaRenderCounts?: Record<string,number> }).__qaRenderCounts;
    if (counts) counts[el.id] = (counts[el.id] ?? 0) + 1;
  }
  return <ShadedElement el={el} shadingId={shadingId} heightId={heightId} glowId={glowId} textureId={textureId} original={original} preview={preview} effect={effect} material={material} animating={animating} shadowClip={shadowClip} />;
}, (a,b) => {
  const x=a.el,y=b.el;
  return x.id===y.id && x.type===y.type && x.outline===y.outline && x.x===y.x && x.y===y.y && x.width===y.width && x.height===y.height
    && x.props.profile===y.props.profile && a.shadingId===b.shadingId && a.heightId===b.heightId
    && a.glowId===b.glowId && a.textureId===b.textureId && a.original===b.original && a.preview===b.preview
    && a.effect===b.effect && a.animating===b.animating && JSON.stringify(a.material)===JSON.stringify(b.material)
    && JSON.stringify(a.shadowClip)===JSON.stringify(b.shadowClip);
});
