import { describe, expect, it } from 'vitest';
import { thumbGeometry } from './thumbGeometry';
import { resolveMaterial } from '../materials/resolve';
import { STYLES, resolveStyle } from '../styles/catalog';
import { hexToRgb } from './shade';
const material = resolveMaterial('plastic-white');
const pack = resolveStyle('studio-hardware');
const points = (d:string) => [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m => ({x:+m[1],y:+m[2]}));

describe('direction thumbnails', () => {
  it('puts the south wall below the lifted cap, and north reverses it', () => {
    const s = thumbGeometry('s','slight',material,pack), n = thumbGeometry('n','slight',material,pack);
    expect(s.capOffset.y).toBeLessThan(0);expect(n.capOffset.y).toBeCloseTo(-s.capOffset.y);
    expect(s.wall.length).toBeGreaterThan(0);expect(n.wall.length).toBeGreaterThan(0);
    const ySouth = s.wall.flatMap(f => points(f.d)).map(p=>p.y);
    const yNorth = n.wall.flatMap(f => points(f.d)).map(p=>p.y);
    expect(Math.max(...ySouth)).toBeCloseTo(20, 1);
    expect(Math.min(...yNorth)).toBeCloseTo(0, 1);
    expect((Math.min(...ySouth)+Math.max(...ySouth))/2).toBeGreaterThan(10);
    expect((Math.min(...yNorth)+Math.max(...yNorth))/2).toBeLessThan(10);
  });
  it('shows slight in flat mode and no wall at the center', () => {
    expect(thumbGeometry('se','flat',material,pack)).toEqual(thumbGeometry('se','slight',material,pack));
    expect(thumbGeometry('c','strong',material,pack).wall).toEqual([]);
    expect(thumbGeometry('c','strong',material,pack).capOffset).toEqual({x:0,y:0});
  });
  it('lights northwest walls brighter than southeast', () => {
    const brightness = (d:'nw'|'se') => thumbGeometry(d,'strong',material,pack).wall.map(f => {
      const n=f.fill.match(/\d+/g)!.map(Number);return n[0]+n[1]+n[2];
    }).reduce((a,b)=>a+b,0) / thumbGeometry(d,'strong',material,pack).wall.length;
    expect(brightness('nw')).toBeGreaterThan(brightness('se'));
    expect(hexToRgb(material.color).r).toBeGreaterThan(0);
  });
  it('marks the recommended default and avoids washed-out directions', () => {
    for (const style of STYLES) {
      expect(style.goodDirections).toContain(style.direction);
      for (const d of ['nw','n','w']) expect(style.goodDirections).not.toContain(d);
    }
  });
});
