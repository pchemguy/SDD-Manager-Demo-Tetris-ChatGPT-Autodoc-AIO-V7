import {KINDS} from './types';
export function drawClassic(seed:number){let n=seed||1;n^=n<<13;n^=n>>>17;n^=n<<5;const next=n>>>0;return {seed:next,kind:KINDS[Math.floor(next/4294967296*7)]};}
