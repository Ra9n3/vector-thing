import { describe, expect, it } from 'vitest';
import { defaultProfile } from '../profiles/presets';
import type { Element } from '../store';
import { useStore } from '../store';
import { placeLibraryItem } from '../library';
import { applyStyle } from './applyStyle';
import { resolveStyle } from './catalog';

const element = (id: string, material: string): Element => ({ id, type: 'rect', state:'default', pressable:true, x: 0, y: 0, width: 80, height: 40,
  props: { material, profile: defaultProfile('dip'), customColor: '#abcdef' } });

describe('style application', () => {
  it('loads cast and highlight shadow settings from the packs', () => {
    expect(resolveStyle('studio-hardware').shadow).toEqual({ color: '#000000', strength: 0.6 });
    expect(resolveStyle('soft-clay').shadow.strength).toBe(0.35);
    expect(resolveStyle('glossy-mobile').shadow.strength).toBe(0.5);
    expect(resolveStyle('neumorphic').highlightShadow).toEqual({ color: '#ffffff', strength: 0.8 });
  });
  it('remaps by slot, leaves unknowns and profiles alone', () => {
    const oldPack = resolveStyle('studio-hardware'), next = resolveStyle('soft-clay');
    const elements = [element('a', 'speckle-grey'), element('b', 'plastic-red'), element('c', 'metal-gold'), element('d', 'unknown')];
    const result = applyStyle(elements, oldPack, next);
    expect(result.map((e) => e.props.material)).toEqual(['clay-sand', 'clay-rose', 'metal-gold', 'unknown']);
    result.forEach((el, i) => {
      expect(el.props.profile).toBe(elements[i].props.profile);
      expect(el.props.customColor).toBe('#abcdef');
    });
    expect(elements[0].props.material).toBe('speckle-grey');
  });
  it('undoes and redoes a style switch as a single document action', () => {
    const st = useStore.getState();
    const studio = resolveStyle('studio-hardware');
    useStore.setState({ elements: [element('a', 'plastic-red')], selection: ['a'], styleId: studio.id,
      canvasBackground: studio.canvasBackground, look: 'flat', direction: 'nw',
      properties: { shape: 'rect', profile: defaultProfile('dip'), material: 'plastic-red', size: 80 } });
    st.setStyle('soft-clay');
    expect(useStore.getState()).toMatchObject({ styleId: 'soft-clay', canvasBackground: '#eee5dc', look: 'slight', direction: 'se' });
    expect(useStore.getState().elements[0].props.material).toBe('clay-rose');
    st.undo();
    expect(useStore.getState()).toMatchObject({ styleId: 'studio-hardware', canvasBackground: studio.canvasBackground, look: 'flat', direction: 'nw' });
    expect(useStore.getState().elements[0].props.material).toBe('plastic-red');
    st.redo();
    expect(useStore.getState().elements[0].props.material).toBe('clay-rose');
  });
  it('uses style profile defaults only when placing a library item', () => {
    const st = useStore.getState();
    const studio = resolveStyle('studio-hardware');
    useStore.setState({ elements: [], selection: [], styleId: studio.id, canvasBackground: studio.canvasBackground,
      properties: { shape: 'rounded', profile: defaultProfile('flat'), material: 'speckle-grey', size: 96 } });
    placeLibraryItem('knob', 0, 0);
    expect(useStore.getState().elements[1].props.profile.preset).toBe('dome');
    st.setStyle('soft-clay');
    expect(useStore.getState().elements[1].props.profile.preset).toBe('dome');
    placeLibraryItem('fader-cap', 150, 0);
    expect(useStore.getState().elements.at(-1)!.props.profile.preset).toBe('pillow');
  });
});
