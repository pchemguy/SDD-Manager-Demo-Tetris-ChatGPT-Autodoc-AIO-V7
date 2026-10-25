/** Active-time contact deadlines; airborne poses clear contact without extending grounded deadlines. */
import type {Game} from './types';
import {destination} from './projection';
export const gravityInterval=(level:number)=>Math.max(100,Math.floor(1000*0.85**(level-1)));
export function contact(g:Game):Game {
 if(!g.active||g.status!=='running'&&g.status!=='paused')return g;
 if(g.rules.lockPolicy==='failedDown')return {...g,lockAt:null};
 const target=destination(g.board,g.active,g.penetrating),grounded=target!==null&&target.y===g.active.y;
 return {...g,lockAt:grounded?(g.lockAt??g.time+gravityInterval(g.level)):null};
}
