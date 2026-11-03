import {create} from 'zustand';
interface OutlineEditorState {
 id:string|null; node:number|null; edge:number|null; grid:boolean; mirrorX:boolean; mirrorY:boolean; pen:boolean;
 setId:(id:string|null)=>void; setNode:(node:number|null)=>void; setEdge:(edge:number|null)=>void;
 setPen:(value:boolean)=>void; setGrid:(value:boolean)=>void; setMirrorX:(value:boolean)=>void; setMirrorY:(value:boolean)=>void;
}
export const useOutlineEditor=create<OutlineEditorState>(set=>({id:null,node:null,edge:null,grid:false,mirrorX:false,mirrorY:false,pen:false,
 setId:id=>set({id,node:null,edge:null,pen:false}),setNode:node=>set({node,edge:null}),setEdge:edge=>set({edge,node:null}),
 setPen:pen=>set({pen}),setGrid:grid=>set({grid}),setMirrorX:mirrorX=>set({mirrorX}),setMirrorY:mirrorY=>set({mirrorY}),
}));
