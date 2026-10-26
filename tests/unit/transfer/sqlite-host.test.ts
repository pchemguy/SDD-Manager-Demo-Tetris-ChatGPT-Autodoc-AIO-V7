/** Host deadlines and disposal are tested independently from SQLite query semantics. */
import {test,expect,vi,afterEach} from 'vitest';
import {sqliteOperation} from '../../../src/transfer/sqlite-host';
afterEach(()=>vi.useRealTimers());
function fixture(){let worker:any={onmessage:null,onerror:null,onmessageerror:null,postMessage:vi.fn(),terminate:vi.fn()};return worker;}
test('operation ignores stale replies and terminates exactly once on its matching reply',async()=>{
 const w=fixture(),signal=new AbortController().signal,p=sqliteOperation({kind:'probe'},signal,()=>w);await Promise.resolve();
 const id=w.postMessage.mock.calls[0][0].id;w.onmessage({data:{id:'stale',ok:true,value:new Uint8Array([9])}});expect(w.terminate).not.toHaveBeenCalled();w.onmessage({data:{id,ok:true,value:new Uint8Array([83,81])}});expect(await p).toEqual(new Uint8Array([83,81]));expect(w.terminate).toHaveBeenCalledTimes(1);
});
test('initialization counts within ten seconds and timeout disposes the worker',async()=>{vi.useFakeTimers();const w=fixture(),p=sqliteOperation({kind:'probe'},new AbortController().signal,()=>w);const assertion=expect(p).rejects.toThrow(/10 seconds/);await vi.advanceTimersByTimeAsync(10000);await assertion;expect(w.terminate).toHaveBeenCalledTimes(1);});
test('startup error and cancellation dispose without returning staged bytes',async()=>{const w=fixture(),a=new AbortController(),p=sqliteOperation({kind:'probe'},a.signal,()=>w);a.abort();await expect(p).rejects.toThrow(/cancel/i);expect(w.terminate).toHaveBeenCalledTimes(1);const x=fixture(),q=sqliteOperation({kind:'probe'},new AbortController().signal,()=>x);x.onerror({preventDefault(){}});await expect(q).rejects.toThrow(/start|runtime/i);expect(x.terminate).toHaveBeenCalledTimes(1);});
