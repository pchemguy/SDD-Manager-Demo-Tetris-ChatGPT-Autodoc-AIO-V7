import {it,expect} from 'vitest';
import {validTimestamp,isResult,rankResults,recordResult,type Result} from '../../../src/app/leaderboard';
const result=(n:number,score=0,timestamp='2026-10-25T00:00:00.000Z'):Result=>({id:'00000000-0000-4000-8000-'+n.toString(16).padStart(12,'0'),score,timestamp});
it('keeps ten best scores with timestamp then ASCII ID tie order without changing identity',()=>{
 const rows=Array.from({length:13},(_,i)=>result(i,i));const ranked=rankResults(rows);expect(ranked).toHaveLength(10);expect(ranked.map(r=>r.score)).toEqual([12,11,10,9,8,7,6,5,4,3]);expect(rows[0].score).toBe(0);
 const earlier=result(7,2,'2026-10-24T23:59:59.999Z'),a=result(1,2),b=result(2,2);expect(rankResults([b,a,earlier])).toEqual([earlier,a,b]);expect(recordResult([a],a)).toEqual([a]);expect(recordResult([],result(5))).toEqual([result(5)]);
});
it('accepts canonical UUID/score/UTC calendar values and rejects malformed result content',()=>{
 expect(isResult(result(1))).toBe(true);expect(isResult(result(1,Number.MAX_SAFE_INTEGER))).toBe(true);for(const score of [-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])expect(isResult({...result(1),score})).toBe(false);
 for(const id of ['not-an-id','00000000-0000-1000-8000-000000000001','00000000-0000-4000-7000-000000000001','AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA'])expect(isResult({...result(1),id})).toBe(false);expect(isResult({...result(1),extra:true})).toBe(false);expect(isResult({id:result(1).id,score:0})).toBe(false);
});
it('checks actual calendar round trips, UTC milliseconds and year bounds',()=>{
 for(const value of ['0001-01-01T00:00:00.000Z','9999-12-31T23:59:59.999Z','2000-02-29T12:00:00.000Z'])expect(validTimestamp(value)).toBe(true);
 for(const value of ['0000-01-01T00:00:00.000Z','1900-02-29T12:00:00.000Z','2026-02-30T00:00:00.000Z','2026-10-25T24:00:00.000Z','2026-10-25T00:00:60.000Z','2026-10-25T00:00:00Z','2026-10-25T00:00:00.000+00:00'])expect(validTimestamp(value)).toBe(false);
});
import {Controller} from '../../../src/app/controller';
it('consumes each completion once, includes zero score and retains results only within this controller session',()=>{
 let count=0;const c=new Controller(()=>1,()=>{},{id:()=>result(++count).id,utc:()=> '2026-10-25T12:00:00.000Z'});c.command('start');
 c.state={...c.state,active:{kind:'O',rotation:0,x:3,y:-1},lockAt:100};c.state.board[1][4]='J';c.tick(100);expect(c.state.status).toBe('gameover');expect(c.results).toEqual([{...result(1),timestamp:'2026-10-25T12:00:00.000Z'}]);expect(count).toBe(1);
 c.tick(200);c.command('left');c.command('pause');expect(count).toBe(1);c.command('start');c.command('down');c.command('start');expect(c.results).toHaveLength(1);expect(count).toBe(1);expect(new Controller(()=>1).results).toEqual([]);
});
it('retains canonical identities while ranking eleven-plus completed games',()=>{
 let count=0;const c=new Controller(()=>1,()=>{},{id:()=>result(++count).id,utc:()=> '2026-10-25T12:00:00.000Z'});
 for(let n=0;n<12;n++){c.command('start');c.state={...c.state,score:n,active:{kind:'O',rotation:0,x:3,y:-1},lockAt:100};c.state.board[1][4]='J';c.tick(100);}
 expect(c.results).toHaveLength(10);expect(c.results.map(r=>r.score)).toEqual([11,10,9,8,7,6,5,4,3,2]);expect(c.results[0].id).toBe(result(12).id);
});
import {vi} from 'vitest';
import {newResultID,utcTimestamp} from '../../../src/platform/identity';
it('generates canonical v4 identity even without secure-context randomUUID',()=>{
 vi.stubGlobal('crypto',{getRandomValues:(bytes:Uint8Array)=>{bytes.fill(0);return bytes;}});try{expect(newResultID()).toBe('00000000-0000-4000-8000-000000000000');expect(isResult({...result(1),id:newResultID(),timestamp:utcTimestamp()})).toBe(true);}finally{vi.unstubAllGlobals();}
 expect(()=>recordResult([],{...result(1),score:-1})).toThrow();const original=result(1);expect(recordResult([original],{...original,score:99})).toEqual([original]);
});
