import type {Enemy,EnemyKind,GameState,PocketMap,PocketRealm,Point,TowerDefinition,TowerKind} from './types.ts';
import {addStat,bestStat,newTelemetry} from './careerStats.ts';
import {placement,towerPosition} from './placement.ts';

export const towerDefinitions:Record<TowerKind,TowerDefinition>={
  bolt:{kind:'bolt',name:'Ember Bolt',shortName:'Bolt',cost:75,damage:19,range:155,cooldown:.58,target:'both',splash:0,slow:0,color:'#ff9854'},
  frost:{kind:'frost',name:'Frost Relay',shortName:'Frost',cost:98,damage:11,range:142,cooldown:.78,target:'ground',splash:0,slow:.48,color:'#65d5d4'},
  sky:{kind:'sky',name:'Sky Lance',shortName:'Sky',cost:110,damage:65,range:235,cooldown:.95,target:'air',splash:0,slow:0,color:'#a8afff'},
  mortar:{kind:'mortar',name:'Iron Mortar',shortName:'Mortar',cost:121,damage:48,range:185,cooldown:1.55,target:'ground',splash:72,slow:0,color:'#e0bd78'},
  carson:{kind:'carson',name:'Carson',shortName:'Carson',cost:250,damage:60,range:195,cooldown:.9,target:'both',splash:0,slow:0,color:'#62e8ff',airDamageMultiplier:1.8,unique:true},
  trevour:{kind:'trevour',name:'Trevour',shortName:'Trevour',cost:250,damage:110,range:110,cooldown:1.15,target:'ground',splash:22,slow:0,color:'#ff8b3d',unique:true},
  storm:{kind:'storm',name:'Storm Coil',shortName:'Storm',cost:295,damage:32,range:165,cooldown:1.05,target:'both',splash:0,slow:0,color:'#f7df5e'},
  monkey:{kind:'monkey',name:'Monkey Launcher',shortName:'Monkey',cost:380,damage:46,range:205,cooldown:.85,target:'both',splash:0,slow:0,color:'#f0a75a',maxTargets:5,effectRange:145,falloff:.88}
};

export const TOTAL_WAVES=18;

const enemyDefinitions:Record<EnemyKind,{health:number;speed:number;reward:number;flying:boolean;color:string}>={
  crawler:{health:1,speed:43,reward:9,flying:false,color:'#d99a56'},
  runner:{health:.72,speed:76,reward:10,flying:false,color:'#e75c4e'},
  armored:{health:2.45,speed:30,reward:17,flying:false,color:'#8999a8'},
  flyer:{health:.9,speed:56,reward:14,flying:true,color:'#a98be8'},
  airship:{health:6.25,speed:26,reward:42,flying:true,color:'#d7b16b'},
  boss:{health:8.505,speed:23,reward:80,flying:false,color:'#d94b37'},
  shielded:{health:1.55,speed:57,reward:12,flying:false,color:'#f7df5e'}
};

const FOUNDRY_MAPS=new Set(['verdant-falls','switchback','ember-pass','frostline-outpost','sunmeadow-bend','sunscar-canyon','orbital-breach']);
const MEDIEVAL_MAPS=new Set(['harvest-hollow','kings-crossing','siegebreak-keep']);
const MONSTER_MAPS=new Set(['mossfang-hollow','moonbone-marsh','dreadspire-rift']);
const SPACE_MAPS=new Set(['lunar-anchorage','starfall-dockyard','helios-breach']);
// Iron Switchback follows the Windows Foundry campaign spawn schedule.
function waveFor(wave: number, foundry: boolean): EnemyKind[] {
  const final = wave === TOTAL_WAVES;
  const count = Math.ceil((16 + 4 * wave) * 133 / 100) + (final ? 1 : 0);
  return Array.from({ length: count }, (_, index) => {
    const last = index === count - 1;
    if (final ? last || index === Math.floor(count / 2) : wave % 6 === 0 && last) return 'boss';
    if (wave >= 5 && index % 5 === 0) {
      return wave >= 13 && (index / 5) % 4 === 0 ? 'airship' : 'flyer';
    }
    if (wave >= 3 && index % 4 === 0) return 'armored';
    if (foundry && wave >= 7 && index % 10 === 6) return 'shielded';
    return wave >= 2 && index % 3 === 0 ? 'runner' : 'crawler';
  });
}
const ENEMY_COIN_MULTIPLIER=.924;
const WAVE_COIN_MULTIPLIER=1.32;
const ENEMY_HEALTH_MULTIPLIER=2.5;
const EMBER_PASS_HEALTH_MULTIPLIER=.88;
const EMBER_PASS_FLYER_HEALTH_MULTIPLIER=.8;
const FROSTLINE_HEALTH_MULTIPLIER=.9;
const LUNAR_ANCHORAGE_FLYER_HEALTH_MULTIPLIER=.72;
const LUNAR_ANCHORAGE_FLYER_SPEED_MULTIPLIER=.8;
const BOLT_ANTI_AIR_DAMAGE_MULTIPLIER=1.12;
const SKY_ANTI_AIR_DAMAGE_MULTIPLIER=1.4;

