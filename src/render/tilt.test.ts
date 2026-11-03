import { describe, expect, it } from 'vitest';
import { defaultProfile } from '../profiles/presets';
import { heightPx } from './lighting';
import { DIR_VEC, shadowVector, tiltGeometry, wallPx } from './tilt';

describe('tilt and shadows', () => {
  it('uses the eight unit compass vectors', () => {
    for (const d of ['n','ne','e','se','s','sw','w','nw'] as const) expect(Math.hypot(DIR_VEC[d].x,DIR_VEC[d].y)).toBeCloseTo(1);
    expect(DIR_VEC.s).toEqual({x:0,y:1}); expect(DIR_VEC.ne.x).toBeCloseTo(0.707,3); expect(DIR_VEC.ne.y).toBeCloseTo(-0.707,3);
  });
  it('offsets the cap opposite the wall and reverses for recesses', () => {
    expect(tiltGeometry('slight','s',20,false).capOffset).toEqual({x:0,y:-7});
    expect(tiltGeometry('slight','s',20,true).capOffset).toEqual({x:0,y:7});
    expect(tiltGeometry('flat','s',20,false).capOffset).toEqual({x:0,y:0});
    expect(tiltGeometry('strong','s',0.9,false).wallVec).toEqual({x:0,y:0});
  });
  it('casts bottom right, scales with height, and halves in Flat', () => {
    const s=shadowVector(20,'slight'); expect(s.x).toBeCloseTo(s.y); expect(s.x).toBeGreaterThan(0);
    expect(shadowVector(40,'strong').x).toBeCloseTo(2*s.x); expect(shadowVector(20,'flat').x).toBeCloseTo(s.x/2);
  });
  it('uses edge height or preset minimum and multiplies wall', () => {
    const flat=defaultProfile('flat'), raised=defaultProfile('raised'), dome=defaultProfile('dome');
    expect(wallPx(dome,100,100)).toBe(0); expect(wallPx(flat,100,100)).toBeCloseTo(heightPx(100,100));
    expect(wallPx(raised,100,100)).toBeCloseTo(heightPx(100,100)*0.5);
    expect(wallPx({...raised,wall:2},100,100)).toBeCloseTo(wallPx(raised,100,100)*2);
    expect(wallPx({...raised,wall:undefined as unknown as number},100,100)).toBeCloseTo(wallPx(raised,100,100));
    expect(wallPx(defaultProfile('inset'),100,100)).toBeCloseTo(heightPx(100,100)*0.6);
  });
});
