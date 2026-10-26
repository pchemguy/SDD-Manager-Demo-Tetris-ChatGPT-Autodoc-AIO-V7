/** Owns pagehide/pageshow listeners, preserving one animation loop across back-forward-cache restoration. */
type Hooks={pause:()=>void;clear:()=>void;suspend:()=>void;resume:()=>void;dispose:()=>void};
export function bindPageLifecycle(target:EventTarget,hooks:Hooks){
 let suspended=false;
 const hide=(event:Event)=>{hooks.suspend();if((event as PageTransitionEvent).persisted){hooks.pause();hooks.clear();suspended=true;}else hooks.dispose();};
 const show=(event:Event)=>{if((event as PageTransitionEvent).persisted&&suspended){suspended=false;hooks.resume();}};
 target.addEventListener('pagehide',hide);target.addEventListener('pageshow',show);
 return ()=>{target.removeEventListener('pagehide',hide);target.removeEventListener('pageshow',show);};
}