const enemyNames:Record<EnemyKind,string>={crawler:'Trucks',runner:'Hovercraft',armored:'Iron Husks',flyer:'Ember Wings',airship:'Ironclad Attack Zeppelins',boss:'Siege Boss',shielded:'Insulated Runners'};
const medievalEnemyNames:Record<EnemyKind,string>={crawler:'War Wagons',runner:'Mounted Raiders',armored:'Armored Wagons',flyer:'Woodwings',airship:'Royal War Airships',boss:'Siege Catapult',shielded:'Insulated Raiders'};
const monsterEnemyNames:Record<EnemyKind,string>={crawler:'Moss Slimes',runner:'Ember Hounds',armored:'Stoneback Golems',flyer:'Night Gargoyles',airship:'Sky Leviathans',boss:'Dreadhorn Behemoth',shielded:'Runed Hounds'};
const spaceEnemyNames:Record<EnemyKind,string>={crawler:'Scuttle Rovers',runner:'Dart Skimmers',armored:'Bulwark Crawlers',flyer:'Void Fighters',airship:'Gravity Dreadnoughts',boss:'Siege Carrier',shielded:'Insulated Skimmers'};
export function waveSummary(wave:number,realm:PocketRealm='foundry'){
  const waveNumber=Math.max(1,Math.min(TOTAL_WAVES,wave)),composition=waveFor(waveNumber,realm==='foundry'),counts=new Map<EnemyKind,number>();
  for(const kind of composition)counts.set(kind,(counts.get(kind)||0)+1);
  const names=realm==='medieval'?medievalEnemyNames:realm==='monster'?monsterEnemyNames:realm==='space'?spaceEnemyNames:enemyNames;
  return [...counts].map(([kind,count])=>`${count} ${names[kind]}`).join(' · ');
}

export function newGame(mapId:string):GameState{return {telemetry:newTelemetry(),version:10,mapId,status:'planning',wave:0,health:20,cash:mapId==='ember-pass'?300:220,speed:1,placementHintSeen:false,airWarningSeen:false,airArrivalWarningSeen:false,heavyAirWarningSeen:false,heavyAirArrivalWarningSeen:false,paused:false,kills:0,airKills:0,towersBuilt:0,upgrades:0,towers:[],enemies:[],shots:[],spawnQueue:[],spawnTimer:0,nextId:1};}

export function routeLength(route:Point[],routeJumps:number[]=[]){let total=0;for(let i=1;i<route.length;i++){if(routeJumps.includes(i-1))continue;total+=Math.hypot(route[i][0]-route[i-1][0],route[i][1]-route[i-1][1]);}return total;}

export function routePosition(route:Point[],distance:number,flying=false,routeJumps:number[]=[]){
  const points=flying?[route[0],route[route.length-1]]:route;
  for(let i=1;i<points.length;i++){
    if(!flying&&routeJumps.includes(i-1))continue;
    const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if(distance<length)return {x:a[0]+(b[0]-a[0])*distance/length,y:a[1]+(b[1]-a[1])*distance/length};
    distance-=length;
  }
  const last=points[points.length-1];return {x:last[0],y:last[1]};
}

export function startWave(state:GameState){
  if(state.status!=='planning'||state.wave>=TOTAL_WAVES)return false;
  state.wave++;
  state.status='running';
  state.spawnQueue=waveFor(state.wave,FOUNDRY_MAPS.has(state.mapId));
  state.spawnTimer=.2;
  return true;
}

