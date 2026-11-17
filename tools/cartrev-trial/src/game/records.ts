import type {GameState,PocketMap} from './types';
import {newCareer,captureCareer,type CareerLocal,type CareerSnapshot} from './careerStats.ts';

export const RECORDS_KEY='cartrev-pocket-records-v1';

export type MapRecord={wins:number;perfectWins:number;bestHealth:number;bestScore:number};
export type PocketRecords={
 statistics?:CareerLocal;
 version:1;
 kills:number;
 airKills:number;
 towersBuilt:number;
 upgrades:number;
 wins:number;
 perfectWins:number;
 bestWave:number;
 maps:Record<string,MapRecord>;
};

export type RecordDelta={kills:number;airKills:number;towersBuilt:number;upgrades:number};
export type AchievementDefinition={id:string;name:string;description:string;value:(records:PocketRecords)=>number;target:number};
export type LeaderboardDefinition={id:string;name:string;description:string;mapId?:string};
export type GoogleLeaderboardScore={id:'best-defense'|'victories'|'perfect-victories'|'enemies-defeated'|'flying-enemies-defeated';score:number};

export const googleLeaderboards:[{id:'best-defense';name:string},{id:'victories';name:string},{id:'perfect-victories';name:string},{id:'enemies-defeated';name:string},{id:'flying-enemies-defeated';name:string}]=[
 {id:'best-defense',name:'Best Defense'},
 {id:'victories',name:'Victories'},
 {id:'perfect-victories',name:'Perfect Victories'},
 {id:'enemies-defeated',name:'Enemies Defeated'},
 {id:'flying-enemies-defeated',name:'Flying Enemies Defeated'}
];

export const emptyRecords=():PocketRecords=>({version:1,kills:0,airKills:0,towersBuilt:0,upgrades:0,wins:0,perfectWins:0,bestWave:0,maps:{}});

export function readRecords():PocketRecords{
 try{
  const parsed=JSON.parse(localStorage.getItem(RECORDS_KEY)||'null') as Partial<PocketRecords>|null;
  if(!parsed||parsed.version!==1)return emptyRecords();
  const records={...emptyRecords(),...parsed,maps:parsed.maps||{},statistics:parsed.statistics||newCareer()};
  if(!parsed.statistics){records.statistics.achievementProgress=Object.fromEntries(achievements.map(a=>[a.id,{current:Math.min(a.target,a.value(records)),target:a.target,unlockedUtc:null}]));localStorage.setItem(RECORDS_KEY,JSON.stringify(records));}
  return records;
 }catch{return emptyRecords();}
}

export function writeRecords(records:PocketRecords){records={...records,statistics:{...(records.statistics||newCareer()),revision:(records.statistics?.revision||0)+1}};const stats=records.statistics!;stats.achievementProgress=Object.fromEntries(achievements.map(a=>{const previous=stats.achievementProgress?.[a.id],current=Math.min(a.target,a.value(records));return [a.id,{current,target:a.target,unlockedUtc:previous?.unlockedUtc||(current>=a.target&&previous&&previous.current<a.target?new Date().toISOString():null)}];}));localStorage.setItem(RECORDS_KEY,JSON.stringify(records));return records;}

export function recordCareer(records:PocketRecords,state:GameState,result?:'restarted'){
 const prior=records.statistics||newCareer(),next=captureCareer(prior,state,result);
 return next===prior?records:{...records,statistics:next};
}
export function careerSnapshot(records:PocketRecords):CareerSnapshot|undefined{
 const stats=records.statistics;if(!stats)return;
 const totals={...stats.totals,kills:records.kills,airKills:records.airKills,groundKills:Math.max(0,records.kills-records.airKills),towersBuilt:records.towersBuilt,upgrades:records.upgrades,wins:records.wins,perfectWins:records.perfectWins,bestWave:records.bestWave};
 for(const [id,map] of Object.entries(records.maps)){Object.assign(totals,{[`map:${id}:wins`]:map.wins,[`map:${id}:perfectWins`]:map.perfectWins,[`map:${id}:bestHealth`]:map.bestHealth,[`map:${id}:bestScore`]:map.bestScore});}
 return {version:1,sourceId:stats.sourceId,edition:'android',revision:stats.revision,trackingSinceUtc:stats.trackingSinceUtc,totals,gauges:{},unlocks:[],matches:stats.matches,achievementProgress:stats.achievementProgress};
}

export function addProgress(records:PocketRecords,delta:RecordDelta,wave:number){
 return {...records,kills:records.kills+Math.max(0,delta.kills),airKills:records.airKills+Math.max(0,delta.airKills),towersBuilt:records.towersBuilt+Math.max(0,delta.towersBuilt),upgrades:records.upgrades+Math.max(0,delta.upgrades),bestWave:Math.max(records.bestWave,wave)};
}

