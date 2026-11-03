import { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import { shapePath } from '../geometry/shapePath';
import { resolveMode } from '../profiles/sample';
import type { Element } from '../store';
import { acrossStops } from './acrossGradient';
import { AroundFilter, AroundHeightmap } from './AroundFilter';
import { resolveMaterial } from '../materials/resolve';
import { GlowDefinition, GlowHalo } from './GlowHalo';
import { TextureDefinition, TextureOverlay } from './TextureOverlay';
import { shadingSpec } from './shadingKey';
import type { ShadingSpec } from './shadingKey';
import type { Direction, Look } from '../viewTypes';
import type { StylePack } from '../styles/types';
import { visualElement } from '../states/visual';
import type { StateFrame } from '../states/visual';
import type { Material } from '../materials/types';
import { effectKey, effectSpec } from './effectSpec';
import type { EffectSpec } from './effectSpec';
import { WallDefinition, WallLayer } from './WallLayer';
import { ShadowDefinition, ShadowLayer } from './ShadowLayer';
import { RecessDefinition, RecessLayer } from './RecessLayer';

const EffectDefinition = memo(function EffectDefinition({id,spec}:{id:string;spec:EffectSpec}) {
  return <><WallDefinition id={id} spec={spec}/><ShadowDefinition id={id} spec={spec}/>{spec.recessed && <RecessDefinition id={id} spec={spec}/>}</>;
}, (a,b) => a.id === b.id && a.spec.key === b.spec.key);

const Definition = memo(function Definition({ id, spec, mapId, filterScale=1 }: { id: string; spec: ShadingSpec; mapId?: string; filterScale?:number }) {
  if (import.meta.env.DEV) {
    const counts = (globalThis as typeof globalThis & { __qaSurfaceBuilds?: Record<string, number> }).__qaSurfaceBuilds;
    if (counts) counts[id] = (counts[id] ?? 0) + 1;
  }
  const { width, height, profile, mode, axis, material } = spec;
  if (mode === 'around') return <AroundFilter id={id} mapId={mapId!} width={width} height={height} profile={profile} material={material} relief={spec.relief} filterScale={filterScale} />;
  const stops = acrossStops(profile, material, axis === 'vertical' ? height : width, spec.relief, axis);
  return <linearGradient id={id} x1="0" y1="0" x2={axis === 'horizontal' ? '1' : '0'} y2={axis === 'vertical' ? '1' : '0'}>
    {stops.map((stop, i) => <stop key={i} offset={stop.offset} stopColor={stop.color} />)}
  </linearGradient>;
}, (a, b) => a.id === b.id && a.spec.key === b.spec.key && a.mapId === b.mapId && a.filterScale === b.filterScale);

/** IDs are local to this canvas, collision-free, and stable while a definition is in use. */
export function useShadingDefinitions(elements: Element[], selection: string[], effects?: { elements: Element[]; look: Look; direction: Direction; style: StylePack; background?:string; frames?:Map<string,StateFrame>; surfaceOnly?:boolean; filterScale?:number }) {
  const prefix = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const ids = useRef(new Map<string, string>());
  const nextId = useRef(0);
  const auxIds = useRef(new Map<string, string>());
  const effectIds = useRef(new Map<string, string>());
  const effectCache = useRef(new Map<string, EffectSpec>());
  const effectEntries = useRef(new Map<string, { id:string; spec:EffectSpec }>());
  const shadeDefs=useRef(new Map<string,{id:string;spec:ShadingSpec;mapId?:string}>());
  const geometryDefs=useRef(new Map<string,{id:string;spec:ShadingSpec}>());
  const auxDefs=useRef(new Map<string,{id:string;spec:ShadingSpec;kind:'glow'|'texture'}>());
  const result = useMemo(() => {
    if (elements.length === 0 && (!effects || effects.elements.length === 0)) {
      ids.current.clear(); auxIds.current.clear(); effectIds.current.clear(); effectCache.current.clear();
      effectEntries.current.clear(); shadeDefs.current.clear(); geometryDefs.current.clear(); auxDefs.current.clear();
    }
    const unique = new Map<string, ShadingSpec>();
    const elementIds = new Map<string, string>();
    const glowIds = new Map<string, string>();
    const heightIds = new Map<string, string>();
    const bodyMapIds = new Map<string, string>();
    const geometry = new Map<string, { id: string; spec: ShadingSpec }>();
    const textureIds = new Map<string, string>();
    const visuals = new Map<string,ReturnType<typeof visualElement>>();
    const aux = new Map<string, { id: string; spec: ShadingSpec; kind: 'glow' | 'texture' }>();
    const addAux = (key: string, spec: ShadingSpec, kind: 'glow' | 'texture') => {
      if (!auxIds.current.has(key)) auxIds.current.set(key, `shading-${prefix}-aux-${nextId.current++}`);
      const id = auxIds.current.get(key)!;
      aux.set(key, { id, spec, kind });
      return id;
    };
    for (const el of elements) {
      const visual=effects ? visualElement(el,effects.style,effects.background ?? effects.style.canvasBackground,effects.frames?.get(el.id),effects.surfaceOnly) : undefined;
      const spec = visual ? shadingSpec(visual.element,{material:visual.material,state:visual.frame.state,press:visual.frame.press,pressMode:effects!.style.pressMode}) : shadingSpec(el);
      if(visual) visuals.set(el.id,visual);
      unique.set(spec.filterKey, spec);
      if (!ids.current.has(spec.filterKey)) ids.current.set(spec.filterKey, `shading-${prefix}-${nextId.current++}`);
      elementIds.set(el.id, ids.current.get(spec.filterKey)!);
      if (spec.mode === 'around') {
        const key = JSON.stringify(['heightmap', spec.type, spec.width, spec.height, spec.profile]);
        if (!auxIds.current.has(key)) auxIds.current.set(key, `shading-${prefix}-map-${nextId.current++}`);
        const mapId = auxIds.current.get(key)!;
        geometry.set(key, { id: mapId, spec });
        bodyMapIds.set(spec.filterKey, mapId);
        heightIds.set(el.id, mapId);
      }
      if (spec.material.glow) {
        const key = JSON.stringify(['glow', spec.width, spec.height, spec.material.glow.radius]);
        glowIds.set(el.id, addAux(key, spec, 'glow'));
      }
      if (spec.material.texture) {
        const key = JSON.stringify(['texture', spec.material.id, spec.material.texture]);
        textureIds.set(el.id, addAux(key, spec, 'texture'));
      }
    }
    for(const [key,spec] of unique) if(!shadeDefs.current.has(key)) shadeDefs.current.set(key,{id:ids.current.get(key)!,spec,mapId:bodyMapIds.get(key)});
    for(const [key,entry] of geometry) geometryDefs.current.set(key,entry);
    for(const [key,entry] of aux) auxDefs.current.set(key,entry);
    const effectsByElement = new Map<string, { id: string; spec: EffectSpec }>();
    const uniqueEffects = new Map<string, { id: string; spec: EffectSpec }>();
    if (effects) for (const el of effects.elements) {
      const visual=visualElement(el,effects.style,effects.background ?? effects.style.canvasBackground,effects.frames?.get(el.id),effects.surfaceOnly);
      visuals.set(el.id,visual);
      const input = { type:el.type, width:el.width, height:el.height, profile:visual.element.props.profile,
        material:visual.material, look:effects.look, direction:effects.direction, style:effects.style, press:visual.frame.press, state:visual.frame.state };
      const key = effectKey(input);
      let spec = effectCache.current.get(key);
      if (!spec) { spec = effectSpec(input); effectCache.current.set(key,spec); }
      if (!effectIds.current.has(key)) effectIds.current.set(key,`effect-${prefix}-${nextId.current++}`);
      let entry = effectEntries.current.get(key);
      if (!entry) { entry = { id: effectIds.current.get(key)!, spec }; effectEntries.current.set(key, entry); }
      uniqueEffects.set(key,entry); effectsByElement.set(el.id,entry);
    }
    // Keep recently used definitions mounted so quantized states can reuse the same SVG nodes.
    // Bound the cache during resize and other continuous geometry edits.
    const trim=<T,>(cache:Map<string,T>,active:Map<string,unknown>,remove?:(key:string)=>void)=>{
      if(cache.size<=256)return;
      for(const key of cache.keys()){if(cache.size<=256)break;if(!active.has(key)){cache.delete(key);remove?.(key);}}
    };
    trim(shadeDefs.current,unique,key=>ids.current.delete(key));
    trim(geometryDefs.current,geometry,key=>auxIds.current.delete(key));
    trim(auxDefs.current,aux,key=>auxIds.current.delete(key));
    trim(effectEntries.current,uniqueEffects,key=>{effectIds.current.delete(key);effectCache.current.delete(key);});
    if (import.meta.env.DEV) {
      const qa=globalThis as typeof globalThis & {__qaDefsSizes?: number[]};
      if (qa.__qaDefsSizes) qa.__qaDefsSizes=[ids.current.size,auxIds.current.size,effectIds.current.size,effectCache.current.size,effectEntries.current.size,shadeDefs.current.size,geometryDefs.current.size,auxDefs.current.size];
    }
    const defs = <defs>
      {Array.from(effectEntries.current.values(), ({id,spec}) => <EffectDefinition key={id} id={id} spec={spec}/>)}
      {Array.from(geometryDefs.current, ([key, { id, spec }]) => <AroundHeightmap key={key} id={id} geometryKey={key}
        type={spec.type} width={spec.width} height={spec.height} profile={spec.profile} />)}
      {Array.from(shadeDefs.current, ([key,{id,spec,mapId}]) => <Definition key={key} id={id} spec={spec} mapId={mapId} filterScale={effects?.filterScale} />)}
      {Array.from(auxDefs.current.values(), ({ id, spec, kind }) => kind === 'glow'
        ? <GlowDefinition key={id} id={id} width={spec.width} height={spec.height} radius={spec.material.glow!.radius} />
        : <TextureDefinition key={id} id={id} material={spec.material} />)}
    </defs>;
    return { defs, elementIds, glowIds, textureIds, heightIds, bodyMapIds, unique, effectsByElement, visuals };
  }, [elements, prefix, effects?.elements, effects?.look, effects?.direction, effects?.style, effects?.background, effects?.frames, effects?.surfaceOnly, effects?.filterScale]);

  // Cache a low-cost preview of each filtered surface for group resize gestures.
  // The live SVG filter remains authoritative and is restored as soon as the drag ends.
  const bitmaps = useRef(new Map<string, string>());
  const pending = useRef(new Set<string>());
  const [, refresh] = useState(0);
  const selectedShadingKeys = selection.length > 1 ? selection.map((id) => result.elementIds.get(id) ?? '').join('|') : '';
  useEffect(() => {
    const wanted = new Set(selection.length > 1
      ? selection.map((id) => result.elementIds.get(id)).filter((id): id is string => Boolean(id))
      : []);
    const active = new Set([...result.unique.keys()].filter((key) => wanted.has(ids.current.get(key) ?? '')));
    for (const key of bitmaps.current.keys()) if (!active.has(key)) bitmaps.current.delete(key);
    let cancelled = false;
    const timer = window.setTimeout(() => {
      for (const spec of result.unique.values()) {
        if (!active.has(spec.filterKey) || spec.mode !== 'around' || bitmaps.current.has(spec.filterKey) || pending.current.has(spec.filterKey)) continue;
        const id = ids.current.get(spec.filterKey);
        const group = document.getElementById(result.bodyMapIds.get(spec.filterKey) ?? '');
        const filter = id && document.getElementById(id);
        if (!id || !group || !filter) continue;
        pending.current.add(spec.filterKey);
        const { width, height } = spec;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${group.outerHTML}${filter.outerHTML}</defs><rect width="${width}" height="${height}" fill="white" filter="url(#${id})"/></svg>`;
        const image = new Image();
        image.onload = () => {
          pending.current.delete(spec.filterKey);
          if (cancelled || ids.current.get(spec.filterKey) !== id) return;
          try {
            const scale = Math.min(2, 512 / Math.max(width, height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.ceil(width * scale));
            canvas.height = Math.max(1, Math.ceil(height * scale));
            const context = canvas.getContext('2d');
            if (!context) return;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            bitmaps.current.set(spec.filterKey, canvas.toDataURL());
            refresh((v) => v + 1);
          } catch { /* The live filter is the fallback. */ }
        };
        image.onerror = () => { pending.current.delete(spec.filterKey); };
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      }
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  // Position changes leave definition IDs unchanged and must not restart raster work.
  }, [selectedShadingKeys]);
  const previews = new Map<string, string>();
  for (const [key] of result.unique) {
    const id = ids.current.get(key);
    const bitmap = bitmaps.current.get(key);
    if (id && bitmap) previews.set(id, bitmap);
  }
  return { defs: result.defs, elementIds: result.elementIds, glowIds: result.glowIds, textureIds: result.textureIds, heightIds: result.heightIds, effectsByElement: result.effectsByElement, visuals:result.visuals, previews };
}

export function ShadedElement({ el, shadingId, heightId, glowId, textureId, original, preview, effect, tilt = true, material:materialOverride, shadowClip, animating = false, interactive = true }: {
  el: Element; shadingId: string; heightId?: string; glowId?: string; textureId?: string; original?: Element; preview?: string;
  effect?: { id:string; spec:EffectSpec }; tilt?: boolean; material?:Material; animating?:boolean; interactive?:boolean;
  shadowClip?: {type:Element['type']; width:number; height:number; x:number; y:number};
}) {
  const unique = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const mode = resolveMode(el.props.profile, el.type);
  const material = materialOverride ?? resolveMaterial(el.props.material, el.props.customColor);
  const path = shapePath(el.type, el.width, el.height);
  const active = tilt ? effect : undefined;
  const offset = active?.spec.capOffset ?? {x:0,y:0};
  const previewClip = `resize-clip-${el.id}`;
  const resizing = original && mode === 'around';
  const cap = <g transform={`translate(${offset.x} ${offset.y})`} opacity={material.opacity}>
    {mode === 'across' ? <path d={path} fill={`url(#${shadingId})`} /> : resizing
      ? <>
        <clipPath id={previewClip} clipPathUnits="userSpaceOnUse"><path d={path} /></clipPath>
        <g clipPath={`url(#${previewClip})`}><g transform={`scale(${el.width / original.width} ${el.height / original.height})`}>
          {preview ? <image width={original.width} height={original.height} href={preview} preserveAspectRatio="none" />
            : <rect width={original.width} height={original.height} fill={material.color} filter={`url(#${shadingId})`} />}
        </g></g>
      </>
      : <g clipPath={`url(#${heightId}-clip)`}><path d={path} fill={material.color} filter={`url(#${shadingId})`} /></g>}
    <TextureOverlay path={path} material={material} textureId={textureId} />
  </g>;
  return <g transform={`translate(${el.x} ${el.y})`} data-el={el.id} style={{ cursor: 'move', transition:animating ? 'transform 30ms linear' : undefined }}>
    {shadowClip && <defs>
      {shadowClip && <clipPath id={`stack-clip-${unique}`} clipPathUnits="userSpaceOnUse"><path d={shapePath(shadowClip.type,shadowClip.width,shadowClip.height)} transform={`translate(${shadowClip.x} ${shadowClip.y})`}/></clipPath>}
    </defs>}
    {active?.spec.recessed ? <RecessLayer id={active.id} spec={active.spec}>{cap}</RecessLayer> : <>
      {active && <g clipPath={shadowClip ? `url(#stack-clip-${unique})` : undefined}><ShadowLayer id={active.id} spec={active.spec}/></g>}
      <g transform={`translate(${offset.x} ${offset.y})`} pointerEvents="none"><GlowHalo path={path} material={material} filterId={glowId}/></g>
      {active && <WallLayer id={active.id}/>}
      {cap}
    </>}
    {interactive && active && <path d={active.spec.hitPath} fill="transparent" pointerEvents="all" />}
  </g>;
}
