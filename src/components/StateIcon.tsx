import type { ElementState } from '../selection/types';
export function StateIcon({state}:{state:ElementState}) {
  return <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{display:'block'}}>
    <rect x="3" y="3" width="10" height="10" rx="1" fill={state==='disabled'?'none':'currentColor'} fillOpacity={state==='pressed'?.18:.35} stroke="currentColor" strokeDasharray={state==='disabled'?'2 2':undefined}/>
    {state!=='disabled' && <path d={state==='pressed'?'M4 4h8M4 4v8':'M4 12h8M12 4v8'} fill="none" stroke="currentColor" opacity=".7"/>}
  </svg>;
}
