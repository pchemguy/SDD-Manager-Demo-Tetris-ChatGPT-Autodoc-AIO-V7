/** Focus-aware native input and active-time key repeats, ordered with simulation boundaries and cleared on lifecycle changes. */
import type {Controller,Command} from '../app/controller';
const MAP:Record<string,Command>={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'cw',x:'cw',z:'ccw',p:'pause',r:'start',c:'hold',v:'penetrator',' ':'drop'};
export function bindInput(canvas:HTMLCanvasElement,c:Controller,beforeCommand=()=>{}){
 let order=0,serial=c.state.pieceSerial;
 const held=new Map<string,{order:number;next:number}>();
 const clear=()=>{held.clear();serial=c.state.pieceSerial;};
 const winner=()=>['ArrowLeft','ArrowRight'].filter(k=>held.has(k)).sort((a,b)=>held.get(b)!.order-held.get(a)!.order)[0];
 const down=(event:KeyboardEvent)=>{
  if(event.target!==canvas&&event.target!==document.body)return;
  const key=event.key.length===1?event.key.toLowerCase():event.key,command=MAP[key];if(!command)return;
  event.preventDefault();if(event.repeat)return;const targetSerial=c.state.pieceSerial;beforeCommand();
  if(targetSerial!==c.state.pieceSerial&&command!=='pause'&&command!=='start'){clear();return;}
  if(['ArrowLeft','ArrowRight','ArrowDown'].includes(key))held.set(key,{order:++order,next:c.state.time+(key==='ArrowDown'?50:150)});
  c.command(command);if(command==='pause'||command==='start')clear();
 };
 const up=(event:KeyboardEvent)=>{beforeCommand();const previous=winner();held.delete(event.key);const next=winner();if(next&&next!==previous)held.get(next)!.next=c.state.time+150;};
 const blur=()=>{beforeCommand();clear();c.pause();};
 const visibility=()=>{if(document.hidden)blur();};
 const focus=(e:FocusEvent)=>{const action=(e.target as HTMLElement|null)?.dataset?.fileAction;if(e.target!==canvas&&e.target!==document.body&&action!=='save'&&action!=='cancel')blur();};
 const pointer=()=>canvas.focus();
 document.addEventListener('keydown',down);document.addEventListener('keyup',up);document.addEventListener('visibilitychange',visibility);document.addEventListener('focusin',focus);window.addEventListener('blur',blur);canvas.addEventListener('pointerdown',pointer);
 return {clear,advance(ms:number){
  if(c.state.status!=='running'||ms>250){c.tick(ms);clear();return;}
  if(serial!==c.state.pieceSerial)clear();
  const target=c.state.time+Math.max(0,ms);
  while(c.state.status==='running'){
   const keys=[winner(),'ArrowDown'].filter(key=>held.has(key));
   const next=Math.min(...keys.map(key=>held.get(key)!.next));
   if(next>target){c.tick(target-c.state.time);if(serial!==c.state.pieceSerial)clear();break;}
   c.tick(Math.max(0,next-c.state.time));
   if(serial!==c.state.pieceSerial){clear();continue;}
   for(const key of keys.sort((a,b)=>held.get(a)!.order-held.get(b)!.order)){
    const pending=held.get(key);if(!pending||pending.next>c.state.time)continue;
    pending.next+=50;c.command(MAP[key]);if(serial!==c.state.pieceSerial){clear();break;}
   }
  }
 },dispose(){document.removeEventListener('keydown',down);document.removeEventListener('keyup',up);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('focusin',focus);window.removeEventListener('blur',blur);canvas.removeEventListener('pointerdown',pointer);}};
}
