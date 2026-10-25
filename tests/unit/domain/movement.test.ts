import {describe,it,expect} from 'vitest';
import {KINDS} from '../../../src/domain/types';
import {shape,cells,piece} from '../../../src/domain/geometry';
import {emptyBoard,canPlace} from '../../../src/domain/placement';
import {createGame,startGame,spawn,move,rotate} from '../../../src/domain/game';
import {drawClassic} from '../../../src/domain/randomizer';
describe('classic geometry and legal movement',()=>{
 it('defines four distinct cells for every orientation and keeps O invariant',()=>{for(const k of KINDS)for(const r of [0,1,2,3] as const)expect(new Set(shape(k,r).map(p=>`${p.x},${p.y}`)).size).toBe(4);expect(shape('O',1)).toEqual(shape('O',0));expect(shape('I',1)).toEqual([{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:2,y:3}]);});
 it('enforces side/bottom bounds but permits normal above-top cells',()=>{const b=emptyBoard();expect(canPlace(b,piece('T'))).toBe(true);expect(canPlace(b,{...piece('I'),x:-1})).toBe(false);expect(canPlace(b,{...piece('O'),y:19})).toBe(false);});
 it('rejects settled-cell overlap',()=>{const b=emptyBoard();b[0][3]='J';expect(canPlace(b,piece('I'))).toBe(false);});
 it('starts and moves without mutating the previous state',()=>{const g=startGame(123);expect(g.status).toBe('running');const next=move(g,-1,0);expect(next.active!.x).toBe(2);expect(g.active!.x).toBe(3);expect(move({...g,status:'paused'},1,0).active).toEqual(g.active);});
 it('uses SRS for a wall rotation',()=>{const g={...startGame(1),active:{kind:'T' as const,rotation:1 as const,x:-1,y:5}};expect(canPlace(g.board,g.active)).toBe(true);expect(rotate(g,1).active).toMatchObject({x:0,rotation:2});});
 it('ends on failed spawn and draws reproducibly',()=>{const g=createGame(7);g.board=Array.from({length:20},()=>Array(10).fill('J'));expect(spawn(g).status).toBe('gameover');expect(drawClassic(42)).toEqual(drawClassic(42));expect(KINDS).toContain(drawClassic(42).kind);});
});
