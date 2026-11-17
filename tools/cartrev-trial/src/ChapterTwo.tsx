import {ArrowLeft,BookOpen,Bot,ChevronRight,Flag,Sparkles,Swords} from 'lucide-react';
import type {PocketMap} from './game/types';

const routeIds=['switchback','harvest-hollow','mossfang-hollow','kings-crossing','starfall-dockyard','orbital-breach','siegebreak-keep','dreadspire-rift'];
const realmNames:Record<string,string>={foundry:'Foundry',medieval:'Medieval Realm',monster:'Monster Realm',space:'Space Realm'};

export function ChapterTwo({maps,onBack,onReplayFinale}:{maps:PocketMap[];onBack:()=>void;onReplayFinale:()=>void}){
 const route=routeIds.map(id=>maps.find(map=>map.id===id)).filter((map):map is PocketMap=>Boolean(map));
 return <section className="chapter-two-screen" aria-labelledby="chapter-two-title">
  <header className="chapter-two-top"><button type="button" onClick={onBack}><ArrowLeft size={17}/>Back to battlefield</button><span><Sparkles size={16}/>Chapter Two preview</span></header>
  <div className="chapter-two-scroll">
   <section className="chapter-two-hero">
    <div className="chapter-two-copy"><small>CHAPTER TWO · THE ROAD BACK</small><h1 id="chapter-two-title">The victory was a lie.</h1><p>Kalz Mahan escaped the final battlefield and struck at the Scottite kingdom while its defenders celebrated. Addisynn has been taken into the portal network. Carson and Trevour must turn the whole campaign around and fight their way home to her.</p><button type="button" onClick={onReplayFinale}><BookOpen size={17}/>Replay the Chapter One ending</button></div>
    <div className="chapter-two-seal" aria-hidden="true"><Sparkles size={34}/><strong>TWINBOUND</strong><span>She is still alive.</span></div>
   </section>
   <section className="chapter-two-briefing" aria-label="Chapter Two mission briefing">
    <article><Swords size={22}/><div><small>THE MISSION</small><strong>Bring Addisynn home</strong><p>The brothers pursue Kalz across eight returning battlefields, with every road and portal now working against them.</p></div></article>
    <article><Bot size={22}/><div><small>THE ALLIANCE</small><strong>Build the counterattack</strong><p>Scottite mechs and monkey machines will lead the assault. The player will choose what to send and when.</p></div></article>
    <article><Sparkles size={22}/><div><small>THE BOND</small><strong>Twinbound Strike</strong><p>Trevour can sense Addisynn through the darkness. Their bond will awaken a new answer to enemies in the air.</p></div></article>
   </section>
   <section className="chapter-two-route"><header><div><small>THE RESCUE ROAD</small><h2>Eight battlefields stand between them.</h2></div><span><Flag size={15}/>{route.length} missions</span></header><ol>{route.map((map,index)=><li key={map.id}><span>{String(index+1).padStart(2,'0')}</span><div><small>{realmNames[map.realm||'foundry']||'Foundry'}</small><strong>{map.name}</strong></div>{index<route.length-1&&<ChevronRight size={17}/>}</li>)}</ol></section>
  </div>
 </section>;
}
