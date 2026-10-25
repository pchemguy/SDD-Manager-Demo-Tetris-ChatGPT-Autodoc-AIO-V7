export const monotonic=()=>performance.now();
export const freshSeed=()=>crypto.getRandomValues(new Uint32Array(1))[0]||1;
