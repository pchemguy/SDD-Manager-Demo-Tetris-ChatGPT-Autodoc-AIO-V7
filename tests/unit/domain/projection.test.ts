/** Deterministic contract regressions for projection. */
import {it,expect} from 'vitest';
import {startGame,hardDrop} from '../../../src/domain/game';
import {landing,ghostVisible} from '../../../src/domain/projection';
import {emptyBoard} from '../../../src/domain/placement';
it('uses one contiguous landing for ghost/drop with points and full contact delay',()=>{
 const g={...startGame(),active:{kind:'O' as const,rotation:0 as const,x:3,y:2},time:123};g.board[12][4]='J';
 const target=landing(g.board,g.active);expect(target.y).toBe(10);const dropped=hardDrop(g);expect(dropped.active).toEqual(target);expect(dropped.score).toBe(16);expect(dropped.lockAt).toBe(1123);expect(dropped.pieceSerial).toBe(g.pieceSerial);expect(hardDrop({...dropped,time:400})).toMatchObject({lockAt:1123,score:16});
});
it('hides all upper and straddling projections; row ten and explicit modes are exact',()=>{
 const p={kind:'O' as const,rotation:0 as const,x:3,y:9};expect(ghostVisible(p)).toBe(false);expect(ghostVisible({...p,y:10})).toBe(true);expect(ghostVisible({...p,y:0},'show')).toBe(true);expect(ghostVisible({...p,y:18},'hide')).toBe(false);expect(landing(emptyBoard(),p).y).toBe(18);
});
it('rejects drops outside running play without mutation',()=>{const g={...startGame(),status:'paused' as const};expect(hardDrop(g)).toBe(g);});
