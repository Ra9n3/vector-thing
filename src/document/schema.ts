import type {Element,Group} from '../selection/types';
import type {Direction,Look} from '../viewTypes';
export const DOCUMENT_SCHEMA_VERSION=2;
export interface DocumentData {schemaVersion:number;elements:Element[];groups:Group[];styleId:string;look:Look;direction:Direction;selection:string[]}
export type LegacyDocument=Omit<DocumentData,'schemaVersion'> & {schemaVersion?:number};
/** Version 1 contains no outline nodes. All legacy fields remain unchanged. */
export function migrateDocument(document:LegacyDocument):DocumentData {
 const version=document.schemaVersion??1;
 if(!Number.isInteger(version)||version<1||version>DOCUMENT_SCHEMA_VERSION)throw new Error('Unsupported document schema');
 return {...document,schemaVersion:DOCUMENT_SCHEMA_VERSION};
}
export function serializeDocument(document:LegacyDocument):string{return JSON.stringify(migrateDocument(document));}
