/** Serialized file operations stage complete snapshots, discard canceled work and commit through the store. */
import {TransferError,type Snapshot} from '../transfer/types';
import {validateSnapshot} from '../transfer/validate';
import {readSelected,type Files,type FileFormat} from '../platform/files';
export type TransferStore={snapshot():Snapshot;pause():void;commit(snapshot:Snapshot):void;busy(kind:'save'|'restore'|null):void};
export type Codecs={encode(snapshot:Snapshot,format:FileFormat,signal:AbortSignal):Promise<Uint8Array>;decode(bytes:Uint8Array,format:FileFormat,signal:AbortSignal):Promise<Snapshot>};
type Operation={kind:'save'|'restore';abort:AbortController};
export class TransferManager{
 private active:Operation|undefined;
 constructor(private store:TransferStore,private files:Files,private codecs:Codecs,private notify:(message:string)=>void){}
 private begin(kind:Operation['kind']){if(this.active)return;const op={kind,abort:new AbortController()};this.active=op;this.store.busy(kind);return op;}
 private current(op:Operation){return this.active===op&&!op.abort.signal.aborted;}
 private finish(op:Operation){if(this.active===op){this.active=undefined;this.store.busy(null);}}
 private error(op:Operation,error:unknown){if(this.current(op))this.notify(error instanceof Error?error.message.slice(0,220):'File operation failed.');}
 async save(format:FileFormat='json'){
  const op=this.begin('save');if(!op)return;
  try{this.notify('Saving snapshot…');const snapshot=validateSnapshot(this.store.snapshot()),bytes=await this.codecs.encode(snapshot,format,op.abort.signal);if(!this.current(op))return;const name='tetris-save.'+format;this.files.download(bytes,name,format==='json'?'application/json':'application/vnd.sqlite3');this.notify('Downloaded '+name+'.');}catch(error){this.error(op,error);}finally{this.finish(op);}
 }
 async restore(){
  const op=this.begin('restore');if(!op)return;
  try{
   this.store.pause();this.notify('Choose a save file.');const selected=await this.files.choose();if(!this.current(op))return;
   if(!selected.length){this.notify('Restore canceled.');return;}if(selected.length!==1)throw new TransferError('Choose exactly one save file.');
   this.notify('Validating complete save…');const {format,bytes}=await readSelected(selected[0],op.abort.signal);if(!this.current(op))return;
   const staged=await this.codecs.decode(bytes,format,op.abort.signal);if(!this.current(op))return;const snapshot=validateSnapshot(staged);this.store.commit(snapshot);this.notify('Results and settings restored.');
  }catch(error){this.error(op,error);}finally{this.finish(op);}
 }
 cancel(){const op=this.active;if(!op)return;op.abort.abort();this.active=undefined;this.store.busy(null);this.notify(op.kind==='restore'?'Restore canceled.':'Save canceled.');}
}
