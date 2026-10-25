import {it,expect,vi} from 'vitest';
import {TransferManager,type Codecs} from '../../../src/app/transfer';
import {DEFAULT_SETTINGS} from '../../../src/app/settings';
import {encodeJSON,decodeJSON} from '../../../src/transfer/json';
import {JSON_LIMIT,type Snapshot} from '../../../src/transfer/types';
import type {Files,SelectedFile} from '../../../src/platform/files';
const initial=():Snapshot=>({formatVersion:1,settings:{...DEFAULT_SETTINGS},results:[]}),file=(bytes:Uint8Array):SelectedFile=>({size:bytes.length,header:async()=>bytes.slice(0,16),read:async()=>bytes});
function setup(selected:SelectedFile[]=[],codecs?:Codecs){let state=initial(),paused=false,busy:string|null=null,commits=0;const downloads:Uint8Array[]=[],messages:string[]=[];const files:Files={choose:async()=>{expect(paused).toBe(true);return selected;},download:bytes=>downloads.push(bytes)};const manager=new TransferManager({snapshot:()=>state,pause:()=>{paused=true;},commit:s=>{state=s;commits++;},busy:k=>{busy=k;}},files,codecs??{encode:async s=>encodeJSON(s),decode:async b=>decodeJSON(b)},m=>messages.push(m));return {manager,files,downloads,messages,get state(){return state;},get commits(){return commits;},get paused(){return paused;},get busy(){return busy;}};}
it('pauses before selection, replaces complete snapshot and remains paused after success/cancel',async()=>{
 const candidate={...initial(),settings:{...DEFAULT_SETTINGS,hold:false}},m=setup([file(encodeJSON(candidate))]);await m.manager.restore();expect(m.state).toEqual(candidate);expect(m.commits).toBe(1);expect(m.paused).toBe(true);expect(m.busy).toBe(null);const cancel=setup();await cancel.manager.restore();expect(cancel.commits).toBe(0);expect(cancel.paused).toBe(true);expect(cancel.messages.join(' ')).toMatch(/cancel/i);
});
it('captures Save once while play can change settings/results and permits one operation at a time',async()=>{
 let finish!:(bytes:Uint8Array)=>void,captured!:Snapshot;const m=setup([],{encode:async s=>{captured=s;return new Promise(r=>{finish=r;});},decode:async b=>decodeJSON(b)});const run=m.manager.save();await vi.waitFor(()=>expect(captured).toBeDefined());m.state.settings.ghost='show';m.state.results.push({id:'00000000-0000-4000-8000-000000000001',score:1,timestamp:'2026-10-25T00:00:00.000Z'});await m.manager.save();expect(captured).toEqual(initial());expect(m.paused).toBe(false);finish(encodeJSON(captured));await run;expect(m.downloads).toHaveLength(1);expect(decodeJSON(m.downloads[0])).toEqual(initial());
});
it('cancels after selection and ignores a late staged reply without committing',async()=>{
 let finish!:(bytes:Uint8Array)=>void,reading=false;const source=file(encodeJSON(initial()));source.read=()=>{reading=true;return new Promise(r=>{finish=r;});};const m=setup([source]),run=m.manager.restore();await vi.waitFor(()=>expect(reading).toBe(true));m.manager.cancel();expect(m.busy).toBe(null);finish(encodeJSON(initial()));await run;expect(m.commits).toBe(0);expect(m.paused).toBe(true);
});
it('rejects multiple/empty/oversize/corrupt files without any commit',async()=>{
 for(const selected of [[file(new Uint8Array())],[file(encodeJSON(initial())),file(encodeJSON(initial()))],[{...file(new Uint8Array()),size:JSON_LIMIT+1}],[file(new TextEncoder().encode('invalid'))]]){const m=setup(selected);await m.manager.restore();expect(m.commits).toBe(0);expect(m.state).toEqual(initial());expect(m.messages.join(' ')).toMatch(/empty|one|size|JSON/i);expect(m.paused).toBe(true);expect(m.busy).toBe(null);}
});
it('a canceled decode reply cannot commit or clear a newer operation',async()=>{
 const finishes:((s:Snapshot)=>void)[]=[],m=setup([file(encodeJSON(initial()))],{encode:async s=>encodeJSON(s),decode:async()=>new Promise(r=>finishes.push(r))});const old=m.manager.restore();await vi.waitFor(()=>expect(finishes).toHaveLength(1));m.manager.cancel();const current=m.manager.restore();await vi.waitFor(()=>expect(finishes).toHaveLength(2));finishes[0](initial());await old;expect(m.commits).toBe(0);expect(m.busy).toBe('restore');finishes[1]({...initial(),settings:{...DEFAULT_SETTINGS,hold:false}});await current;expect(m.commits).toBe(1);expect(m.state.settings.hold).toBe(false);expect(m.busy).toBe(null);
});
