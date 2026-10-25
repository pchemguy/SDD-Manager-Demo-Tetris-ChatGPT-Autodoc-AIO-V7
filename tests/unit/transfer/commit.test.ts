import {it,expect} from 'vitest';
import {Controller} from '../../../src/app/controller';
import {DEFAULT_SETTINGS,SETTING_KEYS} from '../../../src/app/settings';
import type {Preferences,RawCookies} from '../../../src/platform/preferences';
const result={id:'00000000-0000-4000-8000-000000000001',score:0,timestamp:'2026-10-25T12:34:56.789Z'};
const payload=()=>({formatVersion:1,results:[result],settings:{...DEFAULT_SETTINGS,ghost:'show',hold:false}});
function setup(fail=0){let url='https://game.test/?u=a%20b#fragment',cookies:RawCookies={hold:'on'},writes=0;const originalURL=url,originalCookies={...cookies};const port:Preferences={readURL:()=>url,readCookies:()=>({...cookies}),writeCookie:(key,value)=>{if(++writes===fail)throw Error('denied');if(value===undefined)delete cookies[key];else cookies[key]=value;},replaceURL:value=>{if(++writes===fail)throw Error('denied');url=value;}};const c=new Controller(()=>1);c.initializePreferences(port);c.command('start');c.pause();c.state={...c.state,score:123,bonuses:2};return {c,originalURL,originalCookies,get url(){return url;},get cookies(){return cookies;},get writes(){return writes;}};}
it('replaces history/settings together, writes all defaults and preserves paused gameplay',()=>{
 const m=setup(),game=m.c.state;m.c.restoreSnapshot(payload());expect(m.c.results).toEqual([result]);expect(m.c.settings.hold).toBe(false);expect(m.c.state).toMatchObject({status:'paused',score:123,bonuses:2});expect(m.c.state.board).toBe(game.board);expect(m.c.state.active).toEqual(game.active);for(const key of SETTING_KEYS){expect(m.cookies[key]).toBeDefined();expect(new URL(m.url).searchParams.has(key)).toBe(true);}expect(new URL(m.url).hash).toBe('#fragment');m.c.restoreSnapshot({...payload(),results:[]});expect(m.c.results).toEqual([]);
});
it('rejects every candidate as a whole before changing results, settings, cookies or URL',()=>{
 const m=setup(),before=m.c.snapshot(),game=m.c.state;for(const bad of [{...payload(),settings:{...DEFAULT_SETTINGS,hold:'on'}},{...payload(),results:[...Array.from({length:9},(_,i)=>({...result,id:result.id.slice(0,-1)+i})),{...result,timestamp:'bad'}]}]){expect(()=>m.c.restoreSnapshot(bad)).toThrow();expect(m.c.snapshot()).toEqual(before);expect(m.c.state).toBe(game);expect(m.writes).toBe(0);expect(m.url).toBe(m.originalURL);expect(m.cookies).toEqual(m.originalCookies);}
});
it('preserves every application component on each failed persistence step',()=>{
 for(let fail=1;fail<=7;fail++){const m=setup(fail),before=m.c.snapshot(),game=m.c.state;expect(()=>m.c.restoreSnapshot(payload())).toThrow();expect(m.c.snapshot()).toEqual(before);expect(m.c.state).toBe(game);expect(m.url).toBe(m.originalURL);expect(m.cookies).toEqual(m.originalCookies);}
});
it('captures immutable Save values and blocks restart/resume/settings while Restore is pending',()=>{
 const m=setup(),saved=m.c.snapshot();m.c.results.push(result);m.c.settings.ghost='hide';expect(saved.results).toEqual([]);expect(saved.settings.ghost).toBe('dynamic');const game=m.c.state;m.c.fileOperation='restore';m.c.command('start');m.c.command('pause');expect(m.c.state).toBe(game);expect(()=>m.c.changeSettings(DEFAULT_SETTINGS)).toThrow();
});
it('empty Restore after game over does not consume the old completion again and keeps idle/game-over status',()=>{
 const c=new Controller(()=>1);c.restoreSnapshot({...payload(),results:[]});expect(c.state.status).toBe('idle');c.command('start');c.state={...c.state,active:{kind:'O',rotation:0,x:3,y:-1},lockAt:100};c.state.board[1][4]='J';c.tick(100);expect(c.results).toHaveLength(1);c.restoreSnapshot({...payload(),results:[]});expect(c.state.status).toBe('gameover');c.tick(100);c.command('pause');expect(c.results).toEqual([]);
});
