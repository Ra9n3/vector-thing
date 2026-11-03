import {useStore} from '../store';
import {resolveStyle} from '../styles/catalog';
import {persistProfilePresets} from '../profiles/userPresets';
import {migrateDocument,serializeDocument} from './schema';
import type {LegacyDocument} from './schema';
export function saveDocument():string {
 const {elements,groups,styleId,look,direction,selection,userProfiles}=useStore.getState();
 return serializeDocument({elements,groups,styleId,look,direction,selection,userProfiles});
}
export function loadDocument(source:string):void {
 const doc=migrateDocument(JSON.parse(source) as LegacyDocument);
 useStore.getState().checkpoint();persistProfilePresets(doc.userProfiles);
 useStore.setState({...doc,canvasBackground:resolveStyle(doc.styleId).canvasBackground,activeId:null,hoveredId:null,enteredGroupId:null});
}
