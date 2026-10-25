import type {Board,Piece} from './types';
import {cells} from './geometry';
export const emptyBoard=():Board=>Array.from({length:20},()=>Array(10).fill(null));
export function canPlace(board:Board,piece:Piece){return cells(piece).every(({x,y})=>x>=0&&x<10&&y<20&&(y<0||board[y][x]===null));}
