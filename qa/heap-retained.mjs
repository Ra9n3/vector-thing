import {readFileSync,writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

// Dominators use strong snapshot edges; retained totals grouped by constructor can overlap.
function analyze(path){
 const s=JSON.parse(gunzipSync(readFileSync(path))), {nodes,edges,strings}=s, meta=s.snapshot.meta;
 const nf=meta.node_fields, ef=meta.edge_fields, ns=nf.length, es=ef.length;
 const ni=Object.fromEntries(nf.map((x,i)=>[x,i])),ei=Object.fromEntries(ef.map((x,i)=>[x,i]));
 const weak=meta.edge_types[ei.type].indexOf('weak'), count=s.snapshot.node_count, edgeCount=s.snapshot.edge_count;
 const start=new Int32Array(count+1);for(let i=0;i<count;i++)start[i+1]=start[i]+nodes[i*ns+ni.edge_count];
 const num=new Int32Array(count), vertex=new Int32Array(count+1),parent=new Int32Array(count+1);
 const stack=new Int32Array(count),cursor=new Int32Array(count);let size=1,top=0;num[0]=1;vertex[1]=0;stack[0]=0;cursor[0]=start[0];
 while(top>=0){const node=stack[top], end=start[node+1];let e=cursor[top];while(e<end&&edges[e*es+ei.type]===weak)e++;if(e===end){top--;continue;}cursor[top]=e+1;const target=edges[e*es+ei.to_node]/ns;if(!num[target]){num[target]=++size;vertex[size]=target;parent[size]=num[node];stack[++top]=target;cursor[top]=start[target];}}
 const pred=new Int32Array(size+1),next=new Int32Array(edgeCount),from=new Int32Array(edgeCount);
 for(let i=1;i<=size;i++){const node=vertex[i];for(let e=start[node];e<start[node+1];e++){if(edges[e*es+ei.type]===weak)continue;const target=num[edges[e*es+ei.to_node]/ns];if(!target)continue;from[e]=i;next[e]=pred[target];pred[target]=e+1;}}
 const semi=new Int32Array(size+1),ancestor=new Int32Array(size+1),label=new Int32Array(size+1),dom=new Int32Array(size+1),bucket=new Int32Array(size+1),bucketNext=new Int32Array(size+1),pathStack=new Int32Array(size+1);
 for(let i=1;i<=size;i++)semi[i]=label[i]=i;
 function evaluate(v){if(!ancestor[v])return label[v];let x=v,k=0;while(ancestor[ancestor[x]]){pathStack[k++]=x;x=ancestor[x];}while(k){x=pathStack[--k];const a=ancestor[x];if(semi[label[a]]<semi[label[x]])label[x]=label[a];ancestor[x]=ancestor[a];}return label[v];}
 for(let w=size;w>1;w--){for(let p=pred[w];p;p=next[p-1]){const u=evaluate(from[p-1]);if(semi[u]<semi[w])semi[w]=semi[u];}bucketNext[w]=bucket[semi[w]];bucket[semi[w]]=w;ancestor[w]=parent[w];for(let v=bucket[parent[w]];v;v=bucketNext[v]){const u=evaluate(v);dom[v]=semi[u]<semi[v]?u:parent[w];}bucket[parent[w]]=0;}
 for(let w=2;w<=size;w++)if(dom[w]!==semi[w])dom[w]=dom[dom[w]];
 const retained=new Float64Array(size+1);for(let i=1;i<=size;i++)retained[i]=nodes[vertex[i]*ns+ni.self_size];for(let i=size;i>1;i--)retained[dom[i]]+=retained[i];
 const groups={};const types=meta.node_types[ni.type];
 for(let i=1;i<=size;i++){const at=vertex[i]*ns,type=types[nodes[at+ni.type]];if(type!=='object'&&type!=='native')continue;const name=strings[nodes[at+ni.name]],key=`${type}:${name}`;const g=groups[key]??={count:0,self:0,retained:0,maxRetained:0};g.count++;g.self+=nodes[at+ni.self_size];g.retained+=retained[i];g.maxRetained=Math.max(g.maxRetained,retained[i]);}
 return {reachable:size,rootRetained:retained[1],groups};
}
const a=analyze('qa/traces/round3-100.heapsnapshot.gz'),b=analyze('qa/traces/round3-300.heapsnapshot.gz');
const keys=new Set([...Object.keys(a.groups),...Object.keys(b.groups)]);const diff=[...keys].map(key=>{const x=a.groups[key]??{count:0,self:0,retained:0,maxRetained:0},y=b.groups[key]??{count:0,self:0,retained:0,maxRetained:0};return {key,count:y.count-x.count,self:y.self-x.self,retained:y.retained-x.retained,maxRetained100:x.maxRetained,maxRetained300:y.maxRetained};}).sort((x,y)=>y.retained-x.retained);
writeFileSync('qa/memory-retained-round3.json',JSON.stringify({rootRetained100:a.rootRetained,rootRetained300:b.rootRetained,reachable100:a.reachable,reachable300:b.reachable,diff:diff.slice(0,50)},null,2));console.log(JSON.stringify({rootRetained100:a.rootRetained,rootRetained300:b.rootRetained,reachable100:a.reachable,reachable300:b.reachable,diff:diff.slice(0,15)},null,2));
