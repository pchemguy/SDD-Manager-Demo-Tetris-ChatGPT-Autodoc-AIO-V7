/** Canvas presentation; all terminal positions come from the domain projector. */
import type {Game,Kind} from '../domain/types';
import {destination,ghostVisible} from '../domain/projection';
import {cells} from '../domain/geometry';
export const COLORS:Record<Kind,string>={I:'#55d6df',J:'#668bff',L:'#f5a56a',O:'#edcd70',S:'#77cba5',T:'#b09bea',Z:'#ed829c'};
export const CELL=28;
export function paint(canvas:HTMLCanvasElement,g:Game){
 const ratio=window.devicePixelRatio||1;
 const width=Math.round(280*ratio),height=Math.round(560*ratio);
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 const c=canvas.getContext('2d')!;c.setTransform(width/280,0,0,height/560,0,0);
 c.fillStyle='#0b111d';c.fillRect(0,0,280,560);c.strokeStyle='#192132';c.lineWidth=0.5;
 for(let x=0;x<=10;x++){c.beginPath();c.moveTo(x*CELL,0);c.lineTo(x*CELL,560);c.stroke();}
 for(let y=0;y<=20;y++){c.beginPath();c.moveTo(0,y*CELL);c.lineTo(280,y*CELL);c.stroke();}
 const block=(x:number,y:number,kind:Kind,white=false)=>{if(y<0)return;c.fillStyle=white?'#ffffff':COLORS[kind];c.beginPath();c.roundRect(x*CELL+1,y*CELL+1,CELL-2,CELL-2,4);c.fill();c.fillStyle='#ffffff25';c.fillRect(x*CELL+5,y*CELL+4,CELL-10,2);};
 g.board.forEach((row,y)=>row.forEach((kind,x)=>{if(kind)block(x,y,kind);}));
 if(g.active){const target=destination(g.board,g.active,g.penetrating);if(target&&ghostVisible(target)){c.strokeStyle=g.penetrating?'#ffffff':COLORS[target.kind];c.lineWidth=2;for(const {x,y} of cells(target)){c.strokeRect(x*CELL+3,y*CELL+3,CELL-6,CELL-6);}}}
 if(g.active)for(const {x,y} of cells(g.active))block(x,y,g.active.kind,g.penetrating);
}
