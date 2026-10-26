/** Deterministic contract regressions for settings. */
import {it,expect} from 'vitest';
import {startGame,applyRules,hardDrop,hold,softDrop,advance} from '../../../src/domain/game';
it('follows failed-down policy only on a failed attempt, including gravity',()=>{
 const g=applyRules(startGame(),{hardDrop:true,hold:true,hardDropLock:'follow',lockPolicy:'failedDown'}),drop=hardDrop(g);expect(drop.pieceSerial).toBe(g.pieceSerial);expect(drop.lockAt).toBe(null);expect(softDrop(drop).pieceSerial).toBe(g.pieceSerial+1);
 let t=drop;for(let i=0;i<4;i++)t=advance(t,250);expect(t.pieceSerial).toBe(g.pieceSerial+1);
});
it('immediate drop locks even at zero distance; disabled actions preserve state',()=>{
 const g={...startGame(),active:{kind:'O' as const,rotation:0 as const,x:3,y:18},lockAt:1000};const rules={hardDrop:true,hold:true,hardDropLock:'immediate',lockPolicy:'interval'} as const;expect(hardDrop(applyRules(g,rules)).pieceSerial).toBe(g.pieceSerial+1);
 const disabled=applyRules(g,{...rules,hardDrop:false,hold:false});expect(hardDrop(disabled)).toBe(disabled);expect(hold(disabled)).toBe(disabled);
});
it('only changed general policy resets grounded timing, including while paused',()=>{
 const g={...startGame(),active:{kind:'O' as const,rotation:0 as const,x:3,y:18},time:300,lockAt:1000,status:'paused' as const,bonuses:2,penetrating:true};const rules={hardDrop:true,hold:true,hardDropLock:'follow',lockPolicy:'interval'} as const;expect(applyRules(g,rules).lockAt).toBe(1000);
 const failed=applyRules(g,{...rules,lockPolicy:'failedDown'});expect(failed.lockAt).toBe(null);const interval=applyRules({...failed,time:400},rules);expect(interval.lockAt).toBe(1400);expect(interval.status).toBe('paused');expect(interval.penetrating).toBe(true);expect(interval.bonuses).toBe(2);expect(interval.active).toEqual(g.active);
 expect(applyRules({...failed,active:{...g.active,y:5}},rules).lockAt).toBe(null);
});
import {SETTING_KEYS,DEFAULT_SETTINGS,decodeSetting,wire,validateSettings,DESCRIPTORS} from '../../../src/app/settings';
it('validates exact six native domains and canonical wire values',()=>{
 expect(SETTING_KEYS).toHaveLength(6);expect(validateSettings(DEFAULT_SETTINGS)).toBe(true);expect(DEFAULT_SETTINGS).toEqual({ghost:'dynamic',hardDrop:true,nextPreview:true,hardDropLock:'follow',lockPolicy:'interval',hold:true});
 for(const key of SETTING_KEYS){for(const value of DESCRIPTORS[key].values)expect(decodeSetting(key,wire(value))).toBe(value);expect(decodeSetting(key,'')).toBeUndefined();expect(decodeSetting(key,'ON')).toBeUndefined();expect(validateSettings({...DEFAULT_SETTINGS,[key]:null})).toBe(false);}
 expect(validateSettings({...DEFAULT_SETTINGS,extra:true})).toBe(false);expect(validateSettings({})).toBe(false);expect(validateSettings(null)).toBe(false);
});
import {commitSettings} from '../../../src/app/settings-transaction';
import {Controller} from '../../../src/app/controller';
it('publishes complete valid settings once and rejects invalid content without mutation',()=>{
 let value={...DEFAULT_SETTINGS},calls=0;commitSettings({...DEFAULT_SETTINGS,hold:false},s=>{value=s;calls++;});expect(value.hold).toBe(false);expect(calls).toBe(1);expect(()=>commitSettings({...DEFAULT_SETTINGS,hold:'off'},s=>{value=s;calls++;})).toThrow();expect(calls).toBe(1);
});

it('retains live settings across restarts without consuming hidden previews',()=>{const c=new Controller(()=>1);c.changeSettings({...DEFAULT_SETTINGS,hardDrop:false,hold:false,nextPreview:false,ghost:'hide'});c.command('start');const before=c.state;c.command('drop');expect(c.state).toBe(before);c.command('hold');expect(c.state).toBe(before);c.command('start');expect(c.settings.nextPreview).toBe(false);expect(c.state.rules.hold).toBe(false);expect(c.state.queue).toEqual(before.queue);expect(()=>c.changeSettings({})).toThrow();expect(c.settings.hardDrop).toBe(false);});
it('does not retroactively lock a dropped piece and preserves held state on disabled/re-enabled Hold',()=>{
 const g={...hardDrop(startGame()),held:'I' as const,holdUsed:true};const before=g.active;
 const changed=applyRules(g,{...g.rules,hardDropLock:'immediate',hold:false});expect(changed.active).toBe(before);expect(changed.lockAt).toBe(g.lockAt);expect(changed.pieceSerial).toBe(g.pieceSerial);const enabled=applyRules(changed,{...changed.rules,hold:true});expect(hold(enabled)).toBe(enabled);expect(enabled.held).toBe('I');
 const pen=applyRules({...g,penetrating:true},{...g.rules,hardDropLock:'immediate'});expect(hardDrop(pen).penetrating).toBe(false);
});
