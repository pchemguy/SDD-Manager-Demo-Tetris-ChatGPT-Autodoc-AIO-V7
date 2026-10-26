/** Browser composition root: wires game, input, rendering, preference recovery and serialized file operations. */
import {TransferManager} from './app/transfer';
import {portableCodecs} from './transfer/codecs';
import {browserFiles,type FileFormat} from './platform/files';
import './ui/styles.css';
import {browserPreferences} from './platform/preferences';
import {SETTING_KEYS,decodeSetting,type SettingsKey} from './app/settings';
import {Controller} from './app/controller';
import {createPanels,renderPanels} from './ui/panels';
import {paint} from './ui/board';
import {bindInput} from './ui/input';
import {freshSeed,monotonic} from './platform/clock';
import {bindPageLifecycle} from './ui/lifecycle';
let previous=monotonic(),frameId=0;
const ui=createPanels(),controller=new Controller(freshSeed,()=>{previous=monotonic();});
let preferenceMessage='',fileMessage='';
function renderMessage(){document.querySelector('#message')!.textContent=[...new Set([preferenceMessage,fileMessage].filter(Boolean))].join(' ');}
try{preferenceMessage=controller.initializePreferences(browserPreferences()).join(' ');}catch{preferenceMessage='Saved settings could not be loaded; using session defaults.';}renderMessage();
function advanceTo(now:number){const current=Math.max(now,previous),ms=current-previous;previous=current;input.advance(ms);}
const input=bindInput(ui.canvas,controller,()=>advanceTo(monotonic()));
const transfers=new TransferManager({snapshot:()=>controller.snapshot(),pause:()=>{advanceTo(monotonic());controller.pause();input.clear();},commit:s=>{controller.restoreSnapshot(s);preferenceMessage='';},busy:kind=>{controller.fileOperation=kind;}},browserFiles(ui.file),portableCodecs,message=>{if(controller.persistenceBlocked&&message.includes('recovery is incomplete'))preferenceMessage=message;fileMessage=message;renderMessage();});
ui.save.addEventListener('click',()=>{advanceTo(monotonic());ui.canvas.focus();void transfers.save(ui.format.value as FileFormat);});
ui.restore.addEventListener('click',()=>{void transfers.restore();});
ui.cancel.addEventListener('click',()=>{transfers.cancel();ui.canvas.focus();});
ui.start.addEventListener('click',()=>{controller.command('start');input.clear();ui.canvas.focus();});
ui.settings.addEventListener('change',event=>{
 const target=event.target;if(!(target instanceof HTMLSelectElement))return;const key=target.dataset.setting as SettingsKey;if(!SETTING_KEYS.includes(key))return;
 try{const value=decodeSetting(key,target.value);controller.changeSettings({...controller.settings,[key]:value},[key]);input.clear();preferenceMessage='';fileMessage='';renderMessage();}catch(error){preferenceMessage=error instanceof Error?error.message:'Settings were not changed.';renderMessage();}
});
let pointerPause=false;
ui.pause.addEventListener('pointerdown',()=>{pointerPause=controller.state.status==='running';});
ui.pause.addEventListener('pointercancel',()=>{pointerPause=false;});
ui.pause.addEventListener('click',()=>{if(pointerPause)controller.pause();else controller.command('pause');pointerPause=false;input.clear();ui.canvas.focus();});
function frame(now:number){advanceTo(now);paint(ui.canvas,controller.state,controller.settings.ghost);renderPanels(controller.state,controller.settings,controller.persistenceBlocked,controller.results,controller.fileOperation);frameId=requestAnimationFrame(frame);}
frameId=requestAnimationFrame(frame);
bindPageLifecycle(window,{pause:()=>controller.pause(),clear:input.clear,suspend:()=>cancelAnimationFrame(frameId),resume:()=>{previous=monotonic();frameId=requestAnimationFrame(frame);},dispose:input.dispose});
if(import.meta.env.MODE==='test')Object.assign(window,{__tetris:controller});
