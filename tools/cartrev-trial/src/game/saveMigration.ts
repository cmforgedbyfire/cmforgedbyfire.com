import type {GameState} from './types';
import {TOTAL_WAVES} from './engine.ts';

type LegacyGameState=Omit<GameState,'version'|'placementHintSeen'|'airWarningSeen'|'airArrivalWarningSeen'|'heavyAirWarningSeen'|'heavyAirArrivalWarningSeen'|'kills'|'airKills'|'towersBuilt'|'upgrades'>&{version:1|2|3|4|5|6|7|8|9;placementHintSeen?:boolean;airWarningSeen?:boolean;airArrivalWarningSeen?:boolean;heavyAirWarningSeen?:boolean;heavyAirArrivalWarningSeen?:boolean;kills?:number;airKills?:number;towersBuilt?:number;upgrades?:number};

export function migrateSavedGame(value:unknown,mapId:string,totalWaves=TOTAL_WAVES):GameState|null{
 const parsed=value as GameState|LegacyGameState|null;
 if(!parsed||typeof parsed!=='object'||parsed.version<1||parsed.version>10||parsed.mapId!==mapId)return null;
 if(parsed.version<10){
  const priorVersion=parsed.version;
  if(priorVersion<7){
   const baseHealthMultiplier=priorVersion===1?2.5:priorVersion===2?2:1,rewardMultiplier=priorVersion===1?.575/.85:priorVersion<=3?.575/.6:1;
   for(const enemy of parsed.enemies){const healthRatio=enemy.maxHp>0?enemy.hp/enemy.maxHp:1,tuningMultiplier=priorVersion<6?(parsed.mapId==='ember-pass'?.88:1)*(enemy.kind==='flyer'?.9/1.08:1):1;enemy.maxHp=Math.round(enemy.maxHp*baseHealthMultiplier*tuningMultiplier);enemy.hp=enemy.maxHp*healthRatio;enemy.reward*=rewardMultiplier;}
   if(parsed.wave===0&&!parsed.towers.length)parsed.cash=parsed.mapId==='ember-pass'?300:220;
  }
  const migrated=parsed as unknown as GameState;migrated.version=10;migrated.placementHintSeen=parsed.placementHintSeen??(parsed.wave>0||parsed.towers.length>0);migrated.airWarningSeen=parsed.airWarningSeen??parsed.wave>=4;migrated.airArrivalWarningSeen=parsed.airArrivalWarningSeen??parsed.wave>=5;migrated.heavyAirWarningSeen=parsed.heavyAirWarningSeen??parsed.wave>=12;migrated.heavyAirArrivalWarningSeen=parsed.heavyAirArrivalWarningSeen??parsed.wave>=13;migrated.kills=parsed.kills??0;migrated.airKills=parsed.airKills??0;migrated.towersBuilt=parsed.towersBuilt??0;migrated.upgrades=parsed.upgrades??0;
 }
 if(parsed.status==='won'&&parsed.wave<totalWaves){parsed.status='planning';parsed.spawnQueue=[];parsed.spawnTimer=0;}
 if(parsed.status!=='running')parsed.shots=[];
 return parsed as GameState;
}
