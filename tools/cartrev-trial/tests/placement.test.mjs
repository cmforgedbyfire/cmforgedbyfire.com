import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,buildTowerAt,buildTower,upgradeTower,sellTower,startWave,stepGame,towerDefinitions,TOTAL_WAVES} from '../src/game/engine.ts';
import {placement,towerPosition} from '../src/game/placement.ts';
import {pickBattlefieldTarget} from '../src/game/selection.ts';
import {migrateSavedGame} from '../src/game/saveMigration.ts';
const map=JSON.parse(fs.readFileSync(new URL('../../../play/cartrev-towers/content/pocket-catalog.json',import.meta.url))).maps[0];
const kinds=['bolt','frost','sky','mortar','storm','monkey'];
test('free coordinates, blockers and all six tower types',()=>{
 let count=0;for(const kind of kinds){const s=newGame(map.id);s.cash=10000;let safe=0;for(let y=20;y<map.height;y+=20)for(let x=20;x<960;x+=20){const result=placement(map,s,x,y,kind);count++;if(result.allowed)safe++;}assert(safe>50,kind+' has usable ground');for(const [x,y] of [[0,0],[78,135],[296,59],[473,260],[431,304],[920,140]]){const cash=s.cash;assert(!buildTowerAt(s,map,kind,x,y));assert.equal(s.cash,cash);}assert(!buildTowerAt(s,map,kind,NaN,200));assert(!buildTowerAt(s,map,kind,Infinity,200));}
 console.log('Checked '+count+' placement samples.');
 const s=newGame(map.id);assert(buildTowerAt(s,map,'bolt',305,160));assert.deepEqual([s.towers[0].x,s.towers[0].y],[305,160]);assert(!map.buildPositions.some(p=>p[2]===305&&p[3]===160));assert(!buildTowerAt(s,map,'bolt',305,160));
});
test('upgrades stay in place, and new and legacy saves retain positions',()=>{
 const s=newGame(map.id);s.cash=10000;assert(buildTowerAt(s,map,'bolt',305,160));assert(upgradeTower(s,s.towers[0].id));assert(upgradeTower(s,s.towers[0].id));const loaded=migrateSavedGame(JSON.parse(JSON.stringify(s)),map.id);assert.deepEqual(loaded.towers,s.towers);assert.equal(loaded.cash,s.cash);assert.equal(pickBattlefieldTarget(map,loaded,305,160).id,s.towers[0].id);
 const legacy=newGame(map.id);assert(buildTower(legacy,'bolt',0));const cash=legacy.cash;const restored=migrateSavedGame(JSON.parse(JSON.stringify(legacy)),map.id);assert.equal(restored.cash,cash);assert.deepEqual(towerPosition(map,restored.towers[0]),map.buildPositions[0]);assert(!placement(map,restored,map.buildPositions[0][2],map.buildPositions[0][3],'bolt').allowed);assert(upgradeTower(restored,restored.towers[0].id));assert(sellTower(restored,restored.towers[0].id));
});
test('a normal-earnings free-placement defense can clear all 18 waves',()=>{
 const candidates={};const blank=newGame(map.id);for(const kind of ['bolt','sky','mortar']){candidates[kind]=[];for(let y=40;y<map.height-30;y+=24)for(let x=80;x<900;x+=24)if(placement(map,blank,x,y,kind).allowed){const range=towerDefinitions[kind].range;const ground=map.route.filter(p=>Math.hypot(x-p[0],y-p[1])<range).length;let air=0;for(let t=0;t<1;t+=.02){const a=map.route[0],b=map.route.at(-1);if(Math.hypot(x-a[0]-(b[0]-a[0])*t,y-a[1]-(b[1]-a[1])*t)<range)air++;}candidates[kind].push({x,y,score:kind==='sky'?air*3:ground+air});}candidates[kind].sort((a,b)=>b.score-a.score);}
 let won=false;for(let strategy=0;strategy<8&&!won;strategy++){const s=newGame(map.id);for(let wave=0;wave<TOTAL_WAVES&&s.status==='planning';wave++){for(let attempt=0;attempt<40;attempt++){const order=strategy%2?['bolt','bolt','sky','mortar','sky']:['bolt','sky','bolt','mortar'];const kind=order[s.towers.length%order.length],point=candidates[kind].find(p=>placement(map,s,p.x,p.y,kind).allowed);const up=s.towers.filter(t=>t.level<3).sort((a,b)=>a.level-b.level).find(t=>s.cash>=Math.round(towerDefinitions[t.kind].cost*(.62+t.level*.18)));if(up&&(s.towers.length>=3+strategy||!point)){upgradeTower(s,up.id);continue;}if(!point||!buildTowerAt(s,map,kind,point.x,point.y))break;}startWave(s);for(let tick=0;tick<20000&&s.status==='running';tick++)stepGame(s,map,.1);}console.log('Strategy',strategy,s.status,'wave',s.wave,'health',s.health);won=s.status==='won';}assert(won,'Full trial remains winnable without extra coins');
});

test('a completed 13-wave trial can continue through the Windows finale',()=>{
 const old=newGame(map.id);
 old.status='won';
 old.wave=13;
 const resumed=migrateSavedGame(old,map.id);
 assert.equal(resumed.status,'planning');
 assert.equal(map.waves,TOTAL_WAVES);
 for(let wave=14;wave<=18;wave++){
  assert(startWave(resumed));
  assert.equal(resumed.wave,wave);
  assert.equal(resumed.spawnQueue.length,Math.ceil((16+4*wave)*1.33)+(wave===18?1:0));
  const bosses=resumed.spawnQueue.flatMap((kind,index)=>kind==='boss'?[index]:[]);
  assert.deepEqual(bosses,wave===18?[Math.floor(resumed.spawnQueue.length/2),resumed.spawnQueue.length-1]:[]);
  resumed.status='planning';
 }
 assert(!startWave(resumed));
});
