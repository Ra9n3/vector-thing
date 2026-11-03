import data from './styles.json';
import type { StylePack } from './types';

export const STYLES = data as StylePack[];
export function resolveStyle(id: string): StylePack {
  const pack = STYLES.find((style) => style.id === id);
  if (!pack) throw new Error(`Unknown style: ${id}`);
  return pack;
}
