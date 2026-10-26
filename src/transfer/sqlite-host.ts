/** One disposable worker per request; the deadline includes module/WASM initialization. */
import {TransferError,type Snapshot} from './types';
export type SQLiteCommand={kind:'probe'}|{kind:'encode';snapshot:Snapshot}|{kind:'decode';bytes:Uint8Array};
type WorkerPort=Pick<Worker,'postMessage'|'terminate'|'onmessage'|'onerror'|'onmessageerror'>;
let sequence=0;
export function sqliteOperation(command:SQLiteCommand,signal:AbortSignal,create:()=>WorkerPort=()=>new Worker(new URL('./sqlite.worker.ts',import.meta.url),{type:'module'})):Promise<Uint8Array>{
 return new Promise((resolve,reject)=>{
  let worker:WorkerPort|undefined,done=false;
  const id=String(++sequence),timer=setTimeout(()=>finish(new TransferError('SQLite operation exceeded 10 seconds.')),10000);
  function finish(error?:Error,value?:Uint8Array){if(done)return;done=true;clearTimeout(timer);signal.removeEventListener('abort',cancel);if(worker){worker.onmessage=worker.onerror=worker.onmessageerror=null;worker.terminate();}if(error)reject(error);else resolve(value!);}
  function cancel(){finish(new TransferError('SQLite operation canceled.'));}
  signal.addEventListener('abort',cancel,{once:true});if(signal.aborted){cancel();return;}
  try{worker=create();worker.onmessage=event=>{const reply=event.data;if(reply?.id!==id)return;if(reply.ok&&reply.value instanceof Uint8Array)finish(undefined,reply.value);else finish(new TransferError(typeof reply?.error==='string'?reply.error.slice(0,220):'SQLite runtime could not process this file.'));};worker.onerror=event=>{event.preventDefault();finish(new TransferError('SQLite runtime could not start.'));};worker.onmessageerror=()=>finish(new TransferError('SQLite worker response could not be read.'));worker.postMessage({id,command});}catch{finish(new TransferError('SQLite worker could not start.'));}
 });
}
