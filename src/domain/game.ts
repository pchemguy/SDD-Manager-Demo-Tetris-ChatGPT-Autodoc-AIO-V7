/** Immutable gameplay transitions and active-time event ordering; adapters supply commands and elapsed time. */
import type {Game,Rotation,Kind,Rules} from './types';
import {DEFAULT_RULES} from './types';
import {emptyBoard,canPlace} from './placement';
import {piece,cells} from './geometry';
import {destination,traversable} from './projection';
import {kicks} from './kicks';
import {nextBag} from './randomizer';
import {contact,gravityInterval} from './timing';
import {scoreFor,addScore} from './scoring';
export function createGame(seed=1):Game {
 return {rules:{...DEFAULT_RULES},board:emptyBoard(),active:null,status:'idle',seed:seed>>>0||1,pieceSerial:0,score:0,lines:0,level:1,time:0,gravityAt:1000,lockAt:null,completion:0,bag:[],queue:[],held:null,holdUsed:false,bonuses:0,penetrating:false};
}
export function startGame(seed=1):Game{return spawn(createGame(seed));}
function end(g:Game):Game{return g.status==='gameover'?g:{...g,active:null,status:'gameover',penetrating:false,completion:g.completion+1,lockAt:null};}
function queued(g:Game):Game {
 let seed=g.seed,bag=[...g.bag],queue=[...g.queue];
 while(queue.length<2){const n=nextBag({seed,bag});seed=n.seed;bag=n.bag;queue.push(n.kind);}
 return {...g,seed,bag,queue};
}
function spawnKind(g:Game,kind:Kind,holdUsed:boolean):Game {
 const active=piece(kind),next={...g,pieceSerial:g.pieceSerial+1,active,holdUsed,penetrating:false,gravityAt:g.time+gravityInterval(g.level),lockAt:null};
 return canPlace(g.board,active)?contact({...next,status:'running'}):end(next);
}
export function spawn(g:Game):Game {
 const next=queued(g);return spawnKind({...next,queue:next.queue.slice(1)},next.queue[0],false);
}
export function move(g:Game,dx:number,dy:number):Game {
 if(g.status!=='running'||!g.active)return g;
 const active={...g.active,x:g.active.x+dx,y:g.active.y+dy};
 return traversable(g.board,active,g.penetrating)?contact({...g,active}):g;
}
export function rotate(g:Game,direction:1|-1):Game {
 if(g.status!=='running'||!g.active)return g;
 const active={...g.active,rotation:((g.active.rotation+direction+4)%4) as Rotation};
 for(const [dx,dy] of kicks(active.kind,g.active.rotation,active.rotation)){const candidate={...active,x:active.x+dx,y:active.y+dy};if(traversable(g.board,candidate,g.penetrating))return contact({...g,active:candidate});}
 return g;
}
export function softDrop(g:Game):Game {
 if(g.status!=='running'||!g.active)return g;
 const next=move(g,0,1);
 return next===g?(g.rules.lockPolicy==='failedDown'?lock(g):contact(g)):{...next,score:addScore(next.score,1)};
}
export function lock(g:Game):Game {
 if(g.status!=='running'||!g.active)return g;
 const occupied=cells(g.active);
 if(occupied.some(c=>c.y<0)||!canPlace(g.board,g.active))return end(g);
 const board=g.board.map(row=>[...row]);
 for(const {x,y} of occupied)board[y][x]=g.active.kind;
 const remaining=board.filter(row=>row.some(c=>c===null)),count=20-remaining.length;
 const cleared=[...Array.from({length:count},()=>Array(10).fill(null)),...remaining];
 const lines=addScore(g.lines,count),score=addScore(g.score,scoreFor(count,g.level));
 return spawn({...g,board:cleared,active:null,score,lines,bonuses:Math.min(3,g.bonuses+(count===4?1:0)),level:1+Math.floor(lines/10),lockAt:null});
}
export function togglePause(g:Game):Game {
 return g.status==='running'?{...g,status:'paused'}:g.status==='paused'?{...g,status:'running'}:g;
}
export function advance(input:Game,ms:number):Game {
 if(input.status!=='running')return input;
 if(!Number.isFinite(ms)||ms<0)return input;
 if(ms>250)return {...input,status:'paused'};
 let g=contact(input);const target=g.time+ms;
 while(g.status==='running'&&g.time<target) {
  const at=Math.min(target,g.gravityAt,g.lockAt??Infinity);
  g={...g,time:at};
  if(g.lockAt!==null&&g.lockAt<=at){g=lock(g);continue;}
  if(g.gravityAt<=at){
   const before=g,down=move(g,0,1);
   if(down===before&&g.rules.lockPolicy==='failedDown'){g=lock(g);}else{g={...(down===before?contact(g):down),gravityAt:at+gravityInterval(g.level)};}
  }else break;
 }
 return g;
}

export function hold(g:Game):Game {
 if(g.status!=='running'||!g.active||g.holdUsed||g.penetrating||!g.rules.hold)return g;
 const kind=g.active.kind;
 if(g.held)return spawnKind({...g,held:kind},g.held,true);
 return {...spawn({...g,held:kind,active:null}),holdUsed:true};
}
export function hardDrop(g:Game):Game{
 if(g.status!=='running'||!g.active||!g.rules.hardDrop)return g;
 const active=destination(g.board,g.active,g.penetrating);if(!active)return g;const next=contact({...g,active,score:addScore(g.score,2*(active.y-g.active.y))});return g.rules.hardDropLock==='immediate'?lock(next):next;
}
export function activate(g:Game):Game{
 if(g.status!=='running'||!g.active||g.penetrating||g.bonuses<1||!cells(g.active).every(c=>c.x>=0&&c.x<10&&c.y>=0&&c.y<20))return g;
 if(!destination(g.board,g.active,true))return g;
 return contact({...g,bonuses:g.bonuses-1,penetrating:true});
}
export function applyRules(g:Game,rules:Rules):Game{
 const changed=g.rules.lockPolicy!==rules.lockPolicy;
 const next={...g,rules:{hardDrop:rules.hardDrop,hold:rules.hold,hardDropLock:rules.hardDropLock,lockPolicy:rules.lockPolicy},lockAt:changed?null:g.lockAt};
 return changed?contact(next):next;
}
