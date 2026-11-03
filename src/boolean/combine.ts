import {booleanOp} from './polygon';
import type {BooleanOperation,Polygon} from './polygon';
export interface BooleanOperand {id:string;type:string;polygons:Polygon[]}
export type BooleanPart<T extends BooleanOperand>=Omit<T,'type'|'polygons'> & {type:'path';polygons:Polygon[]};
/** Operands are in ascending z-order. A null result consumes nothing. */
export function combineOperands<T extends BooleanOperand>(operands:T[],operation:BooleanOperation,id:string):{part:BooleanPart<T>;consumed:string[]}|null {
 if(operands.length<2)return null;let polygons=operands[0].polygons;
 for(const operand of operands.slice(1)){polygons=booleanOp(polygons,operand.polygons,operation);if(!polygons.length&&operation!=='union')return null;}
 if(!polygons.length)return null;
 const part={...operands[0],id,type:'path' as const,polygons} as BooleanPart<T>;
 return {part,consumed:operands.map(x=>x.id)};
}
