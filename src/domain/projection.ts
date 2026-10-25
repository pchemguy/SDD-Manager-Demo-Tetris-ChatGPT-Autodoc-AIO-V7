/** Canonical terminal placement for drawing, hard drop and contact eligibility. */
import type {Board,Piece} from './types';
import {canPlace} from './placement';
import {cells} from './geometry';
export function landing(board:Board,p:Piece):Piece{let target=p;while(canPlace(board,{...target,y:target.y+1}))target={...target,y:target.y+1};return target;}
export function ghostVisible(p:Piece,mode:'hide'|'dynamic'|'show'='dynamic'){return mode==='show'||mode==='dynamic'&&cells(p).every(c=>c.y>=10);}

export function penetratorLanding(board:Board,p:Piece):Piece|null{
 if(!cells(p).every(c=>c.x>=0&&c.x<10&&c.y>=0&&c.y<20))return null;
 let target:Piece|null=null;
 for(let y=p.y;y<20;y++){const candidate={...p,y};if(cells(candidate).every(c=>c.y<20)&&canPlace(board,candidate))target=candidate;}
 return target;
}
export function destination(board:Board,p:Piece,penetrating=false):Piece|null{return penetrating?penetratorLanding(board,p):landing(board,p);}
export function traversable(board:Board,p:Piece,penetrating=false):boolean{return penetrating?penetratorLanding(board,p)!==null:canPlace(board,p);}
