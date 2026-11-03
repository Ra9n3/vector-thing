import { describe, expect, it } from 'vitest';
import { PRESETS, defaultProfile } from '../profiles/presets';
import { resolveProfile } from '../profiles/sample';
import { effectiveHeight, heightPx } from '../render/lighting';
import { shadingSpec } from '../render/shadingKey';
import type { Element } from '../store';
import { useStore } from '../store';
import { snapHandleValue } from './handleMath';
import { sectionPath, sectionSamples, sectionSurface } from './sectionPath';

describe('profile handles', () => {
  for (const preset of PRESETS) {
    for (const handle of preset.handles) {
      it(`${preset.id} ${handle.paramKey} round-trips and clamps`, () => {
        for (const value of [0, 0.13, 0.25, 0.37, 0.5, 0.75, 0.91, 1]) {
          const settings = defaultProfile(preset.id);
          const params = { ...settings.params, height: settings.height, [handle.paramKey]: value };
          const profile = preset.build(params);
          expect(handle.fromDrag(handle.position(params, profile))).toBeCloseTo(value, 2);
        }
        for (const pos of [{ u: -100, h: -100 }, { u: 100, h: 100 }]) {
          const n = handle.fromDrag(pos);
          expect(n).toBeGreaterThanOrEqual(0);
          expect(n).toBeLessThanOrEqual(1);
        }
      });
    }
  }
  it('snaps count to 2..6 even with Alt, and other handles to 0.05 unless Alt is held', () => {
    for (let i = -10; i < 110; i++) {
      const count = 2 + 4 * snapHandleValue(i / 100, true, true);
      expect(Number.isInteger(count)).toBe(true);
      expect(count).toBeGreaterThanOrEqual(2);
      expect(count).toBeLessThanOrEqual(6);
    }
    expect(snapHandleValue(0.37, false, false)).toBe(0.35);
    expect(snapHandleValue(0.37, false, true)).toBe(0.37);
  });
});

describe('section and relief', () => {
  it('mirrors sampled coordinates and draws inset below the baseline', () => {
    for (const id of ['dome', 'inset'] as const) {
      const profile = resolveProfile(defaultProfile(id));
      const points = sectionSurface(sectionSamples(profile, 0.5), 400)
        .match(/[ML](-?[\d.]+) (-?[\d.]+)/g)!.map((token) => token.slice(1).split(' ').map(Number));
      expect(points).toHaveLength(255);
      for (let i = 0; i < points.length; i++) {
        expect(points[i][0] + points[points.length - 1 - i][0]).toBeCloseTo(400, 3);
        expect(points[i][1]).toBeCloseTo(points[points.length - 1 - i][1], 3);
        if (id === 'inset') expect(points[i][1]).toBeGreaterThanOrEqual(0);
      }
      expect(sectionPath(profile, 400, 0.5)).toMatch(/L400 0 L0 0 Z$/);
    }
  });
  it('scales the effective height', () => {
    for (const height of [0, 0.5, 1]) expect(effectiveHeight(100, 80, height)).toBeCloseTo(heightPx(100, 80) * (0.5 + height));
    expect(effectiveHeight(100, 80)).toBe(heightPx(100, 80));
  });
  it('keys shading by height but not position', () => {
    const el: Element = { id: 'a', type: 'rect', state:'default', pressable:true, x: 0, y: 0, width: 100, height: 80,
      props: { material: 'speckle-grey', profile: defaultProfile('raised') } };
    expect(shadingSpec({ ...el, x: 40, y: 10 }).key).toBe(shadingSpec(el).key);
    expect(shadingSpec({ ...el, props: { ...el.props, profile: { ...el.props.profile, height: 1 } } }).key).not.toBe(shadingSpec(el).key);
  });
});

describe('profile edit history', () => {
  it('commits a whole live drag as one undo entry and redo restores it', () => {
    const st = useStore.getState();
    useStore.setState({ elements: [], selection: [] });
    st.addElement('rect', 100, 40, 0, 0);
    st.setSideProfile('dip');
    const id = useStore.getState().selection[0];
    const original = useStore.getState().elements[0].props.profile.params.depth;
    st.setProfileParam([id], 'depth', 0.7, false);
    st.setProfileParam([id], 'depth', 0.85, false);
    st.setProfileParam([id], 'depth', 0.9, true);
    expect(useStore.getState().elements[0].props.profile.params.depth).toBe(0.9);
    st.undo();
    expect(useStore.getState().elements[0].props.profile.params.depth).toBe(original);
    st.redo();
    expect(useStore.getState().elements[0].props.profile.params.depth).toBe(0.9);
  });
  it('restores each selected element’s original value in one undo', () => {
    const st = useStore.getState();
    useStore.setState({ elements: [], selection: [] });
    st.addElement('rect', 100, 40, 0, 0);
    st.setSideProfile('dip');
    const a = useStore.getState().selection[0];
    st.duplicateSelection();
    const b = useStore.getState().selection[0];
    st.setProfileParam([b], 'depth', 0.3, true);
    st.setSelection([a, b]);
    st.setProfileParam([a, b], 'depth', 0.8, false);
    st.setProfileParam([a, b], 'depth', 0.9, true);
    expect(useStore.getState().elements.map((e) => e.props.profile.params.depth)).toEqual([0.9, 0.9]);
    st.undo();
    expect(useStore.getState().elements.map((e) => e.props.profile.params.depth)).toEqual([0.65, 0.3]);
  });

});
