import type {PocketRealm,TowerKind} from './types';

export function realmTowerImage(kind:TowerKind,level:number,realm:PocketRealm='foundry',part:'base'|'head'|'complete'='complete'){
 const tier=Math.max(1,Math.min(3,level));
 if(kind==='carson'||kind==='trevour')return part==='head'?`./towers/heroes-v3/head/${kind}-${tier}-front.png`:`./towers/heroes-v3/${part}/${kind}-${tier}.png`;
 if(realm==='medieval')return kind==='monkey'?`./towers/monkey-v2/${part}/monkey-${tier}.png`:`./towers/medieval-v2/${part}/${kind}-${tier}.png`;
 if(realm==='monster')return kind==='monkey'?`./towers/monkey-v2/${part}/monkey-${tier}.png`:`./towers/monster-v2/${part}/${kind}-${tier}.png`;
 if(realm==='space')return kind==='monkey'?`./towers/monkey-v2/${part}/monkey-${tier}.png`:`./towers/space-v2/${part}/${kind}-${tier}.png`;
 return `./towers/foundry-v3/${part}/${kind}-${tier}.png`;
}

const medievalNames:Record<TowerKind,string>={bolt:'Archer Tower',mortar:'Bombard Tower',frost:'Frost Alchemist',sky:'Sky Ballista',carson:'Carson',trevour:'Trevour',storm:'Storm Coil',monkey:'Monkey Launcher'};
const monsterNames:Record<TowerKind,string>={bolt:'Thornfang',mortar:'Spore Bloom',frost:'Rime Wraith',sky:'Storm Eye',carson:'Carson',trevour:'Trevour',storm:'Thunder Totem',monkey:'Monkey Launcher'};
const spaceNames:Record<TowerKind,string>={bolt:'Plasma Repeater',mortar:'Meteor Battery',frost:'Gravity Well',sky:'Ion Lance',carson:'Carson',trevour:'Trevour',storm:'Arc Relay',monkey:'Monkey Launcher'};
export const realmTowerName=(kind:TowerKind,realm:PocketRealm='foundry')=>realm==='medieval'?medievalNames[kind]:realm==='monster'?monsterNames[kind]:realm==='space'?spaceNames[kind]:undefined;
export const realmTowerShortName=(kind:TowerKind,realm:PocketRealm='foundry')=>realm==='medieval'?({bolt:'Archer',mortar:'Bombard',frost:'Alchemist',sky:'Ballista',carson:'Carson',trevour:'Trevour',storm:'Storm',monkey:'Monkey'} as Record<TowerKind,string>)[kind]:realm==='monster'?({bolt:'Thornfang',mortar:'Spore',frost:'Wraith',sky:'Storm Eye',carson:'Carson',trevour:'Trevour',storm:'Totem',monkey:'Monkey'} as Record<TowerKind,string>)[kind]:realm==='space'?({bolt:'Plasma',mortar:'Meteor',frost:'Gravity',sky:'Ion',carson:'Carson',trevour:'Trevour',storm:'Arc',monkey:'Monkey'} as Record<TowerKind,string>)[kind]:undefined;

export function towerHeadPose(kind:TowerKind,aim:number,realm:PocketRealm='foundry'){
 if(kind==='carson'||kind==='trevour')return {flipY:false,rotation:0};
 const flipY=kind==='monkey'&&realm!=='foundry'&&Math.cos(aim)<-1e-9;
 const offset=kind==='monkey'&&realm!=='foundry'?Math.PI/6:0;
 return {flipY,rotation:kind==='frost'&&realm!=='foundry'?0:aim+offset*(flipY?-1:1)};
}

export const towerVisualScale=(kind:TowerKind,level:number,realm:PocketRealm='foundry')=>kind==='carson'||kind==='trevour'?1.05:kind==='monkey'&&level>=3&&realm!=='foundry'?1.28:1;
