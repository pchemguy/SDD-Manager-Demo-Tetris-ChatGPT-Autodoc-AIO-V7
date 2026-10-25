/** Repeatable nonzero xorshift source and rejection-sampled Fisher–Yates bags. */
import {KINDS,type Kind} from './types';
export function nextRandom(seed:number){let n=seed||1;n^=n<<13;n^=n>>>17;n^=n<<5;const next=n>>>0;return {seed:next,value:next/4294967296};}
export function drawClassic(seed:number){const n=nextRandom(seed);return {seed:n.seed,kind:KINDS[Math.floor(n.value*7)]};}
export function nextBag(source:{seed:number;bag:Kind[]}){
 let {seed}=source;const bag=[...source.bag];
 if(!bag.length){bag.push(...KINDS);for(let i=bag.length-1;i>0;i--){const n=uniformIndex(seed,i+1);seed=n.seed;const j=n.index;[bag[i],bag[j]]=[bag[j],bag[i]];}}
 return {seed,kind:bag[0],bag:bag.slice(1)};
}
/** Sample the nonzero xorshift state space without a short-range bias. */
export function uniformIndex(seed:number,size:number){
 if(!Number.isInteger(size)||size<1||size>4294967295)throw new RangeError('Invalid random range');
 const limit=Math.floor(4294967295/size)*size;let n;
 do{n=nextRandom(seed);seed=n.seed;}while(n.seed-1>=limit);
 return {seed:n.seed,index:(n.seed-1)%size};
}
