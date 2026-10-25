export const KINDS=['I','J','L','O','S','T','Z'] as const;
export type Kind=typeof KINDS[number];
export type Rotation=0|1|2|3;
export type Point={x:number;y:number};
export type Piece={kind:Kind;rotation:Rotation;x:number;y:number};
export type Board=(Kind|null)[][];
export type Status='idle'|'running'|'paused'|'gameover';
export type Game={board:Board;active:Piece|null;status:Status;seed:number;pieceSerial:number;score:number;lines:number;level:number;time:number;gravityAt:number;lockAt:number|null;completion:number;bag:Kind[];queue:Kind[];held:Kind|null;holdUsed:boolean;bonuses:number;penetrating:boolean};
