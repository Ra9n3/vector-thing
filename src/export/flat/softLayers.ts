export function softLayers(sigma:number,strength:number,n=8):{outset:number;opacity:number}[] {
  n=Math.max(1,Math.floor(n));sigma=Math.max(0,sigma);strength=Math.max(0,Math.min(.999999,strength));
  const weights=Array.from({length:n},(_,i)=>{const t=n===1?0:i/(n-1);return 1-t*t*(3-2*t)});
  const total=weights.reduce((a,b)=>a+b,0)||1;
  return weights.map((weight,i)=>({outset:n===1?0:2*sigma*i/(n-1),opacity:1-Math.pow(1-strength,weight/total)}));
}
