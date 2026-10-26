/** Pure tetromino cell geometry, pivot rotation and translation into board coordinates. */
import type {Kind,Point,Piece,Rotation} from './types';
const INITIAL:Record<Kind,[number,number][]>={
 I:[[0,1],[1,1],[2,1],[3,1]],J:[[0,0],[0,1],[1,1],[2,1]],L:[[2,0],[0,1],[1,1],[2,1]],O:[[1,0],[2,0],[1,1],[2,1]],S:[[1,0],[2,0],[0,1],[1,1]],T:[[1,0],[0,1],[1,1],[2,1]],Z:[[0,0],[1,0],[1,1],[2,1]]
};
export function shape(kind:Kind,rotation:Rotation):Point[]{
 let points=INITIAL[kind].map(([x,y])=>({x,y}));const pivot=kind==='I'?1.5:1;
 if(kind!=='O')for(let i=0;i<rotation;i++)points=points.map(({x,y})=>({x:pivot-(y-pivot),y:pivot+(x-pivot)}));
 return points;
}
export function cells(p:Piece):Point[]{return shape(p.kind,p.rotation).map(c=>({x:c.x+p.x,y:c.y+p.y}));}
export function piece(kind:Kind):Piece{return {kind,rotation:0,x:3,y:-1};}
