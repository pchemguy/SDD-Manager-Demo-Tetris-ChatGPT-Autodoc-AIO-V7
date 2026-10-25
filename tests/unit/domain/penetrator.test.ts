import {it,expect} from 'vitest';
import {startGame,activate,move,hold,hardDrop,lock,rotate,advance} from '../../../src/domain/game';
import {cells} from '../../../src/domain/geometry';
import {emptyBoard} from '../../../src/domain/placement';
it('spends exactly once only with a bonus and fully visible running piece',()=>{
 const g={...startGame(),active:{kind:'T' as const,rotation:0 as const,x:3,y:2},bonuses:0,penetrating:false};expect(activate(g)).toBe(g);
 const available={...g,bonuses:1};const next=activate(available);expect(next).toMatchObject({bonuses:0,penetrating:true});expect(activate(next)).toBe(next);expect(activate({...available,status:'paused'}).bonuses).toBe(1);expect(activate({...available,active:{...g.active,y:-1}}).penetrating).toBe(false);expect(hold(next)).toBe(next);
});
it('passes blockers to a deeper pocket with identical hard-drop endpoint and preserves settled cells',()=>{
 const g={...startGame(),active:{kind:'O' as const,rotation:0 as const,x:3,y:6},bonuses:1,penetrating:false,lockAt:1000};for(const y of [8,17])for(const x of [4,5])g.board[y][x]='J';
 expect(hardDrop(g).active!.y).toBe(6);const p=activate(g);expect(p.lockAt).toBe(null);const overlap=move(p,0,1);expect(overlap.active!.y).toBe(7);expect(overlap.board).toBe(g.board);expect(overlap.lockAt).toBe(null);expect(lock(overlap).board).toBe(g.board);expect(lock(overlap).status).toBe('gameover');
 const drop=hardDrop(overlap);expect(drop.active!.y).toBe(18);expect(drop.lockAt).toBe(drop.time+1000);const done=lock(drop);expect(done.board[8][4]).toBe('J');expect(done.board[17][5]).toBe('J');expect(done.board[19][4]).toBe('O');expect(done.penetrating).toBe(false);
});
it('rejects traversal with no legal landing',()=>{
 const g={...startGame(),active:{kind:'O' as const,rotation:0 as const,x:3,y:4},bonuses:1,penetrating:false};for(let y=4;y<20;y++)g.board[y][6]='J';const p=activate(g);expect(move(p,1,0)).toBe(p);expect(move({...p,active:{...p.active!,x:-1}},-1,0).active!.x).toBe(-1);
});
it('awards one bonus only for four simultaneous lines, capped at three',()=>{
 for(const prior of [0,2,3]){const board=emptyBoard();for(let y=16;y<20;y++)for(let x=0;x<10;x++)if(x!==5)board[y][x]='J';const g={...startGame(),board,active:{kind:'I' as const,rotation:1 as const,x:3,y:16},bonuses:prior,penetrating:false};const next=lock(g);expect(next.lines).toBe(4);expect(next.bonuses).toBe(Math.min(3,prior+1));}
 const board=emptyBoard();for(let x=0;x<10;x++)if(x!==5)board[19][x]='J';expect(lock({...startGame(),board,active:{kind:'I',rotation:1,x:3,y:16}}).bonuses).toBe(0);
});

it('keeps penetrating rotations bounded and overlap airborne until a legal terminal lock',()=>{
 const g={...startGame(),active:{kind:'I' as const,rotation:0 as const,x:3,y:0},bonuses:1};g.board[3][5]='J';
 const p=activate(g);const r=rotate(p,1);expect(r.active!.rotation).toBe(1);expect(r.active!.y).toBeGreaterThanOrEqual(0);expect(r.penetrating).toBe(true);
 let t=r;for(let i=0;i<4;i++)t=advance(t,250);expect(t.completion).toBe(0);expect(t.board[3][5]).toBe('J');expect(t.pieceSerial).toBe(r.pieceSerial);
 const drop=hardDrop(t);expect(drop.active!.y).toBe(16);let done=drop;for(let i=0;i<4;i++)done=advance(done,250);expect(done.penetrating).toBe(false);expect(done.board[3][5]).toBe('J');
});

it('uses first viable penetrator kicks at the top/floor and rejects all blocked terminal candidates',()=>{
 const base={...startGame(),bonuses:1};
 const top=activate({...base,active:{kind:'I',rotation:0,x:3,y:-1}});expect(top.penetrating).toBe(true);const kicked=rotate(top,1);expect(kicked.active).toMatchObject({rotation:1,x:1,y:0});expect(cells(kicked.active!).every(c=>c.y>=0)).toBe(true);
 for(const kind of ['I','T'] as const){
  const floor=rotate(activate({...base,active:{kind,rotation:0,x:3,y:18}}),1);expect(floor.active).toMatchObject(kind==='I'?{rotation:1,x:4,y:16}:{rotation:1,x:2,y:17});
  const active={kind,rotation:0 as const,x:3,y:5},board=emptyBoard().map(row=>row.map(()=>'J' as const));for(const {x,y} of cells(active))board[y][x]=null as never;const p=activate({...base,board,active});expect(p.penetrating).toBe(true);expect(rotate(p,1)).toBe(p);expect(rotate(p,-1)).toBe(p);
 }
});
