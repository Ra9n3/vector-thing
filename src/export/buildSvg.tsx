import { renderToStaticMarkup } from 'react-dom/server';
import { ExportScene } from './ExportScene';
import type { ExportVariant } from './scene';
export function contentHash(input:string):string {let h=2166136261;for(let i=0;i<input.length;i++)h=Math.imul(h^input.charCodeAt(i),16777619);return (h>>>0).toString(36).padStart(6,'0').slice(-6);}
export function finalizeSvg(xml:string):string {
  const hash=contentHash(xml);
  const filters = new Map<string,string>(), aliases = new Map<string,string>();
  xml = xml.replace(/<filter\b[^>]*>[\s\S]*?<\/filter>/g, filter => {
    const id = /\sid="([^"]+)"/.exec(filter)?.[1];
    if (!id) return filter;
    const key = filter.replace(/\sid="[^"]+"/, '').replace(/-?\d+\.\d{3,}/g,n=>String(Number(Number(n).toFixed(2))));
    const existing = filters.get(key);
    if (existing) { aliases.set(id, existing); return ''; }
    filters.set(key, id); return filter;
  });
  xml = xml.replace(/(url\(#|(?:href|xlink:href)="#)([^)"']+)/g, (match, prefix: string, id: string) =>
    aliases.has(id) ? `${prefix}${aliases.get(id)}` : match);
  const ids=[...xml.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const references = new Set([...xml.matchAll(/(?:url\(#|(?:href|xlink:href)="#)([^)"']+)/g)].map(m => m[1]));
  xml = xml.replace(/\sid="([^"]+)"/g, (attribute, id: string) => references.has(id) ? attribute : '');
  const known = new Set(ids.filter(id => references.has(id)));
  xml = xml.replace(/(id="|#)([^"'()]+)(?=["')])/g, (match, prefix: string, id: string) =>
    known.has(id) ? `${prefix}e${hash}-${id}` : match);

  return xml.replace(/\sdata-[\w-]+="[^"]*"/g,'').replace(/\sclass="[^"]*"/g,'').replace(/\sstyle="([^"]*)"/g,(_all,style:string)=>style.includes('mix-blend-mode:soft-light')?' style="mix-blend-mode:soft-light"':'').replace(/\spointer-events="[^"]*"/g,'')
    .replace(/-?\d+\.\d{3,}/g,n=>String(Number(Number(n).toFixed(2)))).replace(/>\s+</g,'><').trim();
}
export function buildSvg(variant:ExportVariant,filterScale=1):string {return finalizeSvg(renderToStaticMarkup(<ExportScene variant={variant} filterScale={filterScale}/>));}
