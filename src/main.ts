const canvas=document.querySelector('canvas')!;
const ctx=canvas.getContext('2d')!;
ctx.fillStyle='#e84c55';ctx.fillRect(0,0,20,20);ctx.fillStyle='#142e42';ctx.font='18px sans-serif';ctx.fillText('Browser ready',0,55);
document.querySelector('#probe')!.addEventListener('click',e=>{(e.currentTarget as HTMLElement).textContent='Input received';});
