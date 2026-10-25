import type {Game,Rotation} from './types';
import {emptyBoard,canPlace} from './placement';
import {piece} from './geometry';
import {drawClassic} from './randomizer';
export function createGame(seed=1):Game{return {board:emptyBoard(),active:null,status:'idle',seed:seed>>>0||1,pieceSerial:0};}
export function startGame(seed=1):Game{return spawn(createGame(seed));}
export function spawn(g:Game):Game{
 const draw=drawClassic(g.seed),active=piece(draw.kind);
 return {...g,seed:draw.seed,pieceSerial:g.pieceSerial+1,active:canPlace(g.board,active)?active:null,status:canPlace(g.board,active)?'running':'gameover'};
}
export function move(g:Game,dx:number,dy:number):Game{
 if(g.status!=='running'||!g.active)return g;
 const active={...g.active,x:g.active.x+dx,y:g.active.y+dy};
 return canPlace(g.board,active)?{...g,active}:g;
}
export function rotate(g:Game,direction:1|-1):Game{
 if(g.status!=='running'||!g.active)return g;
 const active={...g.active,rotation:((g.active.rotation+direction+4)%4) as Rotation};
 return canPlace(g.board,active)?{...g,active}:g;
}
