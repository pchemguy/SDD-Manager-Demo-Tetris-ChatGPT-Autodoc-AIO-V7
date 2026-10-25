/** Complete schema plus canonical identity/calendar validation shared by both portable formats. */
import Ajv2020 from 'ajv/dist/2020';
import schema from '../../docs/dev/spec/SAVE-SCHEMA.json';
import {validTimestamp,rankResults} from '../app/leaderboard';
import {TransferError,type Snapshot} from './types';
const ajv=new Ajv2020({allErrors:true,strict:true,ownProperties:true});
ajv.addFormat('date-time',{type:'string',validate:validTimestamp});
const schemaCheck=ajv.compile<Snapshot>(schema);
export function validateSnapshot(value:unknown):Snapshot{
 if(!schemaCheck(value)){const error=schemaCheck.errors?.[0];throw new TransferError(`Invalid save at ${error?.instancePath||'/'}: ${error?.message||'schema mismatch'}`.slice(0,220));}
 const seen=new Set<string>();for(const [i,result] of value.results.entries()){
  if(!validTimestamp(result.timestamp))throw new TransferError(`Invalid completion timestamp in result ${i+1}`);
  if(seen.has(result.id))throw new TransferError(`Duplicate result ID in result ${i+1}`);seen.add(result.id);
 }
 return {formatVersion:1,results:rankResults(value.results.map(r=>({...r}))),settings:{...value.settings}};
}
