/** Isolated SQLite runtime: no DOM, storage, controller or game-state access. */
import {encodeSQLite,decodeSQLite} from './sqlite';
import {encodeJSON} from './json';
import {TransferError} from './types';
import initSqlJs from 'sql.js';
import wasmURL from 'sql.js/dist/sql-wasm.wasm?url';
import type {SQLiteCommand} from './sqlite-host';
const scope=self as unknown as {onmessage:((event:MessageEvent<{id:string;command:SQLiteCommand}>)=>void)|null;postMessage(message:unknown):void};
scope.onmessage=async({data:{id,command}})=>{
 try{
  const SQL=await initSqlJs({locateFile:()=>wasmURL});let value:Uint8Array;
  if(command.kind==='probe'){const db=new SQL.Database();try{db.run('PRAGMA user_version=1');value=db.export();}finally{db.close();}}
  else if(command.kind==='encode')value=encodeSQLite(SQL,command.snapshot);
  else if(command.kind==='decode')value=encodeJSON(decodeSQLite(SQL,command.bytes));
  else throw Error('Unknown command');
  scope.postMessage({id,ok:true,value});
 }catch(error){scope.postMessage({id,ok:false,error:error instanceof TransferError?error.message:'SQLite runtime could not process this file.'});}
};
