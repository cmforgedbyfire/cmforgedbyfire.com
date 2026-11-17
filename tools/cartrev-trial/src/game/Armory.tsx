import {ArrowLeft,Coins,Crosshair,Gauge,ShieldCheck,Sparkles} from 'lucide-react';
import type {CSSProperties} from 'react';
import {realmTowerImage,realmTowerName} from './realmTowerArt';
import {towerDefinitions,upgradeCost} from './engine';
import type {PocketRealm,TowerKind} from './types';

const details:Record<TowerKind,{role:string;special:string}>={
 bolt:{role:'Rapid all-purpose defense',special:'Tracks ground vehicles and flying enemies.'},
 mortar:{role:'Heavy crowd control',special:'Ground-only shells damage enemies in a wide blast.'},
 frost:{role:'Route control and support',special:'Ground-only coolant shots slow their target.'},
 sky:{role:'Long-range anti-air defense',special:'Air-only lances strike flyers on their direct route.'},
 carson:{role:'Arcane guardian',special:'One per map. Strikes ground and air, dealing 80% bonus damage to aircraft.'},
 trevour:{role:'Melee champion',special:'One per map. Delivers crushing close-range ground attacks with a small impact burst.'},
 storm:{role:'Chain-lightning crowd control',special:'Strikes ground and air, then jumps to three nearby enemies at reduced damage.'},
 monkey:{role:'Premium leaping assault',special:'Launches an attack monkey through as many as five nearby ground or flying enemies.'}
};
const medievalDetails:Record<TowerKind,{role:string;special:string}>={
 bolt:{role:'Rapid archer defense',special:'Fires traveling arrows at ground troops and Woodwing Gyrocopters.'},
 mortar:{role:'Heavy siege bombardment',special:'Lobs arcing cannonballs that burst across groups of ground enemies.'},
 frost:{role:'Alchemical route control',special:'Throws freezing flasks that slow ground enemies in a burst of frost.'},
 sky:{role:'Heavy anti-air ballista',special:'Launches oversized enchanted bolts at flying enemies only.'},
 carson:{role:'Arcane guardian',special:'One per map. Strikes ground and air, dealing 80% bonus damage to aircraft.'},
 trevour:{role:'Melee champion',special:'One per map. Delivers crushing close-range ground attacks with a small impact burst.'},
 storm:{role:'Runic chain-lightning tower',special:'Strikes ground and air, then forks through three nearby enemies.'},
 monkey:{role:'Premium leaping assault',special:'Launches an attack monkey through as many as five nearby ground or flying enemies.'}
};
const monsterDetails:Record<TowerKind,{role:string;special:string}>={
 bolt:{role:'Rapid living-thorn defense',special:'Fires barbed thorns at ground creatures and Night Gargoyles.'},
 mortar:{role:'Spore-burst crowd control',special:'Lobs arcing spore pods that burst across groups of ground enemies.'},
 frost:{role:'Spectral route control',special:'Sends rime spirits through ground enemies to slow their advance.'},
 sky:{role:'Long-range anti-air eye',special:'Launches charged violet orbs at flying enemies only.'},
 carson:{role:'Arcane guardian',special:'One per map. Strikes ground and air, dealing 80% bonus damage to aircraft.'},
 trevour:{role:'Melee champion',special:'One per map. Delivers crushing close-range ground attacks with a small impact burst.'},
 storm:{role:'Living chain-lightning totem',special:'Strikes ground and air, then forks through three nearby enemies.'},
 monkey:{role:'Premium leaping assault',special:'Launches an attack monkey through as many as five nearby ground or flying enemies.'}
};
const spaceDetails:Record<TowerKind,{role:string;special:string}>={
 bolt:{role:'Twin-plasma rapid defense',special:'Tracks Scuttle Rovers and flying Void Fighters.'},
 mortar:{role:'Heavy meteor bombardment',special:'Launches explosive ground-only payloads into packed formations.'},
 frost:{role:'Gravity route control',special:'Gravity pulses slow groups of ground vehicles inside the well.'},
 sky:{role:'Long-range ion defense',special:'Charged ion rounds target flying enemies only.'},
 carson:{role:'Arcane guardian',special:'One per map. Strikes ground and air, dealing 80% bonus damage to aircraft.'},
 trevour:{role:'Melee champion',special:'One per map. Delivers crushing close-range ground attacks with a small impact burst.'},
 storm:{role:'Chained arc defense',special:'Strikes ground and air, then forks through three nearby enemies.'},
 monkey:{role:'Premium leaping assault',special:'Launches an attack monkey through as many as five nearby ground or flying enemies.'}
};

const tierValue=(base:number,growth:number,level:number)=>Math.round(base*(1+(level-1)*growth));

export function Armory({realm='foundry',onBack}:{realm?:PocketRealm;onBack:()=>void}){
 return <section className="armory-page" aria-label="Armory">
  <header className="armory-heading"><div><span>Field manual</span><h1>Armory</h1><p>Compare every tower before returning to the defense.</p></div><button onClick={onBack}><ArrowLeft size={18}/>Back to battlefield</button></header>
  <div className="armory-grid">{(Object.keys(towerDefinitions) as TowerKind[]).map(kind=>{const tower=towerDefinitions[kind],info=realm==='medieval'?medievalDetails[kind]:realm==='monster'?monsterDetails[kind]:realm==='space'?spaceDetails[kind]:details[kind],damage=[1,2,3].map(level=>tierValue(tower.damage,.58,level)),range=[1,2,3].map(level=>tierValue(tower.range,.08,level)),rate=[1,2,3].map(level=>(1/(tower.cooldown/(1+(level-1)*.18))).toFixed(1));return <article className="armory-card" key={kind} style={{'--armory-color':tower.color} as CSSProperties}>
   <div className="armory-art"><img src={realmTowerImage(kind,3,realm)} alt=""/><span>Levels 1–3</span></div>
   <div className="armory-copy"><h2>{realmTowerName(kind,realm)||tower.name}</h2><p>{info.role}</p><div className="armory-stats">
    <span><Sparkles size={14}/><small>Damage</small><b>{damage.join(' › ')}</b></span>
    <span><Crosshair size={14}/><small>Range</small><b>{range.join(' › ')}</b></span>
    <span><Gauge size={14}/><small>Shots/sec</small><b>{rate.join(' › ')}</b></span>
   </div><div className="armory-cost"><Coins size={15}/><span>Build <b>{tower.cost}</b> · upgrades <b>{upgradeCost(kind,1)}</b> / <b>{upgradeCost(kind,2)}</b></span></div><div className="armory-special"><ShieldCheck size={15}/><span>{info.special}</span></div></div>
  </article>;})}</div>
 </section>;
}
