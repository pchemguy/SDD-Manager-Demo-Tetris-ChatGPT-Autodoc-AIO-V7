import type {Game} from './types';
import {canPlace} from './placement';
export const gravityInterval=(level:number)=>Math.max(100,Math.floor(1000*0.85**(level-1)));
export function contact(g:Game):Game {
 if(!g.active||g.status!=='running')return g;
 const grounded=!canPlace(g.board,{...g.active,y:g.active.y+1});
 return {...g,lockAt:grounded?(g.lockAt??g.time+gravityInterval(g.level)):null};
}
