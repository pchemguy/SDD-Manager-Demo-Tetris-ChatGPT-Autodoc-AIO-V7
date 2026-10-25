/** Bounded UTF-8 JSON codec; member duplicates are detected before normal object construction. */
import {JSON_LIMIT,TransferError,type Snapshot} from './types';
import {validateSnapshot} from './validate';
function checkMembers(text:string){
 let at=0;const skip=()=>{while(/[\t\n\r ]/.test(text[at]??'x'))at++;};
 const fail=():never=>{throw new TransferError('Invalid JSON save.');};
 const string=():string=>{
  if(text[at]!== '"')return fail();const start=at++;
  while(at<text.length){const c=text[at++];if(c==='"'){try{return JSON.parse(text.slice(start,at));}catch{return fail();}}if(c==='\\')at++;}
  return fail();
 };
 const value=(depth:number):void=>{
  if(depth>64)throw new TransferError('JSON save nesting is too deep.');skip();const c=text[at];
  if(c==='"'){string();return;}
  if(c==='{'||c==='['){at++;skip();const close=c==='{'?'}':']',names=new Set<string>();if(text[at]===close){at++;return;}
   while(at<text.length){if(c==='{'){skip();const key=string();if(names.has(key))throw new TransferError('Duplicate JSON member name.');names.add(key);skip();if(text[at++]!==':')fail();}value(depth+1);skip();if(text[at]===close){at++;return;}if(text[at++]!==',')fail();}
   fail();
  }
  const match=/^(?:-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?|true|false|null)/.exec(text.slice(at));if(!match)fail();at+=match![0].length;
 };
 value(0);skip();if(at!==text.length)fail();
}
export function decodeJSON(bytes:Uint8Array):Snapshot{
 if(!bytes.length)throw new TransferError('Save file is empty.');if(bytes.length>JSON_LIMIT)throw new TransferError('JSON save exceeds 1 MiB size limit.');
 let text:string;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{throw new TransferError('Save file must contain valid UTF-8 JSON.');}
 checkMembers(text);let value:unknown;try{value=JSON.parse(text);}catch{throw new TransferError('Invalid JSON save.');}return validateSnapshot(value);
}
export function encodeJSON(value:Snapshot):Uint8Array{return new TextEncoder().encode(JSON.stringify(validateSnapshot(value),null,2)+'\n');}
