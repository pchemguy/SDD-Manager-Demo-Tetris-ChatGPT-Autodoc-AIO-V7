import {KINDS,type Kind} from './types';
export function nextRandom(seed:number){let n=seed||1;n^=n<<13;n^=n>>>17;n^=n<<5;const next=n>>>0;return {seed:next,value:next/4294967296};}
export function drawClassic(seed:number){const n=nextRandom(seed);return {seed:n.seed,kind:KINDS[Math.floor(n.value*7)]};}
export function nextBag(source:{seed:number;bag:Kind[]}){
 let {seed}=source;const bag=[...source.bag];
 if(!bag.length){bag.push(...KINDS);for(let i=bag.length-1;i>0;i--){const n=nextRandom(seed);seed=n.seed;const j=Math.floor(n.value*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}
 return {seed,kind:bag[0],bag:bag.slice(1)};
}
