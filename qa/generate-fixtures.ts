import { writeFileSync } from 'node:fs';
import { BUILTIN_TEMPLATES } from '../src/library/catalog';
import { instantiate } from '../src/library/instantiate';
import { defaultProfile, PRESETS } from '../src/profiles/presets';
import { resolveStyle } from '../src/styles/catalog';
import type { Element, Group, ElementState } from '../src/selection/types';
import type { ShapeType } from '../src/geometry/shapePath';
import type { Direction, Look } from '../src/viewTypes';
type Doc={elements:Element[];groups:Group[];styleId:string;look:Look;direction:Direction;selection:string[]};
const style=resolveStyle('studio-hardware');
const doc=(styleId='studio-hardware'):Doc=>({elements:[],groups:[],styleId,look:'slight',direction:'s',selection:[]});
const add=(d:Doc,id:string,x:number,y:number,scale=1,state:ElementState='default')=>{
 const t=BUILTIN_TEMPLATES.find(v=>v.id===id);if(!t)throw Error(id);
 const next=instantiate(t,{x,y},scale,resolveStyle(d.styleId),d.elements,d.groups);
 next.elements.slice(d.elements.length).forEach(e=>e.state=state);d.elements=next.elements;d.groups=next.groups;
 return next.elements.slice(-t.parts.length);
};
const write=(name:string,d:Doc)=>writeFileSync(`qa/fixtures/${name}.json`,JSON.stringify(d,null,2)+'\n');
const ssl=doc();
for(const [i,material] of ['speckle-grey','plastic-red','plastic-green'].entries()) {
 const before=ssl.elements.length;add(ssl,'knob',-260+i*110,-120);const cap=ssl.elements.slice(before).find(e=>e.partKey==='cap')!;cap.props.material=material;cap.materialSlot=i;
}
add(ssl,'fader',110,-100,1.05);add(ssl,'push-button',-220,60);add(ssl,'square-button',-110,60);add(ssl,'led',-10,60);write('ssl-strip',ssl);
const grid=doc();
const shapes:ShapeType[]=['rect','rounded','circle','pill','hexagon'];
for(const [row,type] of shapes.entries())for(const [col,p] of PRESETS.entries()) {
 const width=type==='circle'?64:type==='hexagon'?72:80,height=type==='circle'?64:type==='hexagon'?62:55;
 grid.elements.push({id:`shape-${row}-${col}`,type,state:'default',pressable:true,x:(col-3)*105-width/2,y:(row-2)*105-height/2,width,height,props:{profile:defaultProfile(p.id),material:style.palette[0] as string}});
}write('shape-grid',grid);
const toggles=doc();
for(const [i,state] of (['default','pressed','disabled'] as const).entries()){
 add(toggles,'toggle',-150+i*150,-70,1.5,state);add(toggles,'checkbox',-150+i*150,45,1.5,state);add(toggles,'radio',-150+i*150,140,1.5,state);
}write('toggles',toggles);
const neumo=doc('neumorphic');add(neumo,'card',0,0,1.6);add(neumo,'push-button',-80,-45,1.2);add(neumo,'square-button',60,-45,1.2,'pressed');add(neumo,'display',0,45,1);write('neumorphic-panel',neumo);
const stress=doc();
for(let i=0;i<60;i++) {
 const type=shapes[i%5],size=40+i%4*5,width=type==='hexagon'?size*2/Math.sqrt(3):type==='rect'?size+12:size;
 const group=`g-${Math.floor(i/5)}`;if(i%5===0)stress.groups.push({id:group});
 stress.elements.push({id:`stress-${i}`,type,state:(['default','pressed','disabled'] as const)[i%3],pressable:true,groupId:group,x:(i%10-4.5)*78-width/2,y:(Math.floor(i/10)-2.5)*72-size/2,width,height:size,props:{profile:defaultProfile(PRESETS[i%7].id),material:style.palette[i%6] as string},materialSlot:i%6});
}write('stress',stress);
const glass=doc('glossy-mobile');
for(const [i,material] of ['brushed-steel','glass','led-orange'].entries()) {
 const type=(['rounded','circle','circle'] as const)[i],size=([150,140,36] as const)[i];
 glass.elements.push({id:`glass-${i}`,type,state:'default',pressable:true,x:-80+i*60,y:-55+i*25,width:size,height:size,props:{profile:defaultProfile(i===2?'dome':'pillow'),material},materialSlot:null});
}write('glass-glow',glass);

const medium=doc();
for(let i=0;i<20;i++) {
 const type=shapes[i%shapes.length],size=45+(i%4)*5,width=type==='hexagon'?size*2/Math.sqrt(3):type==='rect'?size+12:size;
 const group=i<10?`medium-group-${Math.floor(i/5)}`:undefined;
 if(group && i%5===0)medium.groups.push({id:group});
 medium.elements.push({id:`medium-${i}`,type,state:'default',pressable:i%4!==0,...(group?{groupId:group}:{}),x:(i%5-2)*110-width/2,y:(Math.floor(i/5)-1.5)*100-size/2,width,height:size,props:{profile:defaultProfile(PRESETS[i%7].id),material:style.palette[i%6] as string},materialSlot:i%6});
}write('medium',medium);
