import type {Game,Rotation} from './types';
import {emptyBoard,canPlace} from './placement';
import {piece,cells} from './geometry';
import {drawClassic} from './randomizer';
import {contact,gravityInterval} from './timing';
import {scoreFor,addScore} from './scoring';
export function createGame(seed=1):Game {
 return {board:emptyBoard(),active:null,status:'idle',seed:seed>>>0||1,pieceSerial:0,score:0,lines:0,level:1,time:0,gravityAt:1000,lockAt:null,completion:0};
}
export function startGame(seed=1):Game{return spawn(createGame(seed));}
function end(g:Game):Game{return g.status==='gameover'?g:{...g,active:null,status:'gameover',completion:g.completion+1,lockAt:null};}
export function spawn(g:Game):Game {
 const draw=drawClassic(g.seed),active=piece(draw.kind);
 const next={...g,seed:draw.seed,pieceSerial:g.pieceSerial+1,active,gravityAt:g.time+gravityInterval(g.level),lockAt:null};
 return canPlace(g.board,active)?contact({...next,status:'running'}):end(next);
}
export function move(g:Game,dx:number,dy:number):Game {
 if(g.status!=='running'||!g.active)return g;
 const active={...g.active,x:g.active.x+dx,y:g.active.y+dy};
 return canPlace(g.board,active)?contact({...g,active}):g;
}
export function rotate(g:Game,direction:1|-1):Game {
 if(g.status!=='running'||!g.active)return g;
 const active={...g.active,rotation:((g.active.rotation+direction+4)%4) as Rotation};
 return canPlace(g.board,active)?contact({...g,active}):g;
}
export function softDrop(g:Game):Game {
 if(g.status!=='running'||!g.active)return g;
 const next=move(g,0,1);
 return next===g?contact(g):{...next,score:addScore(next.score,1)};
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
 return spawn({...g,board:cleared,active:null,score,lines,level:1+Math.floor(lines/10),lockAt:null});
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
   g={...(down===before?contact(g):down),gravityAt:at+gravityInterval(g.level)};
  }else break;
 }
 return g;
}
