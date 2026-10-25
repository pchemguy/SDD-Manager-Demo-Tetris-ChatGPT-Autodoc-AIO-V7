/** Validate, persist/read back, then publish settings; recover captured external state on failure. */
import {validateSettings,SETTING_KEYS,wire,type Settings,type SettingsKey} from './settings';
import {urlWithSettings,type Preferences,type RawCookies} from '../platform/preferences';
export function commitSettings(candidate:unknown,publish:(settings:Settings)=>void):void{if(!validateSettings(candidate))throw new Error('Invalid game settings');publish({...candidate});}
export class PersistenceError extends Error{}
export class SettingsTransaction{
 blocked=false;
 private busy=false;
 constructor(private port?:Preferences){}
 commit(candidate:unknown,keys:readonly SettingsKey[],publish:(settings:Settings)=>void,updateURL=true){
  if(!validateSettings(candidate)||keys.some(k=>!SETTING_KEYS.includes(k)))throw new Error('Invalid game settings');
  if(this.blocked)throw new PersistenceError('Persistence recovery is incomplete. Reload after fixing browser storage/history access.');
  if(this.busy)throw new PersistenceError('Another settings change is in progress.');
  this.busy=true;
  try{
   const settings={...candidate},selected=[...new Set(keys)],port=this.port;
   if(port&&selected.length){
    let cookies:RawCookies,url:string;
    try{cookies=port.readCookies();url=port.readURL();}catch{throw new PersistenceError('Cannot read saved settings; settings were not changed.');}
    const nextURL=updateURL?urlWithSettings(url,settings,selected):url;
    try{
     for(const key of selected){const raw=encodeURIComponent(wire(settings[key]));port.writeCookie(key,raw);if(port.readCookies()[key]!==raw)throw new Error('Cookie refused');}
     if(updateURL){port.replaceURL(nextURL);if(port.readURL()!==nextURL)throw new Error('URL refused');}
     if(selected.some(key=>port.readCookies()[key]!==encodeURIComponent(wire(settings[key])))||port.readURL()!==nextURL)throw new Error('Readback mismatch');
    }catch{
     // Attempt every needed recovery even when one external write is denied.
     try{if(port.readURL()!==url)port.replaceURL(url);}catch{}
     for(const key of SETTING_KEYS)try{if(port.readCookies()[key]!==cookies[key])port.writeCookie(key,cookies[key]);}catch{}
     let recovered=false;try{const current=port.readCookies();recovered=port.readURL()===url&&SETTING_KEYS.every(k=>current[k]===cookies[k]);}catch{}
     this.blocked=!recovered;
     throw new PersistenceError(recovered?'Settings were not changed: browser cookies or history refused the save; prior values restored.':'Settings were not changed, but persistence recovery is incomplete. Reload after fixing browser storage/history access.');
    }
   }
   publish(settings);
  }finally{this.busy=false;}
 }
}