export function buildTower(state:GameState,kind:TowerKind,site:number){
  const def=towerDefinitions[kind];
  if(state.status==='won'||state.status==='lost'||state.cash<def.cost||state.towers.some(t=>t.site===site)||(def.unique&&state.towers.some(t=>t.kind===kind)))return false;
  addStat(state,'towersBuilt',1);addStat(state,`tower:${kind}:towersBuilt`,1);addStat(state,'goldBuild',def.cost);
  state.cash-=def.cost;state.towers.push({id:state.nextId++,kind,site,level:1,cooldown:0,aim:0});state.towersBuilt++;return true;
}

export function buildTowerAt(state:GameState,map:PocketMap,kind:TowerKind,x:number,y:number){
  const def=towerDefinitions[kind];
  if(!def||state.status==='won'||state.status==='lost'||state.cash<def.cost||(def.unique&&state.towers.some(t=>t.kind===kind)))return false;
  x=Math.round(x);y=Math.round(y);
  if(!placement(map,state,x,y,kind).allowed)return false;
  addStat(state,'towersBuilt',1);addStat(state,`tower:${kind}:towersBuilt`,1);addStat(state,'goldBuild',def.cost);
  const id=state.nextId++;
  state.cash-=def.cost;state.towers.push({id,kind,site:-id,x,y,level:1,cooldown:0,aim:0});state.towersBuilt++;return true;
}

export function upgradeCost(kind:TowerKind,level:number){return Math.round(towerDefinitions[kind].cost*(.62+level*.18));}

export function upgradeTower(state:GameState,id:number){
  const tower=state.towers.find(item=>item.id===id);if(!tower||tower.level>=3)return false;
  const cost=upgradeCost(tower.kind,tower.level);if(state.cash<cost)return false;
  addStat(state,'upgrades',1);addStat(state,`tower:${tower.kind}:upgrades`,1);addStat(state,'goldUpgrade',cost);
  state.cash-=cost;tower.level++;state.upgrades++;return true;
}

export function sellTower(state:GameState,id:number){
  const index=state.towers.findIndex(item=>item.id===id);if(index<0)return false;
  const tower=state.towers[index];let invested=towerDefinitions[tower.kind].cost;
  for(let level=1;level<tower.level;level++)invested+=upgradeCost(tower.kind,level);
  const refund=Math.floor(invested*.65);addStat(state,'sales',1);addStat(state,`tower:${tower.kind}:sales`,1);addStat(state,'goldRefunds',refund);
  state.cash+=refund;state.towers.splice(index,1);return true;
}

function ironSwitchbackHealth(wave: number, baseHealth: number) {
  const earlyWave = wave <= 5 ? 0.9 : 1;
  const lateWave = 1 + 0.02 * Math.max(0, wave - 10);
  return Math.round((30 + wave * 10) * 1.12 * 1.30 * 1.25 * 1.25 * baseHealth * earlyWave * lateWave);
}

function spawnEnemy(state:GameState,kind:EnemyKind){
  const base=enemyDefinitions[kind],def=kind==='airship'&&MONSTER_MAPS.has(state.mapId)?{...base,health:7.421875,speed:22,reward:45}:kind==='airship'&&SPACE_MAPS.has(state.mapId)?{...base,health:7.1875,speed:23,reward:45}:kind==='airship'&&MEDIEVAL_MAPS.has(state.mapId)?{...base,health:5.625,speed:20}:base,waveScale=1+(state.wave-1)*.16,mapScale=state.mapId==='ember-pass'?EMBER_PASS_HEALTH_MULTIPLIER:state.mapId==='frostline-outpost'?FROSTLINE_HEALTH_MULTIPLIER:1,flyerMapScale=state.mapId==='ember-pass'&&kind==='flyer'?EMBER_PASS_FLYER_HEALTH_MULTIPLIER:state.mapId==='lunar-anchorage'&&kind==='flyer'?LUNAR_ANCHORAGE_FLYER_HEALTH_MULTIPLIER:1,enemySpeed=state.mapId==='lunar-anchorage'&&kind==='flyer'?def.speed*LUNAR_ANCHORAGE_FLYER_SPEED_MULTIPLIER:def.speed;
  const bossMapScale=state.mapId==='starfall-dockyard'&&kind==='boss'?.9:1;
  const maxHp=state.mapId==='switchback'?ironSwitchbackHealth(state.wave,def.health):Math.round((36+state.wave*8)*def.health*waveScale*ENEMY_HEALTH_MULTIPLIER*mapScale*flyerMapScale*bossMapScale);
  const bossNumber=kind==='boss'&&state.wave===TOTAL_WAVES?(state.spawnQueue.includes('boss')?1:2):undefined,bossBoost=bossNumber===2?1.25:1;
  state.enemies.push({id:state.nextId++,kind,distance:0,hp:maxHp,maxHp,speed:enemySpeed*bossBoost,reward:def.reward*ENEMY_COIN_MULTIPLIER,slow:1,slowTime:0,...(bossNumber?{bossNumber,sizeMultiplier:bossBoost}:{})});
}

