import { describe,it,expect } from 'vitest';
import { stackOffset,displayedElement,stackedShadowClip } from './stack';
import { tiltGeometry,wallPx } from './tilt';
import { resolveProfile } from '../profiles/sample';
import { instantiate } from '../library/instantiate';
import { BUILTIN_TEMPLATES } from '../library/catalog';
import { resolveStyle } from '../styles/catalog';
const t=BUILTIN_TEMPLATES.find(t=>t.id==='knob')!;
const els=instantiate(t,{x:100,y:100},1,resolveStyle('studio-hardware'),[],[]).elements;
const offset=(i:number,press=0)=>tiltGeometry('strong','se',wallPx(els[i].props.profile,els[i].width,els[i].height)*(1-.8*press),resolveProfile(els[i].props.profile).recessed).capOffset;
describe('stack geometry',()=>{
  it('sums cap offsets through a chain and applies press',()=>{
    const a=offset(0), b=offset(1); const got=stackOffset(els[2],els,'strong','se');
    expect(got.x).toBeCloseTo(a.x+b.x);expect(got.y).toBeCloseTo(a.y+b.y);
    const pressed=stackOffset(els[2],els,'strong','se',.5);expect(pressed.x).toBeCloseTo(offset(0,.5).x+offset(1,.5).x);
    expect(stackOffset(els[2],els,'flat','se')).toEqual({x:0,y:0});
    expect(displayedElement(els[2],els,'strong','se').x).toBeCloseTo(els[2].x+got.x);
  });
  it('clips a child shadow to its translated base cap in local coordinates',()=>{
    const clip=stackedShadowClip(els[2],els,'strong','se')!;
    expect(clip.type).toBe(els[1].type);expect(clip.width).toBe(els[1].width);
    const parent=displayedElement(els[1],els,'strong','se'),child=displayedElement(els[2],els,'strong','se');
    expect(child.x+clip.x).toBeCloseTo(parent.x+offset(1).x);
    expect(child.y+clip.y).toBeCloseTo(parent.y+offset(1).y);
  });
  it('ignores missing bases and safely stops at cycles',()=>{
    expect(stackOffset({...els[0],sitsOn:'missing'},els,'strong','se')).toEqual({x:0,y:0});
    const cycle=[{...els[0],sitsOn:els[1].id},{...els[1],sitsOn:els[0].id}];
    const got=stackOffset(cycle[0],cycle,'strong','se');expect(Number.isFinite(got.x)).toBe(true);
  });
});
