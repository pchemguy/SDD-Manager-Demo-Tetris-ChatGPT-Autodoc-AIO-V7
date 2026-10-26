/** Real SQLite fixtures check metadata, schema, storage classes and canonical validation. */
import {beforeAll,test,expect} from 'vitest';
import initSqlJs,{type SqlJsStatic} from 'sql.js';
import {encodeSQLite,decodeSQLite} from '../../../src/transfer/sqlite';
import {encodeJSON,decodeJSON} from '../../../src/transfer/json';
import {DEFAULT_SETTINGS,SETTING_KEYS,wire} from '../../../src/app/settings';
import type {Snapshot} from '../../../src/transfer/types';
let SQL:SqlJsStatic;beforeAll(async()=>{SQL=await initSqlJs();});
const item=(i:number)=>({id:'00000000-0000-4000-8000-'+i.toString(16).padStart(12,'0'),score:i===9?Number.MAX_SAFE_INTEGER:i,timestamp:'2026-10-25T12:34:56.789Z'});
const sample=(n=0):Snapshot=>({formatVersion:1,results:Array.from({length:n},(_,i)=>item(i)),settings:{...DEFAULT_SETTINGS}});
function change(sql:string){const db=new SQL.Database();try{db.run('PRAGMA user_version=1; PRAGMA application_id=0x54455452; CREATE TABLE high_scores(id TEXT PRIMARY KEY NOT NULL,score INTEGER NOT NULL CHECK(score>=0 AND score<=9007199254740991),timestamp TEXT NOT NULL); CREATE TABLE settings(key TEXT PRIMARY KEY NOT NULL,value TEXT NOT NULL)');for(const r of sample(10).results)db.run('INSERT INTO high_scores VALUES (?,?,?)',[r.id,r.score,r.timestamp]);for(const key of SETTING_KEYS)db.run('INSERT INTO settings VALUES (?,?)',[key,wire(DEFAULT_SETTINGS[key])]);db.run(sql);return db.export();}finally{db.close();}}
test('real SQLite empty/full and JSON cross-format retain safe scores, identities, timestamps and six settings',()=>{
 for(const n of [0,10]){const s=decodeJSON(encodeJSON(sample(n))),bytes=encodeSQLite(SQL,s);expect(new TextDecoder().decode(bytes.slice(0,16))).toBe('SQLite format 3\0');expect(decodeJSON(encodeJSON(decodeSQLite(SQL,bytes)))).toEqual(s);const db=new SQL.Database(bytes);try{expect(db.exec('PRAGMA user_version')[0].values[0][0]).toBe(1);expect(db.exec('SELECT count(*) FROM settings')[0].values[0][0]).toBe(6);}finally{db.close();}}
});
const mutations=[
 'PRAGMA user_version=2','PRAGMA application_id=0',
 'CREATE TABLE extra(x)','CREATE VIEW extra AS SELECT * FROM settings','CREATE INDEX bad ON high_scores(score)','CREATE TRIGGER bad AFTER INSERT ON settings BEGIN DELETE FROM high_scores; END',
 'ALTER TABLE high_scores ADD COLUMN extra TEXT','ALTER TABLE settings RENAME COLUMN value TO wrong',
 "DELETE FROM settings WHERE key='hold'","UPDATE settings SET key='unknown' WHERE key='hold'","UPDATE settings SET value='true' WHERE key='hold'","UPDATE settings SET value=x'6f6e' WHERE key='hold'",
 "PRAGMA ignore_check_constraints=ON; UPDATE high_scores SET score=-1 WHERE score=0","PRAGMA ignore_check_constraints=ON; UPDATE high_scores SET score=9007199254740992 WHERE score=1","UPDATE high_scores SET score=1.5 WHERE score=1","UPDATE high_scores SET score='wrong' WHERE score=1","UPDATE high_scores SET timestamp='2026-02-30T00:00:00.000Z' WHERE score=1","UPDATE high_scores SET id='bad' WHERE score=1",
 "INSERT INTO high_scores VALUES ('00000000-0000-4000-8000-000000000010',1,'2026-10-25T12:34:56.789Z')",
 'ALTER TABLE settings RENAME TO old; CREATE TABLE settings(key TEXT, value TEXT); INSERT INTO settings SELECT * FROM old; DROP TABLE old',
 'ALTER TABLE settings RENAME TO old; CREATE TABLE settings(key TEXT PRIMARY KEY NOT NULL,value TEXT NOT NULL) WITHOUT ROWID; INSERT INTO settings SELECT * FROM old; DROP TABLE old'
];
test.each(mutations)('rejects complete database mutation: %s',sql=>expect(()=>decodeSQLite(SQL,change(sql))).toThrow());
test('rejects truncated, corrupt, spoofed and oversized databases',()=>{const valid=encodeSQLite(SQL,sample());for(const bytes of [valid.slice(0,100),new TextEncoder().encode('SQLite format 3\0garbage'),new Uint8Array(5*1024*1024+1),new Uint8Array()])expect(()=>decodeSQLite(SQL,bytes)).toThrow();});
test('rejects view substitutions, foreign keys, generated columns and null-affinity schema',()=>{
 for(const sql of [
 'ALTER TABLE high_scores RENAME TO old; CREATE VIEW high_scores AS SELECT * FROM old',
 'ALTER TABLE settings RENAME TO old; CREATE TABLE settings(key TEXT PRIMARY KEY NOT NULL,value TEXT NOT NULL REFERENCES high_scores(id)); DROP TABLE old',
 "ALTER TABLE high_scores ADD COLUMN hidden TEXT GENERATED ALWAYS AS (id) VIRTUAL",
 'ALTER TABLE settings RENAME TO old; CREATE TABLE settings(key TEXT PRIMARY KEY,value TEXT); INSERT INTO settings SELECT * FROM old; DROP TABLE old'
 ])expect(()=>decodeSQLite(SQL,change(sql))).toThrow();
});
test('ordinary schema without CHECK is accepted but imported CHECK code is never evaluated',()=>{
 let calls=0;class Instrumented extends SQL.Database{constructor(data?:Uint8Array){super(data);this.create_function('tripwire',(_score:number)=>{calls++;return 1;});}}
 const db=new Instrumented(encodeSQLite(SQL,sample(10)));let bytes:Uint8Array;try{db.run('ALTER TABLE high_scores RENAME TO old; CREATE TABLE high_scores(id TEXT PRIMARY KEY NOT NULL,score INTEGER NOT NULL CHECK(tripwire(score)),timestamp TEXT NOT NULL); INSERT INTO high_scores SELECT * FROM old; DROP TABLE old');bytes=db.export();}finally{db.close();}calls=0;expect(decodeSQLite({...SQL,Database:Instrumented} as any,bytes).results).toHaveLength(10);expect(calls).toBe(0);
 const noCheck=change('ALTER TABLE high_scores RENAME TO old; CREATE TABLE high_scores(id TEXT PRIMARY KEY NOT NULL,score INTEGER NOT NULL,timestamp TEXT NOT NULL); INSERT INTO high_scores SELECT * FROM old; DROP TABLE old');expect(decodeSQLite(SQL,noCheck).results).toHaveLength(10);
});
