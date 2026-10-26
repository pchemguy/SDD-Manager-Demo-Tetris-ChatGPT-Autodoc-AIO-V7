/** Both formats feed the same canonical validator and atomic application commit. */
import type {Codecs} from '../app/transfer';
import {encodeJSON,decodeJSON} from './json';
import {sqliteOperation} from './sqlite-host';
export const portableCodecs:Codecs={
 encode:async(snapshot,format,signal)=>format==='json'?encodeJSON(snapshot):sqliteOperation({kind:'encode',snapshot},signal),
 decode:async(bytes,format,signal)=>format==='json'?decodeJSON(bytes):decodeJSON(await sqliteOperation({kind:'decode',bytes},signal))
};
