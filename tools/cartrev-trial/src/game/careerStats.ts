import type {GameState} from './types';
export type MatchRecord={id:string;mapId:string;realm:string;result:string;startedUtc:string;endedUtc:string;partial:boolean;ruleset:string;metrics:Record<string,number>;towers:Record<string,number>};
export type CareerSnapshot={version:1;sourceId:string;edition:'android'|'windows';revision:number;trackingSinceUtc:string;totals:Record<string,number>;gauges:Record<string,number>;unlocks:string[];matches:MatchRecord[];achievementProgress?:Record<string,{current:number;target:number;unlockedUtc:string|null}>};
export type CareerOverview={totals:Record<string,number>;sources:CareerSnapshot[];coverage:string};
export type Telemetry={id:string;startedUtc:string;partial:boolean;metrics:Record<string,number>};
export type CareerLocal=CareerSnapshot&{checkpoints:Record<string,{id:string;metrics:Record<string,number>;finished:boolean}>};
export const newTelemetry=(partial=false):Telemetry=>({id:crypto.randomUUID(),startedUtc:new Date().toISOString(),partial,metrics:partial?{}:{started:1}});
export const newCareer=():CareerLocal=>({version:1,sourceId:crypto.randomUUID(),edition:'android',revision:1,trackingSinceUtc:new Date().toISOString(),totals:{},gauges:{},unlocks:[],matches:[],checkpoints:{}});
export function addStat(state:GameState,key:string,value:number){if(!state.telemetry||value<=0)return;state.telemetry.metrics[key]=(state.telemetry.metrics[key]||0)+value;}
export function bestStat(state:GameState,key:string,value:number){if(state.telemetry)state.telemetry.metrics[key]=Math.max(state.telemetry.metrics[key]||0,value);}
export function captureCareer(saved:CareerLocal,state:GameState,result?:'restarted'):CareerLocal{
 if(!state.telemetry)return saved;
 const career=structuredClone(saved),run=state.telemetry,old=career.checkpoints[state.mapId];
 const checkpoint=old?.id===run.id?old:{id:run.id,metrics:{},finished:false};
 if(checkpoint.finished)return saved;
 const terminal=result||(state.status==='won'||state.status==='lost'?state.status:null);
 const metrics={...run.metrics};
 if(terminal){metrics[terminal==='won'?'wins':terminal==='lost'?'losses':'restarts']=1;
  if(terminal!=='restarted')metrics.completedRuns=1;
  if(terminal==='won'){metrics.trackedWins=1;metrics.perfectWins=state.health===20?1:0;metrics.bestHealth=state.health;metrics.bestGold=Math.floor(state.cash);metrics.bestScore=state.wave*1000+state.health*100+state.kills*10+Math.floor(state.cash);metrics.sales??=0;metrics['tower:carson:damage']??=0;metrics['tower:trevour:damage']??=0;}
 }
 const realm=['harvest-hollow','kings-crossing','siegebreak-keep'].includes(state.mapId)?'medieval':['mossfang-hollow','moonbone-marsh','dreadspire-rift'].includes(state.mapId)?'monster':['lunar-anchorage','starfall-dockyard','helios-breach'].includes(state.mapId)?'space':'foundry';
 for(const [key,value] of Object.entries(metrics)){
  const best=key.split(':').at(-1)!.startsWith('best'),delta=Math.max(0,value-(checkpoint.metrics[key]||0));
  for(const scoped of key.includes(':')?[key]:[key,`map:${state.mapId}:${key}`,`realm:${realm}:${key}`])career.totals[scoped]=best?Math.max(career.totals[scoped]||0,value):(career.totals[scoped]||0)+delta;
 }
 checkpoint.metrics=metrics;checkpoint.finished=!!terminal;career.checkpoints[state.mapId]=checkpoint;
 if(terminal){const towers:Record<string,number>={};for(const tower of state.towers)towers[tower.kind]=(towers[tower.kind]||0)+1;
  career.matches.unshift({id:run.id,mapId:state.mapId,realm,result:terminal,startedUtc:run.startedUtc,endedUtc:new Date().toISOString(),partial:run.partial,ruleset:'pocket-balance-9',metrics:{...metrics,bestHealth:state.health,bestGold:Math.floor(state.cash),kills:state.kills},towers});career.matches=career.matches.slice(0,99);
 }
 return career;
}
