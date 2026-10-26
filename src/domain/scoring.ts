/** Pure completed-row compaction and line-clear scoring at the pre-clear level. */
export const MAX_SCORE=9007199254740991;
export const addScore=(score:number,amount:number)=>Math.min(MAX_SCORE,score+amount);
export const scoreFor=(count:number,level:number)=>([0,100,300,500,800][count]??0)*level;
