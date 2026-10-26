/** Browser monotonic time and cryptographic seeds; game rules receive these values through explicit inputs. */
export const monotonic=()=>performance.now();
export const freshSeed=()=>crypto.getRandomValues(new Uint32Array(1))[0]||1;
