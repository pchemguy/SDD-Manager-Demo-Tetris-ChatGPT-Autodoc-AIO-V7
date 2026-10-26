/** Versioned portable snapshot values; active gameplay and panel state are deliberately excluded. */
import type {Result} from '../app/leaderboard';
import type {Settings} from '../app/settings';
export type Snapshot={formatVersion:1;results:Result[];settings:Settings};
export const JSON_LIMIT=1024*1024,SQLITE_LIMIT=5*1024*1024;
export class TransferError extends Error{}
