/** Deterministic contract regressions for json. */
import {it,expect} from 'vitest';
import {DEFAULT_SETTINGS} from '../../../src/app/settings';
import {validateSnapshot} from '../../../src/transfer/validate';
import {decodeJSON,encodeJSON} from '../../../src/transfer/json';
import {JSON_LIMIT,type Snapshot} from '../../../src/transfer/types';
const item=(i:number)=>({id:'00000000-0000-4000-8000-'+i.toString(16).padStart(12,'0'),score:i,timestamp:'2026-10-25T12:34:56.789Z'});
const snapshot=():Snapshot=>({formatVersion:1,results:[],settings:{...DEFAULT_SETTINGS}}),encode=(v:unknown)=>new TextEncoder().encode(JSON.stringify(v));
it('round-trips empty and full snapshots, normalizes ranking and preserves stable canonical values',()=>{
 expect(decodeJSON(encodeJSON(snapshot()))).toEqual(snapshot());const full={...snapshot(),results:Array.from({length:10},(_,i)=>item(i))};const expected={...full,results:[...full.results].reverse()};expect(decodeJSON(encodeJSON(full))).toEqual(expected);expect(full.results[0].score).toBe(0);
 const varied={...snapshot(),settings:{ghost:'show',hardDrop:false,nextPreview:false,hardDropLock:'immediate',lockPolicy:'failedDown',hold:false}};expect(decodeJSON(encode(varied))).toEqual(varied);
});
const invalid: [string,()=>unknown][]=[
 ['root null',()=>null],['root array',()=>[]],['version',()=>({...snapshot(),formatVersion:2})],['extra root',()=>({...snapshot(),board:[]})],['missing results',()=>({formatVersion:1,settings:DEFAULT_SETTINGS})],['too many results',()=>({...snapshot(),results:Array.from({length:11},(_,i)=>item(i))})],['duplicate IDs',()=>({...snapshot(),results:[item(1),{...item(1),score:99}]})],
 ...[-1,1.5,Number.MAX_SAFE_INTEGER+1,Infinity].map(score=>['bad score '+score,()=>({...snapshot(),results:[{...item(1),score}]})] as [string,()=>unknown]),
 ...['not-uuid','00000000-0000-1000-8000-000000000001','AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA'].map(id=>['bad ID '+id,()=>({...snapshot(),results:[{...item(1),id}]})] as [string,()=>unknown]),
 ...['1900-02-29T00:00:00.000Z','2026-02-30T00:00:00.000Z','0000-01-01T00:00:00.000Z','2026-10-25T00:00:00Z','2026-10-25T00:00:00.000+00:00'].map(timestamp=>['bad timestamp '+timestamp,()=>({...snapshot(),results:[{...item(1),timestamp}]})] as [string,()=>unknown]),
 ['missing setting',()=>{const s:any=snapshot();delete s.settings.hold;return s;}],['extra setting',()=>({...snapshot(),settings:{...DEFAULT_SETTINGS,extra:true}})],['wrong boolean',()=>({...snapshot(),settings:{...DEFAULT_SETTINGS,hold:'on'}})],['wrong enum',()=>({...snapshot(),settings:{...DEFAULT_SETTINGS,ghost:'automatic'}})],['extra result',()=>({...snapshot(),results:[{...item(1),extra:true}]})],['bad final result',()=>({...snapshot(),results:[...Array.from({length:9},(_,i)=>item(i)),{...item(10),timestamp:'bad'}]})]
];
it.each(invalid)('rejects complete invalid content: %s',(_,value)=>{expect(()=>validateSnapshot(value())).toThrow();expect(()=>decodeJSON(encode(value()))).toThrow();});
it('rejects duplicate member names at root, nested result and settings levels, including escaped names',()=>{
 const text=JSON.stringify({...snapshot(),results:[item(1)]});for(const raw of [text.replace('"formatVersion":1','"formatVersion":1,"formatVersion":1'),text.replace('"hold":true','"hold":false,"hold":true'),text.replace('"score":1','"score":1,"sc\\u006fre":1')])expect(()=>decodeJSON(new TextEncoder().encode(raw))).toThrow(/duplicate/i);
});
it('enforces bytes, UTF-8 and optional BOM before loading',()=>{
 const plain=encode(snapshot()),bom=new Uint8Array([239,187,191,...plain]);expect(decodeJSON(bom)).toEqual(snapshot());const maximum=new Uint8Array(JSON_LIMIT).fill(32);maximum.set(plain);expect(decodeJSON(maximum)).toEqual(snapshot());expect(()=>decodeJSON(new Uint8Array(JSON_LIMIT+1).fill(32))).toThrow(/size|large|MiB/);expect(()=>decodeJSON(new Uint8Array())).toThrow();expect(()=>decodeJSON(new Uint8Array([123,34,120,34,58,34,255,34,125]))).toThrow(/UTF-8/);for(const raw of ['{} trailing','{"x":1,}','/*comment*/{}','NaN'])expect(()=>decodeJSON(new TextEncoder().encode(raw))).toThrow();
});
it('requires every root/setting member and accepts safe numeric/calendar extremes',()=>{
 for(const key of ['formatVersion','results','settings']){const value:any=snapshot();delete value[key];expect(()=>validateSnapshot(value)).toThrow();}
 for(const key of Object.keys(DEFAULT_SETTINGS)){const value:any=snapshot();delete value.settings[key];expect(()=>validateSnapshot(value)).toThrow();value.settings[key]=null;expect(()=>validateSnapshot(value)).toThrow();}
 const extreme={...snapshot(),results:[{...item(1),score:Number.MAX_SAFE_INTEGER,timestamp:'0001-01-01T00:00:00.000Z'},{...item(2),timestamp:'9999-12-31T23:59:59.999Z'}],settings:{...DEFAULT_SETTINGS,ghost:'hide' as const}};expect(decodeJSON(encode(extreme))).toEqual(extreme);
});
it('rejects fractional numeric tokens that JavaScript would round/underflow and preserves exact integral forms',()=>{
 const text=JSON.stringify({...snapshot(),results:[item(1)]});for(const token of ['9007199254740991.1','1.00000000000000001','1e-999','9007199254740992','-0.00001'])expect(()=>decodeJSON(new TextEncoder().encode(text.replace('"score":1','"score":'+token)))).toThrow();
 for(const [token,score] of [['1.0',1],['10e-1',1],['0.1e1',1],['90071992547409910e-1',Number.MAX_SAFE_INTEGER],['0e-999999',0]] as const)expect(decodeJSON(new TextEncoder().encode(text.replace('"score":1','"score":'+token))).results[0].score).toBe(score);
});
