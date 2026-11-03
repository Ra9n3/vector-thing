import { materialId } from '../materials/resolve';
import type { Element } from '../store';
import type { StylePack } from './types';

export function remapMaterial(id: string, oldPack: StylePack, newPack: StylePack): string {
  const slot = oldPack.palette.findIndex((entry) => materialId(entry) === id);
  return slot < 0 || !newPack.palette[slot] ? id : materialId(newPack.palette[slot]);
}
export function applyStyle(elements: Element[], oldPack: StylePack, newPack: StylePack): Element[] {
  return elements.map((el) => {
    const material = el.materialSlot === null ? el.props.material : typeof el.materialSlot === 'number'
      ? materialId(newPack.palette[el.materialSlot] ?? newPack.palette[0])
      : remapMaterial(el.props.material, oldPack, newPack);
    return material === el.props.material ? el : { ...el, props: { ...el.props, material } };
  });
}
