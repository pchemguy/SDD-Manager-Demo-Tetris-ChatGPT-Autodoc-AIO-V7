/** Isolated SQLite runtime: no DOM, storage, controller or game-state access. */
import initSqlJs from 'sql.js';
import wasmURL from 'sql.js/dist/sql-wasm.wasm?url';
import type {SQLiteCommand} from './sqlite-host';
const scope=self as unknown as {onmessage:((event:MessageEvent<{id:string;command:SQLiteCommand}>)=>void)|null;postMessage(message:unknown):void};
scope.onmessage=async({data:{id,command}})=>{
 try{const SQL=await initSqlJs({locateFile:()=>wasmURL});if(command.kind!=='probe')throw Error('Unknown command');const db=new SQL.Database();try{db.run("PRAGMA user_version=1");scope.postMessage({id,ok:true,value:db.export()});}finally{db.close();}}catch{scope.postMessage({id,ok:false});}
};
