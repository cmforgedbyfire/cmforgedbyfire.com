import {basePlacement} from './basePlacement.ts';
import type {PocketMap,Tower,TowerKind,GameState,BuildPosition} from './types.ts';

// Old browser saves retain their original pad positions. New towers store world coordinates.
export function towerPosition(map:PocketMap,tower:Tower):BuildPosition|undefined{
 if(Number.isFinite(tower.x)&&Number.isFinite(tower.y))return [0,0,tower.x!,tower.y!];
 return map.buildPositions[tower.site];
}
export function placement(map:PocketMap,state:GameState,x:number,y:number,kind:TowerKind){
 const towers=state.towers.flatMap(t=>{const p=towerPosition(map,t);return p?[{...t,col:p[2],row:p[3]}]:[];});
 return basePlacement(map,towers,x,y,kind);
}
