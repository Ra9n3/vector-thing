/** Coordinates and corner radius are normalized to the part's width/height and shorter side. */
export interface OutlineEdge { type:'straight'|'arc'; bulge:number }
export interface OutlineNode { x:number; y:number; radius:number; smooth:boolean; edge:OutlineEdge }
export type OutlinePreset='polygon'|'star'|'triangle'|'arrow'|'cross';
export interface OutlineData { nodes:OutlineNode[]; preset?:OutlinePreset; sides?:number; points?:number; innerRatio?:number }