export function defenseScore(state:GameState){return state.wave*1000+state.health*100+state.kills*10+Math.floor(state.cash);}

export function addVictory(records:PocketRecords,state:GameState){
 const prior=records.maps[state.mapId]||{wins:0,perfectWins:0,bestHealth:0,bestScore:0},perfect=state.health===20,score=defenseScore(state);
 return {...records,wins:records.wins+1,perfectWins:records.perfectWins+(perfect?1:0),bestWave:Math.max(records.bestWave,state.wave),maps:{...records.maps,[state.mapId]:{wins:prior.wins+1,perfectWins:prior.perfectWins+(perfect?1:0),bestHealth:Math.max(prior.bestHealth,state.health),bestScore:Math.max(prior.bestScore,score)}}};
}

const realmMaps={
 foundry:['switchback','ember-pass','verdant-falls','frostline-outpost','sunmeadow-bend','sunscar-canyon','orbital-breach'],
 medieval:['harvest-hollow','kings-crossing','siegebreak-keep'],
 monster:['mossfang-hollow','moonbone-marsh','dreadspire-rift'],
 space:['lunar-anchorage','starfall-dockyard','helios-breach']
} as const;
const chapterMaps=Object.values(realmMaps).flat(),hardMaps=['sunscar-canyon','orbital-breach','siegebreak-keep','dreadspire-rift','starfall-dockyard','helios-breach'];
const uniqueWins=(records:PocketRecords,ids:readonly string[])=>ids.filter(id=>(records.maps[id]?.wins||0)>0).length;
const uniquePerfectWins=(records:PocketRecords)=>chapterMaps.filter(id=>(records.maps[id]?.perfectWins||0)>0).length;
const hardMatch=(records:PocketRecords,predicate:(match:NonNullable<PocketRecords['statistics']>['matches'][number])=>boolean)=>records.statistics?.matches.some(match=>!match.partial&&match.result==='won'&&hardMaps.includes(match.mapId)&&predicate(match))?1:0;

export const achievements:AchievementDefinition[]=[
 {id:'first-build',name:'Lay the Foundation',description:'Place your first tower.',value:r=>r.towersBuilt,target:1},
 {id:'first-upgrade',name:'Stronger Together',description:'Upgrade your first tower.',value:r=>r.upgrades,target:1},
 {id:'kills-100',name:'Hold the Road',description:'Defeat 100 enemies across your defenses.',value:r=>r.kills,target:100},
 {id:'air-25',name:'Clear Skies',description:'Defeat 25 flying enemies.',value:r=>r.airKills,target:25},
 {id:'first-win',name:'Forged in Victory',description:'Win a complete thirteen-wave defense.',value:r=>r.wins,target:1},
 {id:'perfect-win',name:'Unbroken',description:'Win with all 20 portal health remaining.',value:r=>r.perfectWins,target:1},
 {id:'campaign-five',name:'Battlefield Defender',description:'Win on five different battlefields.',value:r=>Object.values(r.maps).filter(map=>map.wins>0).length,target:5},
 {id:'milestone-wins-5',name:'Finding Our Strength',description:'Win 5 Pocket campaign defenses.',value:r=>r.wins,target:5},
 {id:'milestone-wins-10',name:'Standing Together',description:'Win 10 Pocket campaign defenses.',value:r=>r.wins,target:10},
 {id:'milestone-wins-25',name:'A Kingdom’s Defenders',description:'Win 25 Pocket campaign defenses.',value:r=>r.wins,target:25},
 {id:'milestone-perfect-5',name:'Nothing Gets Through',description:'Win 5 defenses with all 20 core health.',value:r=>r.perfectWins,target:5},
 {id:'milestone-perfect-10',name:'An Unbroken Stand',description:'Win 10 defenses with all 20 core health.',value:r=>r.perfectWins,target:10},
 {id:'milestone-perfect-25',name:'Guardians of the Gates',description:'Win 25 defenses with all 20 core health.',value:r=>r.perfectWins,target:25},
 {id:'milestone-kills-50000',name:'The Forsaken Remember',description:'Defeat 50,000 enemies across your career.',value:r=>r.kills,target:50_000},
 {id:'milestone-kills-100000',name:'A Hundred Thousand Reasons',description:'Defeat 100,000 enemies across your career.',value:r=>r.kills,target:100_000},
 {id:'milestone-kills-300000',name:'Legends of the Scottites',description:'Defeat 300,000 enemies across your career.',value:r=>r.kills,target:300_000},
 {id:'chapter-realm-foundry',name:'Fires of the Foundry',description:'Win all 7 Chapter One Foundry maps.',value:r=>uniqueWins(r,realmMaps.foundry),target:7},
 {id:'chapter-realm-medieval',name:'Keepers of the Kingdom',description:'Win all 3 Medieval Realm maps.',value:r=>uniqueWins(r,realmMaps.medieval),target:3},
 {id:'chapter-realm-monster',name:'Courage Among Monsters',description:'Win all 3 Monster Realm maps.',value:r=>uniqueWins(r,realmMaps.monster),target:3},
 {id:'chapter-realm-space',name:'Defenders Among the Stars',description:'Win all 3 Space Realm maps.',value:r=>uniqueWins(r,realmMaps.space),target:3},
 {id:'chapter-one-complete',name:'Together, We Held the Line',description:'Win all 16 Chapter One maps.',value:r=>uniqueWins(r,chapterMaps),target:16},
 {id:'chapter-one-hard',name:'The Hard Road Home',description:'Win all six original Chapter One Hard challenges.',value:r=>uniqueWins(r,hardMaps),target:6},
 {id:'chapter-perfect-4',name:'Four Roads, No Losses',description:'Perfectly defend 4 different Chapter One maps.',value:uniquePerfectWins,target:4},
 {id:'chapter-perfect-8',name:'Eight Unbroken Roads',description:'Perfectly defend 8 different Chapter One maps.',value:uniquePerfectWins,target:8},
 {id:'chapter-perfect-16',name:'Not One Gate Falls',description:'Perfectly defend all 16 Chapter One maps.',value:uniquePerfectWins,target:16},
 {id:'challenge-brothers-hard',name:'Brothers in Arms',description:'Win an original Hard map with Carson and Trevour deployed and dealing damage.',value:r=>hardMatch(r,match=>(match.towers.carson||0)>0&&(match.towers.trevour||0)>0&&(match.metrics['tower:carson:damage']||0)>0&&(match.metrics['tower:trevour:damage']||0)>0),target:1},
 {id:'challenge-no-sales-hard',name:'Every Placement Matters',description:'Win an original Hard map without selling a tower.',value:r=>hardMatch(r,match=>'sales' in match.metrics&&match.metrics.sales===0),target:1}
];

