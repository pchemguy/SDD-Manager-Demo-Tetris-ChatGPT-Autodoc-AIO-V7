import {it,expect} from 'vitest';
import {startGame,rotate} from '../../../src/domain/game';
import {emptyBoard,canPlace} from '../../../src/domain/placement';
import {cells} from '../../../src/domain/geometry';
it('kicks JLSTZ at either wall, and I off the floor',()=>{
 const g=startGame(1);
 expect(rotate({...g,active:{kind:'T',rotation:1,x:-1,y:5}},1).active).toMatchObject({x:0,rotation:2});
 expect(rotate({...g,active:{kind:'T',rotation:3,x:8,y:5}},-1).active).toMatchObject({x:7,rotation:2});
 expect(rotate({...g,active:{kind:'I',rotation:0,x:3,y:18}},1).active).toMatchObject({x:4,y:16,rotation:1});
 expect(rotate({...g,active:{kind:'I',rotation:0,x:3,y:18}},-1).active).toMatchObject({x:2,y:16,rotation:3});
});
it('keeps O cells fixed and rejects all candidates when obstructed',()=>{
 const g={...startGame(),active:{kind:'O' as const,rotation:0 as const,x:3,y:5}};
 expect(cells(rotate(g,1).active!)).toEqual(cells(g.active));
 const board=emptyBoard().map(row=>row.map(()=>'J' as const));const active={kind:'T' as const,rotation:0 as const,x:3,y:5};for(const {x,y} of cells(active))board[y][x]=null as never;
 const blocked={...g,board,active};expect(canPlace(board,active)).toBe(true);expect(rotate(blocked,1)).toBe(blocked);expect(rotate(blocked,-1)).toBe(blocked);
});
it('accepts the first candidate and preserves grounded contact deadline',()=>{
 const g={...startGame(),active:{kind:'T' as const,rotation:0 as const,x:3,y:18},lockAt:1000};
 const next=rotate(g,1);expect(next.active).toMatchObject({x:2,y:17,rotation:1});expect(next.lockAt).toBe(1000);expect(g.active.y).toBe(18);
});
it('covers I walls, I all-candidate rejection and JLSTZ floor kicks',()=>{
 const g=startGame();
 expect(rotate({...g,active:{kind:'I',rotation:1,x:-2,y:5}},-1).active).toMatchObject({x:0,rotation:0});
 expect(rotate({...g,active:{kind:'I',rotation:3,x:8,y:5}},1).active).toMatchObject({x:6,rotation:0});
 for(const kind of ['J','L','S','T','Z'] as const){const next=rotate({...g,active:{kind,rotation:0,x:3,y:18}},1);expect(next.active).toMatchObject({kind,x:2,y:17,rotation:1});expect(canPlace(next.board,next.active!)).toBe(true);}
 const board=emptyBoard().map(row=>row.map(()=>'J' as const));const active={kind:'I' as const,rotation:0 as const,x:3,y:5};for(const {x,y} of cells(active))board[y][x]=null as never;const blocked={...g,board,active};expect(rotate(blocked,1)).toBe(blocked);expect(rotate(blocked,-1)).toBe(blocked);
});
