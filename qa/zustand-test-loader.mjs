// Minimal state-container substitute used only by dependency-free store checks.
const stub=`export function create(init){let state;const get=()=>state;const set=value=>{const update=typeof value==='function'?value(state):value;state={...state,...update};};const useStore=selector=>selector(state);useStore.getState=get;useStore.setState=set;state=init(set,get);return useStore;}`;
export async function resolve(specifier,context,nextResolve){
 if(specifier==='zustand')return {url:`data:text/javascript,${encodeURIComponent(stub)}`,shortCircuit:true};
 return nextResolve(specifier,context);
}
