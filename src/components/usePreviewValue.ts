import { startTransition, useEffect, useState } from 'react';

export function usePreviewValue<T>(value:T):T {
  const [preview,setPreview]=useState(value);
  useEffect(()=>{
    let second=0;
    const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>startTransition(()=>setPreview(value)));});
    return ()=>{cancelAnimationFrame(first);cancelAnimationFrame(second);};
  },[value]);
  return preview;
}
