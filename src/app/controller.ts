/** Application lifecycle owner: advances deterministic game state, coordinates preferences and publishes completed results once. */
import {validateSnapshot} from '../transfer/validate';
import type {Snapshot} from '../transfer/types';
/** Coordinates commands, live preferences and one completed result per game; platform effects stay injected. */
import {newResultID,utcTimestamp} from '../platform/identity';
import {recordResult,type Result} from './leaderboard';
import {DEFAULT_SETTINGS,resolveSettings,SETTING_KEYS,type Settings,type SettingsKey} from './settings';
import type {Preferences,RawCookies} from '../platform/preferences';
import {commitSettings,SettingsTransaction} from './settings-transaction';
import {createGame,startGame,advance,move,rotate,softDrop,togglePause,hold,hardDrop,activate,applyRules} from '../domain/game';
import type {Game} from '../domain/types';
export type Command='left'|'right'|'down'|'cw'|'ccw'|'pause'|'start'|'hold'|'drop'|'penetrator';
export class Controller {
 state:Game=createGame();
 results:Result[]=[];
 fileOperation:'save'|'restore'|null=null;
 snapshot():Snapshot{return {formatVersion:1,results:this.results.map(r=>({...r})),settings:{...this.settings}};}
 restoreSnapshot(candidate:unknown){const snapshot=validateSnapshot(candidate),game=applyRules(this.state,snapshot.settings);this.settingsTransaction.commit(snapshot.settings,SETTING_KEYS,settings=>{this.state=game;this.settings=settings;this.results=snapshot.results;});}
 settings:Settings={...DEFAULT_SETTINGS};
 private settingsTransaction=new SettingsTransaction();
 get persistenceBlocked(){return this.settingsTransaction.blocked;}
 changeSettings(candidate:unknown,keys?:readonly SettingsKey[]){
  if(this.fileOperation==='restore')throw new Error('Restore is in progress.');
  commitSettings(candidate,s=>this.settingsTransaction.commit(s,keys??SETTING_KEYS.filter(k=>s[k]!==this.settings[k]),next=>{this.state=applyRules(this.state,next);this.settings=next;}));
 }
 initializePreferences(port:Preferences):string[]{
  const warnings:string[]=[];let cookies:RawCookies={};try{cookies=port.readCookies();}catch{warnings.push('Saved settings could not be read from this browser.');}
  const resolved=resolveSettings(port.readURL(),cookies);this.changeSettings(resolved.settings);this.settingsTransaction=new SettingsTransaction(port);
  try{this.settingsTransaction.commit(resolved.settings,resolved.explicit,s=>{this.state=applyRules(this.state,s);this.settings=s;},false);}catch(error){warnings.push(error instanceof Error?error.message:'Saved settings are unavailable.');}
  return [...resolved.warnings,...warnings];
 }
 constructor(private seed:()=>number,private resetClock=()=>{},private identity={id:newResultID,utc:utcTimestamp}){}
 private recorded=false;
 private recordCompletion(){if(this.state.status==='gameover'&&this.state.completion>0&&!this.recorded){this.results=recordResult(this.results,{id:this.identity.id(),score:this.state.score,timestamp:this.identity.utc()});this.recorded=true;}}
 command(command:Command){
  if(this.fileOperation==='restore')return;
  try{
  if(command==='start'){this.recordCompletion();this.recorded=false;this.state=applyRules(startGame(this.seed()),this.settings);this.resetClock();return;}
  if(command==='pause'){this.state=togglePause(this.state);if(this.state.status==='running')this.resetClock();return;}
  if(command==='penetrator'){this.state=activate(this.state);return;}
  if(command==='drop'){this.state=hardDrop(this.state);return;}
  if(command==='hold'){this.state=hold(this.state);return;}
  this.state=command==='left'?move(this.state,-1,0):command==='right'?move(this.state,1,0):command==='down'?softDrop(this.state):rotate(this.state,command==='cw'?1:-1);
  }finally{this.recordCompletion();}
 }
 tick(ms:number){this.state=advance(this.state,ms);this.recordCompletion();}
 pause(){if(this.state.status==='running')this.state=togglePause(this.state);}
}
