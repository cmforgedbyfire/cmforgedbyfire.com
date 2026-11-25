export type Point=[number,number];
export type BuildPosition=[number,number,number,number];
export type PocketRealm='foundry'|'medieval'|'monster'|'space';

export type PocketMap={
  id:string;
  name:string;
  realm?:PocketRealm;
  subtitle:string;
  artwork:string;
  difficulty:string;
  waves:number;
  cols:number;
  rows:number;
  width?:number;
  height?:number;
  route:Point[];
  routeJumps?:number[];
  buildCells:Point[];
  buildPositions:BuildPosition[];
  buildSnapRadius?:number;
  freePlacement?:boolean;
  towerSize?:number;
  placementAreas?:Point[][];
  placementExclusions?:Point[][];
  baseFootprints?:Record<string,Point[][]>;
  placementTerrain?:{
    width:number;height:number;roadWidth:number;portalRadius:number;
    route:{x:number;y:number}[];
    roadWidths?:number[];
    roadAreas?:{x:number;y:number}[][];
    scenery:({shape:'circle';x:number;y:number;radius:number}|{shape:'rect';x:number;y:number;width:number;height:number})[];
    bridges?:{supports:{x:number;y:number;radius:number}[];deck:{x:number;y:number}[]}[];
  };
};

export type TowerKind='bolt'|'frost'|'sky'|'mortar'|'carson'|'trevour'|'storm'|'monkey';
export type EnemyKind='crawler'|'runner'|'armored'|'flyer'|'airship'|'boss'|'shielded';
export type RunStatus='planning'|'running'|'won'|'lost';

export type Tower={id:number;kind:TowerKind;site:number;x?:number;y?:number;level:number;cooldown:number;aim?:number};
export type Enemy={id:number;kind:EnemyKind;distance:number;hp:number;maxHp:number;speed:number;reward:number;slow:number;slowTime:number;bossNumber?:1|2;sizeMultiplier?:number};
export type Shot={id:number;kind?:TowerKind;from:Point;to:Point;color:string;life:number;duration?:number;delay?:number};

export type GameState={
  telemetry?:import('./careerStats').Telemetry;
  version:10;
  mapId:string;
  status:RunStatus;
  wave:number;
  health:number;
  cash:number;
  speed:1|2|3;
  placementHintSeen:boolean;
  airWarningSeen:boolean;
  airArrivalWarningSeen:boolean;
  heavyAirWarningSeen:boolean;
  heavyAirArrivalWarningSeen:boolean;
  paused:boolean;
  kills:number;
  airKills:number;
  towersBuilt:number;
  upgrades:number;
  towers:Tower[];
  enemies:Enemy[];
  shots:Shot[];
  spawnQueue:EnemyKind[];
  spawnTimer:number;
  nextId:number;
};

export type TowerDefinition={kind:TowerKind;name:string;shortName:string;cost:number;damage:number;range:number;cooldown:number;target:'ground'|'air'|'both';splash:number;slow:number;color:string;maxTargets?:number;effectRange?:number;falloff?:number;airDamageMultiplier?:number;unique?:boolean};
