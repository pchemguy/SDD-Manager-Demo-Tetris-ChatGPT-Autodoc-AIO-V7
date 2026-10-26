/** Deterministic contract regressions for files. */
import {it,expect,vi,afterEach} from 'vitest';
import {chooseFiles,download,detectFormat,readSelected} from '../../../src/platform/files';
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
it('cleans picker listeners on cancel/change/error and permits choosing the same file again',async()=>{
 let count=0;class Input extends EventTarget{value='';files:File[]=[];click(){}override addEventListener(...args:any[]){count++;super.addEventListener(args[0],args[1]);}override removeEventListener(...args:any[]){count--;super.removeEventListener(args[0],args[1]);}}
 const input=new Input(),canceled=chooseFiles(input as any);input.dispatchEvent(new Event('cancel'));expect(await canceled).toEqual([]);expect(count).toBe(0);
 for(let i=0;i<2;i++){input.files=[new File(['{}'],'backup.json')];const next=chooseFiles(input as any);input.dispatchEvent(new Event('change'));const files=await next;expect(await files[0].read()).toEqual(new TextEncoder().encode('{}'));expect(count).toBe(0);expect(input.value).toBe('');}
 input.click=()=>{throw Error('denied');};await expect(chooseFiles(input as any)).rejects.toThrow(/picker/);expect(count).toBe(0);
});
it('releases the owned anchor and object URL after success or failed download dispatch',()=>{
 vi.useFakeTimers();const revoke=vi.spyOn(URL,'revokeObjectURL').mockImplementation(()=>{});vi.spyOn(URL,'createObjectURL').mockReturnValue('blob:owned');const remove=vi.fn();let fail=false;vi.stubGlobal('document',{createElement:()=>({click:()=>{if(fail)throw Error('denied');},remove}),body:{append:vi.fn()}});
 download(new Uint8Array([1]),'backup.json','application/json');fail=true;expect(()=>download(new Uint8Array([1]),'backup.json','application/json')).toThrow();expect(remove).toHaveBeenCalledTimes(2);vi.advanceTimersByTime(1000);expect(revoke).toHaveBeenCalledTimes(2);
});
it('classifies exact SQLite header and rejects oversize before reading full content',async()=>{
 expect(detectFormat(new TextEncoder().encode('SQLite format 3\0more'))).toBe('sqlite');expect(detectFormat(new TextEncoder().encode('SQLite format 3'))).toBe('json');const read=vi.fn(async()=>new Uint8Array());await expect(readSelected({size:1024*1024+1,header:async()=>new Uint8Array(),read},new AbortController().signal)).rejects.toThrow(/size/);expect(read).not.toHaveBeenCalled();
});
