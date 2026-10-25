import {it,expect} from 'vitest';
import {DEFAULT_SETTINGS,SETTING_KEYS,DESCRIPTORS,wire,resolveSettings} from '../../../src/app/settings';
it('resolves every setting independently from valid URL then cookie then default, retaining explicit defaults',()=>{
 for(const key of SETTING_KEYS){const choice=DESCRIPTORS[key].values.find(v=>v!==DEFAULT_SETTINGS[key])!,cookie={[key]:encodeURIComponent(wire(choice))};
  const url=resolveSettings('https://game.test/?'+key+'='+wire(choice),{});expect(url.settings[key]).toBe(choice);expect(url.sources[key]).toBe('url');expect(url.explicit).toEqual([key]);
  const saved=resolveSettings('https://game.test/?unrelated=kept#anchor',cookie);expect(saved.settings[key]).toBe(choice);expect(saved.sources[key]).toBe('cookie');expect(saved.explicit).toEqual([]);
  const defaults=resolveSettings('https://game.test/',{});expect(defaults.settings[key]).toBe(DEFAULT_SETTINGS[key]);expect(defaults.sources[key]).toBe('default');
  const conflict=resolveSettings('https://game.test/?'+key+'='+wire(DEFAULT_SETTINGS[key]),cookie);expect(conflict.settings[key]).toBe(DEFAULT_SETTINGS[key]);expect(conflict.sources[key]).toBe('url');expect(conflict.explicit).toContain(key);
 }
});
it('invalid, duplicate, empty and differently cased URL values fall back per setting without overwriting cookies',()=>{
 for(const key of SETTING_KEYS){const choice=DESCRIPTORS[key].values.find(v=>v!==DEFAULT_SETTINGS[key])!,cookie={[key]:wire(choice)};
  for(const query of [key+'=',key+'=invalid',key+'=ON',key+'='+wire(choice)+'&'+key+'='+wire(choice)]){const result=resolveSettings('https://game.test/?'+query,cookie);expect(result.settings[key]).toBe(choice);expect(result.sources[key]).toBe('cookie');expect(result.explicit).not.toContain(key);expect(result.warnings.join(' ')).toContain(key);}
  for(const raw of ['%','invalid','']){const result=resolveSettings('https://game.test/',{[key]:raw});expect(result.settings[key]).toBe(DEFAULT_SETTINGS[key]);expect(result.warnings.join(' ')).toContain(key);}
 }
});
it('decodes each source once and never lets one malformed source reset another setting',()=>{
 const r=resolveSettings('https://game.test/?hardDrop=%6f%6e&hold=%256fn&ghost=bad',{hold:'off',nextPreview:'off',ghost:'show'});expect(r.settings).toMatchObject({hardDrop:true,hold:false,nextPreview:false,ghost:'show'});expect(r.explicit).toEqual(['hardDrop']);
});
import {parseManagedCookies,cookieText,urlWithSettings} from '../../../src/platform/preferences';
it('captures raw managed cookie values and serializes HTTPS-aware persistent/deletion attributes',()=>{
 expect(parseManagedCookies('unrelated=kept; tetris_hold=%6fff; tetris_ghost=show; broken')).toEqual({hold:'%6fff',ghost:'show'});
 expect(cookieText('hold','off',true)).toBe('tetris_hold=off; Path=/; SameSite=Lax; Max-Age=31536000; Secure');expect(cookieText('hold',undefined,false)).toBe('tetris_hold=; Path=/; SameSite=Lax; Max-Age=0');
});
it('replaces only selected query keys while retaining unrelated repeated values and fragment',()=>{
 const url=new URL(urlWithSettings('https://game.test/?hardDrop=off&u=one&u=two&hardDrop=off#anchor',DEFAULT_SETTINGS,['hardDrop']));expect(url.searchParams.getAll('hardDrop')).toEqual(['on']);expect(url.searchParams.getAll('u')).toEqual(['one','two']);expect(url.hash).toBe('#anchor');expect(url.searchParams.has('hold')).toBe(false);
});
