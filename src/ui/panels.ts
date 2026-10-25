import type {Game} from '../domain/types';
import {shape} from '../domain/geometry';
import {COLORS} from './board';
import type {Kind} from '../domain/types';
import {formatScore,statusText} from '../app/view-model';
export function createPanels(){
 document.querySelector('#app')!.innerHTML=`
 <header class="topbar"><a class="brand" href="./" aria-label="Tetris home"><span class="brand-mark"><i></i><i></i><i></i><i></i></span>TETRIS<span class="brand-note">THE QUIET CHALLENGE</span></a><span class="edition"><span class="tiny-dot"></span> MODERN · SOLO PLAY</span></header>
 <main class="arena">
 <section class="panel info-panel" aria-label="Game information"><p class="eyebrow">YOUR RUN</p><h1 class="score" data-testid="score">000000</h1><p class="score-caption">POINTS</p><div class="metrics"><div><span>LEVEL</span><strong data-testid="level">01</strong></div><div><span>LINES</span><strong data-testid="lines">00</strong></div></div><div class="panel-rule"></div><div id="feature-info"></div><div class="bonus-row"><span>PENETRATOR · V</span><strong data-testid="bonuses" aria-label="Available penetrator bonuses">—</strong></div><div id="panel-toggles"></div><button class="button secondary" id="pause" disabled>Pause</button><button class="button primary" id="start">Start game</button><p class="session-note">A little focus.<br>A better next move.</p></section>
 <section class="board-panel" aria-label="Playfield"><div class="board-top"><span><span class="tiny-dot"></span> <span data-testid="status" id="status" aria-live="polite">Ready</span></span><span>10 × 20</span></div><div class="board-wrap"><canvas id="board" tabindex="0" role="img" aria-label="Tetris playfield, 10 columns by 20 rows"></canvas><div id="overlay" class="overlay"><div><p class="eyebrow">MAKE ROOM FOR WHAT’S NEXT</p><h2 id="overlay-title">Find your flow.</h2><p id="overlay-copy">Start a game and make every piece count.</p></div></div></div><div class="board-bottom"><span>SEVEN-BAG · SRS</span><span class="live-mark">●</span></div></section>
 <section class="panel help-panel" id="help" aria-label="Controls and help"><p class="eyebrow">AT YOUR FINGERTIPS</p><h2>How to play</h2><div class="key-row"><span>Move</span><div><kbd>←</kbd><kbd>→</kbd></div></div><div class="key-row"><span>Soft drop</span><kbd>↓</kbd></div><div class="key-row"><span>Rotate</span><div><kbd>↑</kbd><kbd>X</kbd><kbd>Z</kbd></div></div><div id="feature-help"><div class="key-row"><span>Hold</span><kbd>C</kbd></div><div class="key-row"><span>Hard drop</span><kbd>SPACE</kbd></div></div><div class="key-row"><span>Penetrator</span><kbd>V</kbd></div><div class="key-row"><span>Pause</span><kbd>P</kbd></div><div class="key-row"><span>Restart</span><kbd>R</kbd></div><div class="panel-rule"></div><p class="help-copy">Complete a horizontal line to clear it. Keep the stack low and leave yourself room to move.</p><div class="tip"><span>GOOD TO KNOW</span><p>Four lines at once earn ⚡ (up to 3). Press V to pass through blocks until lock. Pieces wait a full gravity interval before locking.</p></div></section>
 </main><footer class="footer"><span>NO RUSH. JUST RHYTHM.</span><span>BUILT FOR YOUR NEXT PERSONAL BEST.</span></footer><div id="message" role="status" aria-live="polite"></div>`;
 return {canvas:document.querySelector<HTMLCanvasElement>('#board')!,start:document.querySelector<HTMLButtonElement>('#start')!,pause:document.querySelector<HTMLButtonElement>('#pause')!};
}
export const setText=(selector:string,value:string)=>{const el=document.querySelector(selector)!;if(el.textContent!==value)el.textContent=value;};
function mini(kind:Kind|undefined|null){return kind?`<div class="mini-piece" aria-hidden="true">${shape(kind,0).map(c=>`<i style="left:${c.x*10}px;top:${c.y*10}px;background:${COLORS[kind]}"></i>`).join('')}</div>`:'<div class="mini-piece empty-mini" aria-hidden="true">—</div>';}
export function renderPanels(g:Game){
 const info=document.querySelector<HTMLElement>('#feature-info')!,key=`${g.held}|${g.queue[0]}`;
 if(info.dataset.preview!==key){info.dataset.preview=key;info.innerHTML=`<div class="previews"><div><span class="eyebrow">HOLD · C</span>${mini(g.held)}<span class="kind-label" data-testid="held-kind">${g.held??'—'}</span></div><div><span class="eyebrow">NEXT</span>${mini(g.queue[0])}<span class="kind-label" data-testid="next-kind">${g.queue[0]??'—'}</span></div></div>`;}

 setText('[data-testid=bonuses]','⚡'.repeat(g.bonuses)||'—');
 setText('[data-testid=score]',formatScore(g.score));setText('[data-testid=level]',String(g.level).padStart(2,'0'));setText('[data-testid=lines]',String(g.lines).padStart(2,'0'));setText('#status',statusText[g.status]);
 const score=document.querySelector<HTMLElement>('.score')!;score.style.fontSize=g.score>99999999?'22px':'42px';
 const pause=document.querySelector<HTMLButtonElement>('#pause')!;pause.disabled=g.status==='idle'||g.status==='gameover';setText('#pause',g.status==='paused'?'Resume':'Pause');
 setText('#start',g.status==='idle'?'Start game':'Restart');
 const overlay=document.querySelector<HTMLElement>('#overlay')!;overlay.hidden=g.status==='running';
 setText('#overlay-title',g.status==='paused'?'Take a breath.':g.status==='gameover'?'One more round?':'Find your flow.');
 setText('#overlay-copy',g.status==='paused'?'Your game is right where you left it.':g.status==='gameover'?'A fresh board. A fresh possibility.':'Start a game and make every piece count.');
}
