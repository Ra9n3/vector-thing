import type {OutlineData} from '../outline/types';
import { memo } from 'react';
import { shapePath } from '../geometry/shapePath';
import type { ShapeType } from '../geometry/shapePath';
import type { ResolvedProfile } from '../profiles/types';
import { aroundHeightmap, heightmapPitch, HEIGHTMAP_PADDING } from './aroundHeightmap';
import { LIGHT_AZIMUTH, LIGHT_ELEVATION } from './lighting';
import { filterParams } from './filterParams';
import { surfaceMaterial } from './shade';
import type { Material } from '../materials/types';

interface GeometryProps { id: string; type: ShapeType; width: number; height: number; profile: ResolvedProfile; outline?:OutlineData; geometryKey: string }
interface FilterProps extends Omit<GeometryProps, 'geometryKey'> { material: Material; relief: number; filterScale?:number }
const gray = (n: number) => `rgb(${n * 100}%, ${n * 100}%, ${n * 100}%)`;

/** Geometry is independent of material and remains mounted across style changes. */
export const AroundHeightmap = memo(function AroundHeightmap({ id, type, width, height, profile, outline }: GeometryProps) {
  const map = aroundHeightmap(type, width, height, profile,outline);
  const pad = map.padding;
  return <>
    {/* feImage positions its referenced content relative to the padded box. */}
    <g id={id}>
      <rect x={0} y={0} width={width + 2 * pad} height={height + 2 * pad} fill={gray(map.edgeGray)} />
      <g transform={`translate(${pad} ${pad})`}>{map.rings.map((ring, i) => <path key={i} d={ring.path} fill={gray(ring.gray)} />)}</g>
    </g>
    <clipPath id={`${id}-clip`} clipPathUnits="userSpaceOnUse"><path d={shapePath(type, width, height,outline)} /></clipPath>
  </>;
}, (a, b) => a.id === b.id && a.geometryKey === b.geometryKey);

// Firefox does not render local fragment references in feImage. Embed the same geometry as an image.
const embeddedMaps = new Map<string,string>();
function embeddedHeightmap(type:ShapeType, width:number, height:number, profile:ResolvedProfile, outline?:OutlineData):string {
  const key=JSON.stringify([type,width,height,profile,outline]);
  const cached=embeddedMaps.get(key);
  if(cached) return cached;
  const map=aroundHeightmap(type,width,height,profile,outline), pad=map.padding;
  const w=width+2*pad,h=height+2*pad;
  const rings=map.rings.map(r=>`<path d="${r.path}" fill="${gray(r.gray)}"/>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${gray(map.edgeGray)}"/><g transform="translate(${pad} ${pad})">${rings}</g></svg>`;
  const uri=`data:image/svg+xml;base64,${btoa(svg)}`;
  embeddedMaps.set(key,uri);
  if(embeddedMaps.size>256) embeddedMaps.delete(embeddedMaps.keys().next().value!);
  return uri;
}

export function AroundFilter({ id, type, width, height, profile, outline, material, relief, filterScale=1 }: FilterProps) {
  const pad = HEIGHTMAP_PADDING;
  const pitch = heightmapPitch(width, height);
  const light = <feDistantLight azimuth={LIGHT_AZIMUTH} elevation={LIGHT_ELEVATION} />;
  const params = filterParams(material);
  return <filter id={id} x={-pad} y={-pad} width={width + 2 * pad} height={height + 2 * pad}
    filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
    <feImage href={embeddedHeightmap(type,width,height,profile,outline)} x={-pad} y={-pad} width={width + 2 * pad} height={height + 2 * pad} preserveAspectRatio="none" result="map" />
    <feGaussianBlur in="map" stdDeviation={0.75 * pitch} result="smooth" />
    <feColorMatrix in="smooth" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="height" />
    {/* Chromium transforms surfaceScale with the SVG; multiplying by zoom/DPR exaggerates the drift. */}
    {/* Keep the lighting intermediate below 1 to avoid clipping highlights before tinting. */}
    <feDiffuseLighting in="height" surfaceScale={relief*filterScale}
      diffuseConstant={params.diffuseConstant / 2} lightingColor="white" result="diffuse">{light}</feDiffuseLighting>
    <feComposite in="diffuse" in2="diffuse" operator="arithmetic" k2={1} k4={params.ambientConstant / 2} result="lit" />
    <feFlood floodColor={surfaceMaterial(material).color} result="base" />
    <feComposite in="lit" in2="base" operator="arithmetic" k1={2} result="colored" />
    <feSpecularLighting in="height" surfaceScale={relief*filterScale}
      specularConstant={params.specularConstant} specularExponent={params.specularExponent} lightingColor={params.specularColor} result="specular">{light}</feSpecularLighting>
    <feComposite in="colored" in2="specular" operator="arithmetic" k2={1} k3={1} result="shaded" />
    <feGaussianBlur in="shaded" stdDeviation={(profile.points.some((point) => point.sharp && point.u > 0 && point.u < 1) ? 0.5 : 1.5) * pitch} />
  </filter>;
}
