/** Native picker/download effects and content-based bounded file reads. */
import {JSON_LIMIT,SQLITE_LIMIT,TransferError} from '../transfer/types';
export type FileFormat='json'|'sqlite';
export type SelectedFile={size:number;header():Promise<Uint8Array>;read():Promise<Uint8Array>};
export interface Files{choose():Promise<SelectedFile[]>;download(bytes:Uint8Array,name:string,mime:string):void;}
const SQLITE_HEADER=new TextEncoder().encode('SQLite format 3\0');
export function detectFormat(bytes:Uint8Array):FileFormat{return bytes.length>=16&&SQLITE_HEADER.every((v,i)=>bytes[i]===v)?'sqlite':'json';}
export async function readSelected(file:SelectedFile,signal:AbortSignal){
 if(!Number.isSafeInteger(file.size)||file.size<1)throw new TransferError('Save file is empty or has an invalid size.');if(file.size>SQLITE_LIMIT)throw new TransferError('Save file exceeds the 5 MiB maximum size.');
 const header=await file.header();signal.throwIfAborted();const format=detectFormat(header),limit=format==='sqlite'?SQLITE_LIMIT:JSON_LIMIT;if(file.size>limit)throw new TransferError(`${format==='json'?'JSON':'SQLite'} save exceeds its size limit.`);
 const bytes=await file.read();signal.throwIfAborted();if(bytes.length!==file.size||bytes.length>limit||detectFormat(bytes)!==format)throw new TransferError('Save file could not be read completely.');return {format,bytes};
}
export function chooseFiles(input:HTMLInputElement):Promise<SelectedFile[]>{return new Promise((resolve,reject)=>{
 input.value='';const clean=()=>{input.removeEventListener('change',change);input.removeEventListener('cancel',cancel);input.value='';};
 const change=()=>{const files=Array.from(input.files??[]);clean();resolve(files.map(file=>({size:file.size,header:async()=>new Uint8Array(await file.slice(0,16).arrayBuffer()),read:async()=>new Uint8Array(await file.arrayBuffer())})));};
 const cancel=()=>{clean();resolve([]);};input.addEventListener('change',change);input.addEventListener('cancel',cancel);try{input.click();}catch{clean();reject(new TransferError('The browser could not open the file picker.'));}
 });}
export function download(bytes:Uint8Array,name:string,mime:string){
 const url=URL.createObjectURL(new Blob([new Uint8Array(bytes).buffer],{type:mime}));let anchor:HTMLAnchorElement|undefined;
 try{anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();}finally{anchor?.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
}
export const browserFiles=(input:HTMLInputElement):Files=>({choose:()=>chooseFiles(input),download});
