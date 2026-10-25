/** Canonical completed results and deterministic session ranking; no persistence effects. */
export type Result={id:string;score:number;timestamp:string};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function validTimestamp(value:unknown):value is string{
 if(typeof value!=='string'||!/^(?!0000)[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/.test(value))return false;
 const date=new Date(value);return Number.isFinite(date.getTime())&&date.toISOString()===value;
}
export function isResult(value:unknown):value is Result{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;const r=value as Record<string,unknown>;
 return Object.keys(r).length===3&&['id','score','timestamp'].every(k=>Object.hasOwn(r,k))&&typeof r.id==='string'&&UUID.test(r.id)&&typeof r.score==='number'&&Number.isSafeInteger(r.score)&&r.score>=0&&validTimestamp(r.timestamp);
}
export function rankResults(results:readonly Result[]):Result[]{return [...results].sort((a,b)=>b.score-a.score||(a.timestamp<b.timestamp?-1:a.timestamp>b.timestamp?1:0)||(a.id<b.id?-1:a.id>b.id?1:0)).slice(0,10);}
export function recordResult(results:readonly Result[],result:Result):Result[]{if(!isResult(result))throw new Error('Invalid completed-game result');return results.some(r=>r.id===result.id)?[...results]:rankResults([...results,result]);}
