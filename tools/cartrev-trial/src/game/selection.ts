import {towerPosition} from './placement.ts';
import type {GameState,PocketMap} from './types.ts';
export type BattlefieldTarget={kind:'tower';id:number};
export function pickBattlefieldTarget(map:PocketMap,state:GameState,x:number,y:number,_includeOpenSites=false):BattlefieldTarget|null{
 const candidates=state.towers.flatMap(t=>{const p=towerPosition(map,t);return p?[{id:t.id,distance:Math.hypot(x-p[2],y-p[3])}]:[];}).sort((a,b)=>a.distance-b.distance);
 return candidates[0]?.distance<=34?{kind:'tower',id:candidates[0].id}:null;
}
