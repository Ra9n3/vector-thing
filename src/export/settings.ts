export interface ExportSettings {format:'svg'|'flat'|'png'|'css';scope:'selection'|'all';states:'current'|'all';scale:1|2|3;background:boolean;code:'preview'|'html'|'css'}
export const DEFAULT_EXPORT_SETTINGS:ExportSettings={format:'svg',scope:'all',states:'current',scale:1,background:false,code:'preview'};
export const EXPORT_SETTINGS_KEY='vector-thing.export-settings.v1';
export function loadExportSettings():ExportSettings {
  try {const value=JSON.parse(localStorage.getItem(EXPORT_SETTINGS_KEY)??'{}');return {format:['svg','flat','png','css'].includes(value.format)?value.format:'svg',scope:value.scope==='selection'?'selection':'all',states:value.states==='all'?'all':'current',scale:[1,2,3].includes(value.scale)?value.scale:1,background:value.background===true,code:['preview','html','css'].includes(value.code)?value.code:'preview'};}catch{return {...DEFAULT_EXPORT_SETTINGS};}
}
export function saveExportSettings(settings:ExportSettings) {try{localStorage.setItem(EXPORT_SETTINGS_KEY,JSON.stringify(settings));}catch{/* storage is optional */}}
