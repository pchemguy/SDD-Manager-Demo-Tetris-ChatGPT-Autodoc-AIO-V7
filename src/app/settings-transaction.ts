/** Single validated settings publication boundary; browser persistence is supplied in a later increment. */
import {validateSettings,type Settings} from './settings';
export function commitSettings(candidate:unknown,publish:(settings:Settings)=>void):void{if(!validateSettings(candidate))throw new Error('Invalid game settings');publish({...candidate});}
