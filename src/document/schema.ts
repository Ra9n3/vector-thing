import type {Element,Group} from '../selection/types';
import type {UserProfilePreset} from '../profiles/userPresets';
import type {Direction,Look} from '../viewTypes';
import type {RepeatMetadata} from '../repeat/repeat';
export const DOCUMENT_SCHEMA_VERSION=3;
export interface RepeatComponent extends Group {repeat:RepeatMetadata}
export interface DocumentData {
 schemaVersion:number;elements:Element[];groups:Group[];styleId:string;look:Look;direction:Direction;selection:string[];userProfiles:UserProfilePreset[];
}
export type LegacyDocument=Omit<DocumentData,'schemaVersion'|'userProfiles'> & {schemaVersion?:number;userProfiles?:UserProfilePreset[]};
export function migrateDocument(document:LegacyDocument):DocumentData {
 const version=document.schemaVersion??1;if(!Number.isInteger(version)||version<1||version>DOCUMENT_SCHEMA_VERSION)throw new Error('Unsupported document schema');
 return {...document,schemaVersion:DOCUMENT_SCHEMA_VERSION,userProfiles:document.userProfiles??[]};
}
export function serializeDocument(document:LegacyDocument):string {return JSON.stringify(migrateDocument(document));}
