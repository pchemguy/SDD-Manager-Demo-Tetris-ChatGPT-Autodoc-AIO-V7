import {DEFAULT_SETTINGS,resolveSettings,SETTING_KEYS,type Settings,type SettingsKey} from './settings';
import type {Preferences,RawCookies} from '../platform/preferences';
import {commitSettings,SettingsTransaction} from './settings-transaction';
import {createGame,startGame,advance,move,rotate,softDrop,togglePause,hold,hardDrop,activate,applyRules} from '../domain/game';
import type {Game} from '../domain/types';
export type Command='left'|'right'|'down'|'cw'|'ccw'|'pause'|'start'|'hold'|'drop'|'penetrator';
export class Controller {
 state:Game=createGame();
 settings:Settings={...DEFAULT_SETTINGS};
 private settingsTransaction=new SettingsTransaction();
 get persistenceBlocked(){return this.settingsTransaction.blocked;}
 changeSettings(candidate:unknown,keys?:readonly SettingsKey[]){
  commitSettings(candidate,s=>this.settingsTransaction.commit(s,keys??SETTING_KEYS.filter(k=>s[k]!==this.settings[k]),next=>{this.state=applyRules(this.state,next);this.settings=next;}));
 }
 initializePreferences(port:Preferences):string[]{
  const warnings:string[]=[];let cookies:RawCookies={};try{cookies=port.readCookies();}catch{warnings.push('Saved settings could not be read from this browser.');}
  const resolved=resolveSettings(port.readURL(),cookies);this.changeSettings(resolved.settings);this.settingsTransaction=new SettingsTransaction(port);
  try{this.settingsTransaction.commit(resolved.settings,resolved.explicit,s=>{this.state=applyRules(this.state,s);this.settings=s;},false);}catch(error){warnings.push(error instanceof Error?error.message:'Saved settings are unavailable.');}
  return [...resolved.warnings,...warnings];
 }
 constructor(private seed:()=>number,private resetClock=()=>{}){}
 command(command:Command){
  if(command==='start'){this.state=applyRules(startGame(this.seed()),this.settings);this.resetClock();return;}
  if(command==='pause'){this.state=togglePause(this.state);if(this.state.status==='running')this.resetClock();return;}
  if(command==='penetrator'){this.state=activate(this.state);return;}
  if(command==='drop'){this.state=hardDrop(this.state);return;}
  if(command==='hold'){this.state=hold(this.state);return;}
  this.state=command==='left'?move(this.state,-1,0):command==='right'?move(this.state,1,0):command==='down'?softDrop(this.state):rotate(this.state,command==='cw'?1:-1);
 }
 tick(ms:number){this.state=advance(this.state,ms);}
 pause(){if(this.state.status==='running')this.state=togglePause(this.state);}
}
