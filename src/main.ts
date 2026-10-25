import './ui/styles.css';
import {Controller} from './app/controller';
import {createPanels,renderPanels} from './ui/panels';
import {paint} from './ui/board';
import {bindInput} from './ui/input';
import {freshSeed,monotonic} from './platform/clock';
import {bindPageLifecycle} from './ui/lifecycle';
let previous=monotonic(),frameId=0;
const ui=createPanels(),controller=new Controller(freshSeed,()=>{previous=monotonic();});
function advanceTo(now:number){const current=Math.max(now,previous),ms=current-previous;previous=current;input.advance(ms);}
const input=bindInput(ui.canvas,controller,()=>advanceTo(monotonic()));
ui.start.addEventListener('click',()=>{controller.command('start');input.clear();ui.canvas.focus();});
let pointerPause=false;
ui.pause.addEventListener('pointerdown',()=>{pointerPause=controller.state.status==='running';});
ui.pause.addEventListener('pointercancel',()=>{pointerPause=false;});
ui.pause.addEventListener('click',()=>{if(pointerPause)controller.pause();else controller.command('pause');pointerPause=false;input.clear();ui.canvas.focus();});
function frame(now:number){advanceTo(now);paint(ui.canvas,controller.state);renderPanels(controller.state);frameId=requestAnimationFrame(frame);}
frameId=requestAnimationFrame(frame);
bindPageLifecycle(window,{pause:()=>controller.pause(),clear:input.clear,suspend:()=>cancelAnimationFrame(frameId),resume:()=>{previous=monotonic();frameId=requestAnimationFrame(frame);},dispose:input.dispose});
if(import.meta.env.MODE==='test')Object.assign(window,{__tetris:controller});
