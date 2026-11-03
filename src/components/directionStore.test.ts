import { describe, expect, it, beforeEach } from 'vitest';
import { useStore } from '../store';
import { resolveStyle } from '../styles/catalog';

describe('direction picker history', () => {
  beforeEach(() => {
    const style=resolveStyle('studio-hardware');
    useStore.setState({elements:[],selection:[],look:'flat',direction:'s',styleId:style.id,canvasBackground:style.canvasBackground});
  });
  it('an arrow at Flat sets both fields in a single history entry', () => {
    const s=useStore.getState();s.setDirection('ne');
    expect(useStore.getState()).toMatchObject({look:'slight',direction:'ne'});
    s.undo();expect(useStore.getState()).toMatchObject({look:'flat',direction:'s'});
    s.redo();expect(useStore.getState()).toMatchObject({look:'slight',direction:'ne'});
  });
  it('center retains direction and the same arrow restores it', () => {
    const s=useStore.getState();s.setDirection('se');s.setLook('strong');s.setDirection('c');
    expect(useStore.getState()).toMatchObject({look:'flat',direction:'se'});
    s.setDirection('se');expect(useStore.getState()).toMatchObject({look:'slight',direction:'se'});
    s.undo();expect(useStore.getState()).toMatchObject({look:'flat',direction:'se'});
    s.undo();expect(useStore.getState()).toMatchObject({look:'strong',direction:'se'});
  });
  it('does not create history for the selected arrow or center', () => {
    const s=useStore.getState();s.setDirection('s');s.setDirection('s');s.undo();
    expect(useStore.getState()).toMatchObject({look:'flat',direction:'s'});
    s.redo();s.setDirection('c');s.setDirection('c');s.undo();
    expect(useStore.getState()).toMatchObject({look:'slight',direction:'s'});
  });
  it('style switch replaces manually chosen view in one undo step', () => {
    const s=useStore.getState();s.setDirection('nw');s.setLook('strong');s.setStyle('soft-clay');
    expect(useStore.getState()).toMatchObject({look:'slight',direction:'se'});
    s.undo();expect(useStore.getState()).toMatchObject({look:'strong',direction:'nw'});
  });
});
