import {it,expect} from 'vitest';
import {bindPageLifecycle} from '../../../src/ui/lifecycle';
it('suspends a cached page and restores exactly one live loop without disposing input',()=>{
 const target=new EventTarget(),events:string[]=[];
 const emit=(type:string,persisted:boolean)=>{const e=new Event(type);Object.defineProperty(e,'persisted',{value:persisted});target.dispatchEvent(e);};
 const dispose=bindPageLifecycle(target,Object.fromEntries(['pause','clear','suspend','resume','dispose'].map(key=>[key,()=>events.push(key)])) as any);
 emit('pagehide',true);emit('pageshow',true);emit('pageshow',true);
 expect(events).toEqual(['suspend','pause','clear','resume']);
 emit('pagehide',false);expect(events.slice(-2)).toEqual(['suspend','dispose']);dispose();
});