export function achievementProgress(records:PocketRecords){return achievements.map(definition=>({...definition,current:Math.min(definition.target,definition.value(records)),earned:definition.value(records)>=definition.target}));}

const googleIncrementalIds=new Set([
 'kills-100','air-25','campaign-five','milestone-wins-5','milestone-wins-10','milestone-wins-25','milestone-perfect-5','milestone-perfect-10','milestone-perfect-25','chapter-realm-foundry','chapter-realm-medieval','chapter-realm-monster','chapter-realm-space','chapter-one-complete','chapter-one-hard','chapter-perfect-4','chapter-perfect-8','chapter-perfect-16'
]);
export function googleAchievementUpdates(records:PocketRecords){return achievementProgress(records).map(item=>({id:item.id,current:item.current,target:item.target,earned:item.earned,incremental:googleIncrementalIds.has(item.id)}));}

export function googleLeaderboardScores(records:PocketRecords):GoogleLeaderboardScore[]{
 const bestDefense=Math.max(0,...Object.values(records.maps).map(item=>item.bestScore));
 return [
  {id:'best-defense',score:bestDefense},
  {id:'victories',score:records.wins},
  {id:'perfect-victories',score:records.perfectWins},
  {id:'enemies-defeated',score:records.kills},
  {id:'flying-enemies-defeated',score:records.airKills}
 ];
}

const honorTitles=[['chapter-one-complete','Scottite Defender'],['milestone-kills-50000','Scottite Veteran'],['chapter-one-hard','Scottite Champion'],['milestone-kills-100000','Scottite Guardian'],['chapter-perfect-16','Scottite Crown Guardian'],['milestone-kills-300000','Scottite Legend']] as const;
export function honorTitle(records:PocketRecords){let title:string|undefined;for(const [id,name] of honorTitles){const achievement=achievements.find(item=>item.id===id);if(achievement&&achievement.value(records)>=achievement.target)title=name;}return title;}

export function leaderboardDefinitions(maps:PocketMap[]):LeaderboardDefinition[]{return [{id:'pocket-overall-score',name:'Best Defense',description:'Highest thirteen-wave defense score on this phone.'},...maps.map(map=>({id:`pocket-${map.id}-score`,name:map.name,description:`Best score on ${map.name}.`,mapId:map.id}))];}
