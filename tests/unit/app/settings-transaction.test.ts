import {it,expect} from 'vitest';
import {SettingsTransaction} from '../../../src/app/settings-transaction';
import {DEFAULT_SETTINGS,SETTING_KEYS,wire} from '../../../src/app/settings';
import type {Preferences,RawCookies} from '../../../src/platform/preferences';
function memory(fail=0,after=false,silent=false,denyRecovery=false){
 let url='https://game.test/?u=a%20b&u=c#fragment',cookies:RawCookies={ghost:'hide',hold:'%6fn'},writes=0;
 const originalURL=url,originalCookies={...cookies};
 const effect=(action:()=>void)=>{writes++;if(writes===fail&&!after){if(silent)return;throw Error('denied');}if(denyRecovery&&writes>fail)throw Error('recovery denied');action();if(writes===fail&&after)throw Error('denied after effect');};
 const port:Preferences={readURL:()=>url,readCookies:()=>({...cookies}),writeCookie:(key,raw)=>effect(()=>{if(raw===undefined)delete cookies[key];else cookies[key]=raw;}),replaceURL:value=>effect(()=>{url=value;})};
 return {port,originalURL,originalCookies,get url(){return url;},get cookies(){return cookies;},get writes(){return writes;}};
}
it('publishes only after selected cookie and URL values are read back',()=>{
 const m=memory(),tx=new SettingsTransaction(m.port);let calls=0;tx.commit({...DEFAULT_SETTINGS,hold:false},['hold'],s=>{calls++;expect(m.cookies.hold).toBe('off');expect(new URL(m.url).searchParams.get('hold')).toBe('off');expect(s.hold).toBe(false);});expect(calls).toBe(1);expect(m.cookies.ghost).toBe('hide');expect(new URL(m.url).searchParams.getAll('u')).toEqual(['a b','c']);expect(new URL(m.url).hash).toBe('#fragment');expect(new URL(m.url).searchParams.has('ghost')).toBe(false);
});
it('rolls back exact raw cookies and URL for failure before/after each of seven writes',()=>{
 for(const after of [false,true])for(let fail=1;fail<=7;fail++){const m=memory(fail,after),tx=new SettingsTransaction(m.port);let calls=0;expect(()=>tx.commit(DEFAULT_SETTINGS,SETTING_KEYS,()=>calls++)).toThrow();expect(calls).toBe(0);expect(m.cookies).toEqual(m.originalCookies);expect(m.url).toBe(m.originalURL);expect(tx.blocked).toBe(false);}
});
it('detects silent cookie/history refusal instead of reporting success',()=>{
 for(const fail of [1,7]){const m=memory(fail,false,true),tx=new SettingsTransaction(m.port);let calls=0;expect(()=>tx.commit(DEFAULT_SETTINGS,SETTING_KEYS,()=>calls++)).toThrow();expect(calls).toBe(0);expect(m.cookies).toEqual(m.originalCookies);expect(m.url).toBe(m.originalURL);}
});
it('reports incomplete recovery and blocks further competing writes',()=>{
 const m=memory(7,true,false,true),tx=new SettingsTransaction(m.port);let calls=0;expect(()=>tx.commit(DEFAULT_SETTINGS,SETTING_KEYS,()=>calls++)).toThrow(/recovery is incomplete/i);expect(tx.blocked).toBe(true);const writes=m.writes;expect(()=>tx.commit(DEFAULT_SETTINGS,SETTING_KEYS,()=>calls++)).toThrow();expect(m.writes).toBe(writes);expect(calls).toBe(0);
});
it('validates all values before effects and writes explicit defaults without filling absent URL keys at startup',()=>{
 const m=memory(),tx=new SettingsTransaction(m.port);expect(()=>tx.commit({...DEFAULT_SETTINGS,hold:'off'},SETTING_KEYS,()=>{})).toThrow();expect(m.writes).toBe(0);tx.commit(DEFAULT_SETTINGS,['hold'],()=>{},false);expect(m.cookies.hold).toBe(wire(DEFAULT_SETTINGS.hold));expect(m.url).toBe(m.originalURL);expect(m.cookies.ghost).toBe('hide');
});

import {Controller} from '../../../src/app/controller';
it('controller startup saves explicit defaults, retains omitted cookie settings and publishes failures only as errors',()=>{
 const m=memory();
 const custom={...m.port,readURL:()=> 'https://game.test/?hold=on&hardDrop=off#fragment'};const c=new Controller(()=>1);expect(c.initializePreferences(custom)).toEqual([]);expect(c.settings).toMatchObject({hold:true,hardDrop:false,ghost:'hide'});expect(m.cookies.hold).toBe('on');expect(m.cookies.hardDrop).toBe('off');expect(m.cookies.ghost).toBe('hide');expect(m.url).toBe(m.originalURL);
 const fail=memory(1),d=new Controller(()=>1);expect(d.initializePreferences({...fail.port,readURL:()=> 'https://game.test/?hold=off'}).join(' ')).toMatch(/not changed|refused/);expect(d.settings.hold).toBe(false); // Initial resolution remains playable; persistence failed.
});
it('rejects interleaving and releases its lock after recoverable failure',()=>{
 const m=memory(1),tx=new SettingsTransaction(m.port);expect(()=>tx.commit(DEFAULT_SETTINGS,SETTING_KEYS,()=>{})).toThrow();expect(()=>tx.commit(DEFAULT_SETTINGS,SETTING_KEYS,()=>{})).not.toThrow();
 const raw=memory();let t:SettingsTransaction,checked=false;const port={...raw.port,writeCookie:(key:any,value:any)=>{expect(()=>t.commit(DEFAULT_SETTINGS,[],()=>{})).toThrow(/in progress/);checked=true;raw.port.writeCookie(key,value);}};t=new SettingsTransaction(port);t.commit(DEFAULT_SETTINGS,['ghost'],()=>{});expect(checked).toBe(true);
});
it('failed controller change leaves effective values and the complete game state untouched',()=>{
 const m=memory(1),c=new Controller(()=>1);c.initializePreferences(m.port);c.command('start');c.state={...c.state,active:{kind:'O',rotation:0,x:3,y:18},lockAt:1000,status:'paused'};const game=c.state,settings=c.settings;
 expect(()=>c.changeSettings({...c.settings,hold:false},['hold'])).toThrow();expect(c.state).toBe(game);expect(c.settings).toBe(settings);expect(m.cookies).toEqual(m.originalCookies);expect(m.url).toBe(m.originalURL);
});
