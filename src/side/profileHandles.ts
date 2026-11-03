import type {HandleDef, PresetDef} from '../profiles/presets';

const clamp=(value:number)=>Math.max(0,Math.min(1,value));
const heightHandle:HandleDef={
  paramKey:'height',label:'Height',axis:'y',
  position:params=>({u:1,h:Number.isFinite(params.height)?clamp(params.height):0.5}),
  fromDrag:({h})=>clamp(h),
};

/** All built-in profiles support height, including those with no preset-specific controls. */
export function profileHandles(preset:PresetDef):HandleDef[] {
  return preset.handles.length?preset.handles:[heightHandle];
}
