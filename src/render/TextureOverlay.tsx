import { useEffect, useState } from 'react';
import type { Material } from '../materials/types';

// Stable per material, independent of element id, position, zoom, and DPR.
export function textureSeed(id: string): number {
  let hash = 2166136261;
  for (const c of id) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return (hash >>> 0) % 65535 + 1;
}
const matrix = '0.333 0.333 0.333 0 0  0.333 0.333 0.333 0 0  0.333 0.333 0.333 0 0  0 0 0 0 1';
const tiles = new Map<string, Promise<string>>();

/** Rasterize the SVG noise once at one sample per canvas unit. Otherwise browsers
 * recompute feTurbulence in device pixels and the grain changes with zoom/DPR. */
function textureTile(key: string, frequency: string, seed: number): Promise<string> {
  let tile = tiles.get(key);
  if (tile) return tile;
  tile = new Promise((resolve, reject) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><defs><filter id="noise" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="2" seed="${seed}" result="noise"/><feColorMatrix in="noise" type="matrix" values="${matrix}"/></filter></defs><rect width="256" height="256" filter="url(#noise)"/></svg>`;
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas unavailable');
        ctx.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) { reject(error); }
    };
    image.onerror = () => reject(new Error('Texture generation failed'));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  tiles.set(key, tile);
  tile.catch(() => tiles.delete(key));
  return tile;
}

export function TextureDefinition({ id, material }: { id: string; material: Material }) {
  const type = material.texture?.type;
  const frequency = type === 'brushed' ? '0.006 0.9' : '0.9 0.9';
  const seed = textureSeed(material.id);
  const key = `${type}:${seed}`;
  const [tile, setTile] = useState('');
  useEffect(() => {
    let active = true;
    setTile('');
    if (type) textureTile(key, frequency, seed).then((image) => { if (active) setTile(image); }).catch(() => {});
    return () => { active = false; };
  }, [key, frequency, seed, type]);
  if (!material.texture) return null;
  return <>
    <filter id={`${id}-noise`} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse"
      x={0} y={0} width={256} height={256} colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={2} seed={seed} result="noise" />
      <feColorMatrix in="noise" type="matrix" values={matrix} />
    </filter>
    <pattern id={id} patternUnits="userSpaceOnUse" width={256} height={256}>
      {tile ? <image href={tile} width={256} height={256} />
        : <rect width={256} height={256} filter={`url(#${id}-noise)`} />}
    </pattern>
  </>;
}

export function TextureOverlay({ path, material, textureId }: { path: string; material: Material; textureId?: string }) {
  if (!material.texture || !textureId) return null;
  return <path d={path} fill={`url(#${textureId})`} opacity={material.texture.amount} pointerEvents="none"
    style={{ mixBlendMode: 'soft-light' }} />;
}
