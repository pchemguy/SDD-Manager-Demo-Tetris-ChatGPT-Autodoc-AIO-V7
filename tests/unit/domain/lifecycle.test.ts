/** Deterministic contract regressions for lifecycle. */
import {describe,it,expect} from 'vitest';
import type {Game} from '../../../src/domain/types';
import {startGame,advance,softDrop,lock,togglePause,move} from '../../../src/domain/game';
import {gravityInterval} from '../../../src/domain/timing';
import {MAX_SCORE,scoreFor} from '../../../src/domain/scoring';
const elapsed=(g:Game,ms:number)=>{while(ms>0){const n=Math.min(ms,100);g=advance(g,n);ms-=n;}return g;};
const grounded=()=>({...startGame(1),active:{kind:'O' as const,rotation:0 as const,x:3,y:18}});
describe('time, scoring and lifecycle',()=>{
 it('uses specified gravity and line awards',()=>{expect(gravityInterval(10)).toBe(231);expect(gravityInterval(99)).toBe(100);expect([1,2,3,4].map(n=>scoreFor(n,2))).toEqual([200,600,1000,1600]);});
 it('locks only after a full 1000ms contact interval',()=>{let g=advance(grounded(),0);const serial=g.pieceSerial;expect(g.lockAt).toBe(1000);g=elapsed(g,999);expect(g.pieceSerial).toBe(serial);g=advance(g,1);expect(g.pieceSerial).toBe(serial+1);expect(g.board[19][4]).toBe('O');});
 it('does not extend contact on grounded moves but resets after airborne recontact',()=>{let g=grounded();g=advance(g,0);g=elapsed(g,200);expect(move(g,1,0).lockAt).toBe(1000);let raised={...startGame(1),active:{kind:'O' as const,rotation:0 as const,x:3,y:8}};raised.board[10][4]='J';raised.board[10][5]='J';raised=advance(raised,0);raised=elapsed(raised,200);raised=move(move(raised,-1,0),-1,0);expect(raised.lockAt).toBeNull();raised=move(raised,1,0);expect(raised.lockAt).toBe(1200);});
 it('clears simultaneously and uses level before the clear',()=>{let g={...grounded(),lines:9};for(const y of [18,19])for(let x=0;x<10;x++)if(x!==4&&x!==5)g.board[y][x]='J';const before=g;g=lock(g);expect(g.score).toBe(300);expect(g.lines).toBe(11);expect(g.level).toBe(2);expect(g.board.every(r=>r.every(c=>c===null))).toBe(true);expect(before.board[19][4]).toBeNull();});
 it('freezes paused time, pauses on long frame gaps and restarts cleanly',()=>{const g=elapsed(advance(grounded(),0),300);const paused=togglePause(g);expect(paused.status).toBe('paused');expect(advance(paused,200)).toEqual(paused);const resumed=togglePause(paused);expect(elapsed(resumed,699).pieceSerial).toBe(g.pieceSerial);expect(elapsed(resumed,700).pieceSerial).toBe(g.pieceSerial+1);expect(advance(startGame(),251).status).toBe('paused');expect(startGame().score).toBe(0);});
 it('is frame-partition independent and saturates score',()=>{expect(elapsed(startGame(4),2100)).toEqual(Array.from({length:10}).reduce(g=>advance(g,210),startGame(4)));const g=softDrop({...startGame(1),score:MAX_SCORE});expect(g.score).toBe(MAX_SCORE);expect(softDrop(startGame(1)).score).toBe(1);});
 it('ends above the top once without inserting invalid cells',()=>{let g={...startGame(1),active:{kind:'O' as const,rotation:0 as const,x:3,y:-1}};g.board[1][4]='J';const previous=g.board.map(r=>[...r]);g=lock(g);expect(g.status).toBe('gameover');expect(g.completion).toBe(1);expect(g.board).toEqual(previous);expect(advance(g,100)).toBe(g);expect(lock(g)).toBe(g);});
});
