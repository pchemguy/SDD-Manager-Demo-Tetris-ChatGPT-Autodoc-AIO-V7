import type {Status} from '../domain/types';
export const statusText:Record<Status,string>={idle:'Ready',running:'Running',paused:'Paused',gameover:'Game over'};
export const formatScore=(value:number)=>String(value).padStart(6,'0');
