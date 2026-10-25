import type {Board,Piece} from './types';
import {canPlace} from './placement';
import {cells} from './geometry';
export function landing(board:Board,p:Piece):Piece{let target=p;while(canPlace(board,{...target,y:target.y+1}))target={...target,y:target.y+1};return target;}
export function ghostVisible(p:Piece,mode:'hide'|'dynamic'|'show'='dynamic'){return mode==='show'||mode==='dynamic'&&cells(p).every(c=>c.y>=10);}
