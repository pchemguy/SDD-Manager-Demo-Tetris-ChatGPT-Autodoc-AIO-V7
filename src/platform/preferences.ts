/** Browser effects for managed cookie values and URL replacement; no game-state ownership. */
import {SETTING_KEYS,wire,type Settings,type SettingsKey} from '../app/settings';
export type RawCookies=Partial<Record<SettingsKey,string>>;
export interface Preferences{readCookies():RawCookies;readURL():string;writeCookie(key:SettingsKey,raw:string|undefined):void;replaceURL(url:string):void;}
export function parseManagedCookies(text:string):RawCookies{
 const result:RawCookies={};for(const part of text.split(';')){const equal=part.indexOf('=');if(equal<0)continue;const name=part.slice(0,equal).trim(),key=SETTING_KEYS.find(k=>name==='tetris_'+k);if(key&&!Object.hasOwn(result,key))result[key]=part.slice(equal+1);}
 return result;
}
export function cookieText(key:SettingsKey,raw:string|undefined,secure:boolean):string{return `${encodeURIComponent('tetris_'+key)}=${raw??''}; Path=/; SameSite=Lax; Max-Age=${raw===undefined?0:31536000}${secure?'; Secure':''}`;}
export function urlWithSettings(url:string,settings:Settings,keys:readonly SettingsKey[]):string{const next=new URL(url);for(const key of keys)next.searchParams.set(key,wire(settings[key]));return next.href;}
export function browserPreferences(doc=document,location=window.location,history=window.history):Preferences{return {
 readCookies:()=>parseManagedCookies(doc.cookie),readURL:()=>location.href,
 writeCookie:(key,raw)=>{doc.cookie=cookieText(key,raw,location.protocol==='https:');},
 replaceURL:url=>history.replaceState(history.state,'',url)
};}
