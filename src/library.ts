import { useStore } from './store';
export const LIBRARY_DRAG_TYPE = 'application/x-library-item';
export function placeLibraryItem(id: string, cx: number, cy: number) {
  useStore.getState().placeTemplate(id,{x:cx,y:cy});
}
