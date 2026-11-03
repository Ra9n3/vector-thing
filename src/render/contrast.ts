import { hexToRgb } from './shade';

export function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const linear = (v: number) => v / 255 <= 0.04045 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b) > 0.32;
}
export function selectionColor(background: string): string {
  return isLightColor(background) ? '#4930bf' : '#a79cff';
}
