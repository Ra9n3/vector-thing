import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from '../store';
import { defaultProfile } from './presets';

describe('profile selection', () => {
  beforeEach(() => {
    useStore.setState({ elements: [], selection: [], properties: {
      shape: 'rounded', profile: defaultProfile('raised'), material: 'speckle-grey', size: 96,
    } });
  });

  it('resets preset parameters on mixed selection while preserving each mode and axis, and undoes', () => {
    const st = useStore.getState();
    st.addElement('rect', 100, 40, 0, 0);
    const first = useStore.getState().selection[0];
    st.setProfileMode('across');
    st.setProfileAxis('horizontal');
    st.addElement('circle', 40, 40, 150, 0);
    const second = useStore.getState().selection[0];
    st.setSideProfile('dip');
    st.setSelection([first, second]);
    st.setSideProfile('ribbed');
    const [a, b] = useStore.getState().elements;
    expect(a.props.profile).toEqual({ ...defaultProfile('ribbed'), mode: 'across', acrossAxis: 'horizontal' });
    expect(b.props.profile).toEqual(defaultProfile('ribbed'));
    st.undo();
    expect(useStore.getState().elements.map((e) => e.props.profile.preset)).toEqual(['raised', 'dip']);
  });

  it('sets and clamps walls on the selection, preserves them across presets, and undoes', () => {
    const st = useStore.getState();
    st.addElement('rect', 100, 40, 0, 0);
    st.setWall(1.6);
    expect(useStore.getState().elements[0].props.profile.wall).toBe(1.6);
    st.setSideProfile('dome');
    expect(useStore.getState().elements[0].props.profile.wall).toBe(1.6);
    st.undo();
    expect(useStore.getState().elements[0].props.profile.wall).toBe(1.6);
    st.undo();
    expect(useStore.getState().elements[0].props.profile.wall).toBe(1);
    st.setWall(10);
    expect(useStore.getState().elements[0].props.profile.wall).toBe(2);
  });

  it('creates a new element with defaults for the selected preset', () => {
    const st = useStore.getState();
    st.addElement('rect', 100, 40, 0, 0);
    st.setSideProfile('dome');
    st.setProfileMode('across');
    st.addElement('rect', 100, 40, 200, 0);
    expect(useStore.getState().elements[1].props.profile).toEqual(defaultProfile('dome'));
  });
});
