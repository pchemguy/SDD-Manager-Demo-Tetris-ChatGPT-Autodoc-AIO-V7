import {it,expect,vi,afterEach} from 'vitest';
import {Controller} from '../../../src/app/controller';
import {bindInput} from '../../../src/ui/input';
afterEach(()=>vi.unstubAllGlobals());
function setup(before?:(c:Controller)=>void){
 const document=Object.assign(new EventTarget(),{body:{},hidden:false}),window=new EventTarget(),canvas=Object.assign(new EventTarget(),{focus(){}});
 vi.stubGlobal('document',document);vi.stubGlobal('window',window);
 const c=new Controller(()=>1);c.command('start');c.state={...c.state,active:{kind:'O',rotation:0,x:3,y:16},gravityAt:160};
 const input=bindInput(canvas as any,c,()=>before?.(c)) as any;
 const key=(type:string,key:string)=>{const e=new Event(type,{cancelable:true});Object.defineProperties(e,{target:{value:canvas},key:{value:key},repeat:{value:false}});document.dispatchEvent(e);};
 const step=(ms:number)=>{if(input.advance)input.advance(ms);else{c.tick(ms);input.repeat();}};
 return {c,input,key,step};
}
it('interleaves Down repeats and gravity independently of frame partitions',()=>{
 const run=(chunks:number[])=>{const {c,input,key,step}=setup();key('keydown','ArrowDown');chunks.forEach(step);const value={score:c.state.score,y:c.state.active?.y,lockAt:c.state.lockAt,time:c.state.time};input.dispose();return value;};
 expect(run([200])).toEqual(run([50,50,50,50]));expect(run([200])).toEqual({score:2,y:18,lockAt:1050,time:200});
});
it('does not restart a winning direction delay when releasing the inactive direction',()=>{
 const {c,input,key,step}=setup();c.state.active={kind:'O',rotation:0,x:3,y:5};c.state.gravityAt=1000;
 key('keydown','ArrowLeft');step(20);key('keydown','ArrowRight');step(80);key('keyup','ArrowLeft');step(70);
 expect(c.state.active?.x).toBe(4);input.dispose();
});
it('requests a fresh frame clock on start, restart and resume only',()=>{
 let now=100,previous=0;const reset=()=>{previous=now;};const c=new (Controller as any)(()=>1,reset);
 c.command('start');expect(previous).toBe(100);c.command('pause');now=5000;c.command('pause');expect(previous).toBe(5000);now=9000;c.command('start');expect(previous).toBe(9000);
});
it('orders an early repeat before a later lock, but lock first at the same time',()=>{
 const run=(deadline:number)=>{const {c,input,key,step}=setup();c.state.active={kind:'O',rotation:0,x:3,y:17};c.state.board[19][4]='J';c.state.board[19][5]='J';c.state.lockAt=deadline;c.state.gravityAt=1000;const serial=c.state.pieceSerial;key('keydown','ArrowLeft');step(200);const result={serial:c.state.pieceSerial-serial,x:c.state.active?.x,lockAt:c.state.lockAt};input.dispose();return result;};
 expect(run(200)).toEqual({serial:0,x:0,lockAt:null});expect(run(150).serial).toBe(1);expect(run(150).x).toBe(3);
});

it('discards native piece commands if flushing time expires their target piece',()=>{
 for(const keyName of ['ArrowLeft','ArrowUp','ArrowDown']){
  const {c,input,key}=setup(c=>c.tick(100));c.state={...c.state,active:{kind:'O',rotation:0,x:3,y:18},time:900,gravityAt:1000,lockAt:1000};const serial=c.state.pieceSerial;
  key('keydown',keyName);expect({serial:c.state.pieceSerial-serial,x:c.state.active?.x,rotation:c.state.active?.rotation,y:c.state.active?.y,score:c.state.score}).toEqual({serial:1,x:3,rotation:0,y:-1,score:0});input.dispose();
 }
});
it('keeps Save and cancellation focus from pausing an active game',()=>{
 const {c,input}=setup();for(const action of ['save','cancel']){const event=new Event('focusin');Object.defineProperty(event,'target',{value:{dataset:{fileAction:action}}});document.dispatchEvent(event);expect(c.state.status).toBe('running');}input.dispose();
});
