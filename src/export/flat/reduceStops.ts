export interface ColorStop {offset:number;color:string}
/** Greedy largest interpolation error; endpoints and sharpest color changes are kept. */
export function reduceStops(stops:ColorStop[],limit=16):ColorStop[] {
  if(stops.length<=limit)return stops;
  const rgb=(color:string)=>color.match(/[\d.]+/g)?.slice(0,3).map(Number)??[0,0,0];
  const colors=stops.map(s=>rgb(s.color)),kept=[0,stops.length-1];
  while(kept.length<limit){let best=-1,index=-1;
    for(let k=0;k<kept.length-1;k++){const a=kept[k],b=kept[k+1],span=stops[b].offset-stops[a].offset;
      for(let i=a+1;i<b;i++){const t=span?(stops[i].offset-stops[a].offset)/span:0;const err=colors[i].reduce((v,c,j)=>v+(c-(colors[a][j]+t*(colors[b][j]-colors[a][j])))**2,0);if(err>best){best=err;index=i;}}
    }
    if(index<0)break;kept.push(index);kept.sort((a,b)=>a-b);
  }
  return kept.map(i=>stops[i]);
}
