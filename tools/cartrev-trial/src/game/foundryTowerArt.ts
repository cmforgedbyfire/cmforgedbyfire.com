// The Pocket Foundry uses the same registered, top-down tower artwork as the
// current Windows Foundry. Bases stay fixed while every weapon head rotates.
export function foundryTowerImage(
  kind:string,
  level:number,
  part:'base'|'head'|'complete'='complete',
){
  const tier=Math.max(1,Math.min(3,level));
  return `./towers/foundry-v3/${part}/${kind}-${tier}.png`;
}

export const towerRotationOffset=(_kind:string)=>0;
export const towerVisualScale=(_kind:string,_level:number)=>1;
