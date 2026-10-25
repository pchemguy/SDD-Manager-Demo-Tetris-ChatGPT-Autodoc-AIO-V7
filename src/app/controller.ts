import {DEFAULT_SETTINGS,type Settings} from './settings';
import {commitSettings} from './settings-transaction';
import {createGame,startGame,advance,move,rotate,softDrop,togglePause,hold,hardDrop,activate,applyRules} from '../domain/game';
import type {Game} from '../domain/types';
export type Command='left'|'right'|'down'|'cw'|'ccw'|'pause'|'start'|'hold'|'drop'|'penetrator';
export class Controller {
 state:Game=createGame();
 settings:Settings={...DEFAULT_SETTINGS};
 changeSettings(candidate:unknown){commitSettings(candidate,s=>{this.state=applyRules(this.state,s);this.settings=s;});}
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