function isFlying(kind:EnemyKind){return enemyDefinitions[kind].flying;}
export function enemyUsesDirectRoute(kind:EnemyKind,mapId:string){return isFlying(kind)&&!(kind==='airship'&&mapId==='lunar-anchorage');}

export function stepGame(state:GameState,map:PocketMap,elapsed:number){
  if(state.status!=='running'||state.paused)return;
  addStat(state,'activeSeconds',Math.min(elapsed,.12));
  let remaining=Math.min(elapsed,.12)*state.speed;
  while(remaining>0){const dt=Math.min(.04,remaining);tick(state,map,dt);remaining-=dt;if(state.status!=='running')break;}
}

function tick(state:GameState,map:PocketMap,dt:number){
  addStat(state,'simulationSeconds',dt);
  state.shots.forEach(shot=>{if((shot.delay||0)>0)shot.delay=Math.max(0,(shot.delay||0)-dt);else shot.life-=dt;});state.shots=state.shots.filter(shot=>shot.life>0);
  state.spawnTimer-=dt;
  if(state.spawnQueue.length&&state.spawnTimer<=0){
    spawnEnemy(state,state.spawnQueue.shift()!);
    state.spawnTimer=state.wave===TOTAL_WAVES&&state.spawnQueue.length===1?1.5:Math.max(.35,.95-state.wave*.025);
  }
  const groundLength=routeLength(map.route,map.routeJumps),airLength=Math.hypot(map.route.at(-1)![0]-map.route[0][0],map.route.at(-1)![1]-map.route[0][1]);
  for(const enemy of [...state.enemies]){
    if(enemy.slowTime>0)enemy.slowTime-=dt;else enemy.slow=1;
    enemy.distance+=enemy.speed*enemy.slow*dt;
    if(enemy.distance>=(enemyUsesDirectRoute(enemy.kind,map.id)?airLength:groundLength)){
      const breach=enemy.kind==='boss'?3:enemy.kind==='airship'?2:1;addStat(state,'leaks',1);addStat(state,'healthLost',Math.min(state.health,breach));state.health-=breach;state.enemies.splice(state.enemies.indexOf(enemy),1);
      if(state.health<=0){state.health=0;state.status='lost';state.spawnQueue=[];return;}
    }
  }
  for(const tower of state.towers){
    const hit=(enemy:Enemy,damage:number)=>{const adjusted=damage*(tower.kind==='storm'&&enemy.kind==='shielded'?.55:1),prior=enemy.hp,actual=Math.min(Math.max(0,prior),adjusted);addStat(state,'damage',actual);addStat(state,`tower:${tower.kind}:damage`,actual);enemy.hp-=adjusted;if(prior>0&&enemy.hp<=0)addStat(state,`tower:${tower.kind}:kills`,1);};
    tower.cooldown-=dt;if(tower.cooldown>0)continue;
    const def=towerDefinitions[tower.kind],site=towerPosition(map,tower);if(!site)continue;
    const target=state.enemies.filter(enemy=>def.target==='both'||(def.target==='air'&&isFlying(enemy.kind))||(def.target==='ground'&&!isFlying(enemy.kind))).map(enemy=>({enemy,pos:routePosition(map.route,enemy.distance,enemyUsesDirectRoute(enemy.kind,map.id),map.routeJumps)})).filter(({pos})=>Math.hypot(pos.x-site[2],pos.y-site[3])<=def.range*(1+(tower.level-1)*.08)).sort((a,b)=>b.enemy.distance-a.enemy.distance)[0];
    if(!target)continue;
    tower.aim=Math.atan2(target.pos.y-site[3],target.pos.x-site[2]);
    const antiAir=isFlying(target.enemy.kind)?def.airDamageMultiplier??(tower.kind==='sky'?SKY_ANTI_AIR_DAMAGE_MULTIPLIER:tower.kind==='bolt'?BOLT_ANTI_AIR_DAMAGE_MULTIPLIER:1):1,damage=def.damage*(1+(tower.level-1)*.58)*antiAir;
    if(tower.kind==='storm'||tower.kind==='monkey'){
      const victims=[target.enemy];let lastPosition=target.pos,lastDamage=damage;
      const maximum=def.maxTargets||4,radius=def.effectRange||120,falloff=def.falloff||.75;
      const muzzleDistance=tower.kind==='storm'?18:27,muzzle:Point=[site[2]+Math.cos(tower.aim)*muzzleDistance,site[3]+Math.sin(tower.aim)*muzzleDistance];
      hit(target.enemy,lastDamage);state.shots.push({id:state.nextId++,kind:tower.kind,from:muzzle,to:[lastPosition.x,lastPosition.y],color:def.color,life:tower.kind==='monkey'?.38:.22,duration:tower.kind==='monkey'?.38:.22,delay:0});
      for(let hop=1;hop<maximum;hop++){
        const next=state.enemies.filter(enemy=>!victims.includes(enemy)).map(enemy=>({enemy,pos:routePosition(map.route,enemy.distance,enemyUsesDirectRoute(enemy.kind,map.id),map.routeJumps)})).filter(({pos})=>Math.hypot(pos.x-lastPosition.x,pos.y-lastPosition.y)<=radius).sort((a,b)=>Math.hypot(a.pos.x-lastPosition.x,a.pos.y-lastPosition.y)-Math.hypot(b.pos.x-lastPosition.x,b.pos.y-lastPosition.y))[0];
        if(!next)break;lastDamage*=falloff;hit(next.enemy,lastDamage);state.shots.push({id:state.nextId++,kind:tower.kind,from:[lastPosition.x,lastPosition.y],to:[next.pos.x,next.pos.y],color:def.color,life:tower.kind==='monkey'?.38:.22,duration:tower.kind==='monkey'?.38:.22,delay:hop*(tower.kind==='monkey'?.17:.035)});victims.push(next.enemy);lastPosition=next.pos;
      }
    }else{
      hit(target.enemy,damage);
      if(def.slow){target.enemy.slow=def.slow;target.enemy.slowTime=1.25;}
      if(def.splash)for(const other of state.enemies){if(other===target.enemy||isFlying(other.kind))continue;const pos=routePosition(map.route,other.distance,false,map.routeJumps);if(Math.hypot(pos.x-target.pos.x,pos.y-target.pos.y)<=def.splash)hit(other,damage*.55);}
      const muzzleDistance=tower.kind==='mortar'?29:tower.kind==='sky'?31:tower.kind==='frost'?22:tower.kind==='trevour'?18:25,duration=tower.kind==='mortar'?.42:tower.kind==='carson'?.28:tower.kind==='trevour'?.22:.15;
      state.shots.push({id:state.nextId++,kind:tower.kind,from:[site[2]+Math.cos(tower.aim)*muzzleDistance,site[3]+Math.sin(tower.aim)*muzzleDistance],to:[target.pos.x,target.pos.y],color:def.color,life:duration,duration});
    }
    tower.cooldown=def.cooldown/(1+(tower.level-1)*.18);
  }
  for(const enemy of [...state.enemies])if(enemy.hp<=0){addStat(state,'kills',1);addStat(state,`enemy:${enemy.kind}:kills`,1);addStat(state,isFlying(enemy.kind)?'airKills':'groundKills',1);if(enemy.kind==='boss')addStat(state,'bossKills',1);addStat(state,'goldKills',enemy.reward);state.cash+=enemy.reward;state.kills++;if(isFlying(enemy.kind))state.airKills++;state.enemies.splice(state.enemies.indexOf(enemy),1);}
  if(!state.spawnQueue.length&&!state.enemies.length){addStat(state,'wavesCleared',1);bestStat(state,'bestWave',state.wave);state.shots=[];state.status=state.wave>=TOTAL_WAVES?'won':'planning';if(state.status==='planning'){const reward=(14+state.wave*2)*WAVE_COIN_MULTIPLIER;addStat(state,'goldWaves',reward);state.cash+=reward;}}
}

export function enemyColor(kind:EnemyKind){return enemyDefinitions[kind].color;}
export function enemyFlying(kind:EnemyKind){return isFlying(kind);}
