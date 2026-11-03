import { describe, expect, it } from 'vitest';
import { MATERIALS, resolveMaterial } from './resolve';
import { STYLES } from '../styles/catalog';

describe('material data', () => {
  it('loads thirteen materials and resolves ids and inline variants', () => {
    expect(MATERIALS).toHaveLength(13);
    const inline = { id: 'test-blue', base: 'clay', color: '#abcdef' };
    expect(resolveMaterial('rubber').id).toBe('rubber');
    expect(resolveMaterial(inline)).toMatchObject({ id: 'test-blue', color: '#abcdef', specular: resolveMaterial('clay').specular });
    expect(resolveMaterial(inline, '#123456').color).toBe('#123456');
    expect(resolveMaterial('clay-rose').color).toBe('#d99e9d');
    expect(resolveMaterial('clay-rose', '#123456').color).toBe('#123456');
    expect(() => resolveMaterial('does-not-exist')).toThrow();
    expect(() => resolveMaterial({ ...inline, base: 'does-not-exist' })).toThrow();
  });
  it('resolves all six entries of each pack', () => {
    expect(STYLES).toHaveLength(4);
    for (const style of STYLES) {
      expect(style.palette).toHaveLength(6);
      for (const entry of style.palette) expect(resolveMaterial(entry).color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
