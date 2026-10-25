/** Canonical six-setting catalogue, defaults and strict native/wire value validation. */
import {DEFAULT_RULES} from '../domain/types';
export const DESCRIPTORS={
 ghost:{label:'Ghost visibility',values:['hide','dynamic','show'],default:'dynamic',labels:['Always hide','Hide above midline','Always show']},
 hardDrop:{label:'Hard drop',values:[true,false],default:DEFAULT_RULES.hardDrop,labels:['On','Off']},
 nextPreview:{label:'Next-piece preview',values:[true,false],default:true,labels:['On','Off']},
 hardDropLock:{label:'Hard-drop locking',values:['follow','immediate'],default:DEFAULT_RULES.hardDropLock,labels:['General locking policy','Immediately']},
 lockPolicy:{label:'General locking',values:['failedDown','interval'],default:DEFAULT_RULES.lockPolicy,labels:['On failed downward attempt','Full gravity interval']},
 hold:{label:'Hold piece',values:[true,false],default:DEFAULT_RULES.hold,labels:['On','Off']}
} as const;
export type SettingsKey=keyof typeof DESCRIPTORS;
export type Settings={[K in SettingsKey]:typeof DESCRIPTORS[K]['values'][number]};
export const SETTING_KEYS=Object.keys(DESCRIPTORS) as SettingsKey[];
export const DEFAULT_SETTINGS=Object.fromEntries(SETTING_KEYS.map(k=>[k,DESCRIPTORS[k].default])) as Settings;
export function validateSettings(value:unknown):value is Settings{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const record=value as Record<string,unknown>;
 return Object.keys(record).length===SETTING_KEYS.length&&SETTING_KEYS.every(k=>Object.hasOwn(record,k)&&(DESCRIPTORS[k].values as readonly unknown[]).includes(record[k]));
}
export function wire(value:Settings[SettingsKey]):string{return typeof value==='boolean'?(value?'on':'off'):value;}
export function decodeSetting(key:SettingsKey,value:string):Settings[SettingsKey]|undefined{return (DESCRIPTORS[key].values as readonly Settings[SettingsKey][]).find(v=>wire(v)===value);}
