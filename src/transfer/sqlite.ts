/** Parameterized SQLite export and fixed-query import, followed by full canonical validation. */
import type {SqlJsStatic,Database,SqlValue} from 'sql.js';
import {SETTING_KEYS,wire,decodeSetting,type SettingsKey} from '../app/settings';
import {SQLITE_LIMIT,TransferError,type Snapshot} from './types';
import {validateSnapshot} from './validate';
const APPLICATION_ID=0x54455452;
function rows(db:Database,sql:string):SqlValue[][]{return db.exec(sql)[0]?.values??[];}
function invalid():never{throw new TransferError('Invalid SQLite save: schema, metadata or stored values do not match format version 1.');}
export function encodeSQLite(SQL:SqlJsStatic,value:Snapshot):Uint8Array{
 const snapshot=validateSnapshot(value),db=new SQL.Database();
 try{
  db.run(`PRAGMA user_version=1; PRAGMA application_id=${APPLICATION_ID}; CREATE TABLE high_scores(id TEXT PRIMARY KEY NOT NULL,score INTEGER NOT NULL CHECK(score>=0 AND score<=9007199254740991),timestamp TEXT NOT NULL); CREATE TABLE settings(key TEXT PRIMARY KEY NOT NULL,value TEXT NOT NULL); BEGIN;`);
  for(const r of snapshot.results)db.run('INSERT INTO high_scores(id,score,timestamp) VALUES (?,?,?)',[r.id,r.score,r.timestamp]);
  for(const key of SETTING_KEYS)db.run('INSERT INTO settings(key,value) VALUES (?,?)',[key,wire(snapshot.settings[key])]);
  db.run('COMMIT');return db.export();
 }finally{db.close();}
}
const COLUMNS={high_scores:[['id','TEXT',1,1],['score','INTEGER',1,0],['timestamp','TEXT',1,0]],settings:[['key','TEXT',1,1],['value','TEXT',1,0]]} as const;
export function decodeSQLite(SQL:SqlJsStatic,bytes:Uint8Array):Snapshot{
 if(bytes.length<100||bytes.length>SQLITE_LIMIT||new TextDecoder().decode(bytes.slice(0,16))!=='SQLite format 3\0')invalid();
 let db:Database|undefined;
 try{
  db=new SQL.Database(bytes);
  // Imported CHECK expressions are not evaluated, even by integrity_check.
  db.run('PRAGMA trusted_schema=OFF; PRAGMA ignore_check_constraints=ON; PRAGMA query_only=ON');
  if(rows(db,'PRAGMA user_version')[0]?.[0]!==1||rows(db,'PRAGMA application_id')[0]?.[0]!==APPLICATION_ID)invalid();
  const objects=rows(db,'SELECT type,name,tbl_name,sql FROM sqlite_schema');
  const tables=objects.filter(r=>r[0]==='table');if(tables.length!==2||!['high_scores','settings'].every(t=>tables.some(r=>r[1]===t)))invalid();
  for(const r of objects)if(r[0]!=='table'&&!(r[0]==='index'&&r[3]===null&&typeof r[1]==='string'&&r[1].startsWith('sqlite_autoindex_')&&(r[2]==='high_scores'||r[2]==='settings')))invalid();
  const list=rows(db,'PRAGMA table_list');
  for(const name of ['high_scores','settings'] as const){
   const entry=list.find(r=>r[0]==='main'&&r[1]===name);if(!entry||entry[2]!=='table'||entry[3]!==COLUMNS[name].length||entry[4]!==0||entry[5]!==0)invalid();
   const columns=rows(db,name==='high_scores'?'PRAGMA table_xinfo(high_scores)':'PRAGMA table_xinfo(settings)');
   if(columns.length!==COLUMNS[name].length)invalid();
   columns.forEach((r,i)=>{const [key,type,notnull,pk]=COLUMNS[name][i];if(r[0]!==i||r[1]!==key||r[2]!==type||r[3]!==notnull||r[4]!==null||r[5]!==pk||r[6]!==0)invalid();});
   if(rows(db,name==='high_scores'?'PRAGMA foreign_key_list(high_scores)':'PRAGMA foreign_key_list(settings)').length)invalid();
   const indexes=rows(db,name==='high_scores'?'PRAGMA index_list(high_scores)':'PRAGMA index_list(settings)');if(indexes.length!==1||indexes[0][2]!==1||indexes[0][3]!=='pk'||indexes[0][4]!==0)invalid();
  }
  const integrity=rows(db,'PRAGMA integrity_check');if(integrity.length!==1||integrity[0].length!==1||integrity[0][0]!=='ok')invalid();
  const results=rows(db,'SELECT id,score,timestamp,typeof(id),typeof(score),typeof(timestamp) FROM high_scores LIMIT 11');if(results.length>10)invalid();
  const decoded=results.map(r=>{if(r[3]!=='text'||r[4]!=='integer'||r[5]!=='text')invalid();return {id:r[0],score:r[1],timestamp:r[2]};});
  const settings=rows(db,'SELECT key,value,typeof(key),typeof(value) FROM settings LIMIT 7');if(settings.length!==6)invalid();
  const values:Record<string,unknown>={};for(const r of settings){if(r[2]!=='text'||r[3]!=='text'||typeof r[0]!=='string'||typeof r[1]!=='string'||!SETTING_KEYS.includes(r[0] as SettingsKey)||Object.hasOwn(values,r[0]))invalid();const value=decodeSetting(r[0] as SettingsKey,r[1]);if(value===undefined)invalid();values[r[0]]=value;}
  return validateSnapshot({formatVersion:1,results:decoded,settings:values});
 }catch(error){if(error instanceof TransferError)throw error;throw new TransferError('Invalid or corrupt SQLite save.');}finally{db?.close();}
}
