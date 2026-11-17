import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Shield,X} from 'lucide-react';

export const storyOpeningKey='cartrev-pocket-story-opening-v2';
export const chapterOneEpilogueKey='cartrev-pocket-chapter-one-epilogue-v1';

type CharacterId='carson'|'trevour'|'addisynn'|'arabella'|'kalz'|'carson-resolute'|'trevour-resolute'|'addisynn-alarmed';
type StoryChapter={eyebrow:string;title:string;image:string;cast:readonly CharacterId[];text:string;quote?:string;quoteSpeaker?:string};

export const openingChapters:readonly StoryChapter[]=[
 {eyebrow:'THE SCOTTITES',title:'Before the portals opened',image:'./maps/kings-crossing-v2.png',cast:[],text:'For generations, the Scottites lived in peace beneath the watch of ancient towers. Their guardians kept the roads safe and the darkness beyond the borders of the Four Realms.'},
 {eyebrow:'TWO BROTHERS',title:'Wisdom and strength',image:'./maps/ember-pass-v2.png',cast:['carson','trevour'],text:'Among those guardians were Carson and Trevour—inseparable brothers who always entered battle together. Carson, the elder, carried the plan. Trevour loved a good battle and brought the strength, but he loved his brother more.'},
 {eyebrow:'THE SISTER AT HOME',title:'The heart of the kingdom',image:'./maps/kings-crossing-v2.png',cast:['addisynn'],text:'When the Forsaken killed their parents at the beginning of the war, the three siblings inherited different duties. While Carson and Trevour carried the fight beyond the gates, Addisynn—Trevour’s twin—kept the Scottite Kingdom standing. She supplied the troops, sheltered the displaced, and made certain her brothers always had a home to return to.',quote:'You hold the roads. I will hold the kingdom.',quoteSpeaker:'Addisynn'},
 {eyebrow:'THE KEEPER OF THE TOWERS',title:'The fair maiden Arabella',image:'./maps/verdant-falls-river-v3.png',cast:['arabella','carson'],text:'Arabella kept the old knowledge of the towers, and her heart belonged to Carson. Their love was freely given, but another man believed that love should have been his.'},
 {eyebrow:'THE FALL OF KALZ MAHAN',title:'Resentment became darkness',image:'./maps/dreadspire-rift-v2.png',cast:['kalz'],text:'When Arabella chose Carson, Kalz Mahan surrendered his wounded pride to bitterness. He abandoned the Scottites and swore that Carson would watch everything he loved fall.'},
 {eyebrow:'THE FORSAKEN',title:'An army beyond the borders',image:'./maps/mossfang-hollow-wide-v4.png',cast:['kalz'],text:'Kalz gathered the Forsaken—warriors consumed by anger, hunger, and ruin. Under his command, they opened enemy portals across the Four Realms and marched against the towers.'},
 {eyebrow:'THE FIRST PORTAL',title:'Together, they hold the line',image:'./maps/iron-switchback-v2.png',cast:['carson','trevour'],text:'As the first portal burned to life, Carson warned that the battle would take more than strength. Trevour grinned and raised his weapon. “Good thing you brought both of us.”',quote:'Carson and Trevour will always battle together.'}
];

export const chapterOneEpilogueChapters:readonly StoryChapter[]=[
 {eyebrow:'THE LAST BATTLE',title:'Kalz Mahan falls',image:'./maps/helios-breach-v2.png',cast:['kalz'],text:'At the final breach, Carson and Trevour shattered Kalz Mahan’s guard. Black fire swallowed the place where he stood, his armor collapsed into the wreckage, and the portals across the Four Realms began to dim. Every Scottite who witnessed it believed the tyrant had been destroyed.'},
 {eyebrow:'THE VICTORS',title:'The brothers turn toward home',image:'./maps/starfall-dockyard-v2.png',cast:['carson','trevour'],text:'For the first time since the Forsaken killed their parents, Carson and Trevour allowed themselves to believe the war was over. They left the final battlefield together and began the long journey back to the sister who had kept their kingdom alive.'},
 {eyebrow:'THE HEART OF THE KINGDOM',title:'Addisynn prepares their return',image:'./maps/kings-crossing-v2.png',cast:['addisynn'],text:'At home, Addisynn raised the Scottite banners, opened the storehouses for a victory feast, and sent word that the kingdom still stood. After years of carrying the home front, she would finally welcome both of her brothers through its gates.',quote:'The roads held. Now bring my brothers home.',quoteSpeaker:'Addisynn'},
 {eyebrow:'THE ESCAPE',title:'A shadow leaves the ashes',image:'./maps/dreadspire-rift-v2.png',cast:['kalz'],text:'None of the Scottites saw the thread of darkness slip from Kalz’s fallen armor. Broken and alone, he fled through a hidden passage in the portal network, following old memories of the kingdom he had once called home.'},
 {eyebrow:'THE TRICK',title:'A messenger after midnight',image:'./maps/kings-crossing-v2.png',cast:['addisynn-alarmed'],text:'Long after the gates were barred, a wounded courier called to Addisynn from beyond her chamber door. He carried Carson’s seal and spoke with Carson’s voice. Addisynn opened the door—but the seal was only shadow, and the voice belonged to Kalz Mahan.',quote:'Carson would never send that message.',quoteSpeaker:'Addisynn'},
 {eyebrow:'THE TAKING',title:'The chamber goes dark',image:'./maps/dreadspire-rift-v2.png',cast:['addisynn-alarmed','kalz'],text:'Addisynn reached for the alarm as Kalz tore open a narrow rift with the last of his dark magic. She fought him until the room vanished beneath black fire. When the guards broke through, both were gone and only the false seal remained.',quote:'Trevour!',quoteSpeaker:'Addisynn'},
 {eyebrow:'THE RETURN',title:'No celebration waits',image:'./maps/kings-crossing-v2.png',cast:['carson-resolute','trevour-resolute'],text:'Carson and Trevour returned beneath raised banners, expecting their sister at the gate. Instead, they found an untouched feast, a grieving household, and the blackened seal in Addisynn’s empty chamber. The enemy they believed destroyed had stolen the heart of their home.'},
 {eyebrow:'THE TWINBOUND CALL',title:'She is still alive',image:'./maps/iron-switchback-v2.png',cast:['trevour-resolute','carson-resolute'],text:'Trevour closed his hand around the false seal and felt Addisynn reach back through the portal network. For one heartbeat he knew her fear, her courage, and the road carrying her away. Carson studied the fading trail. To bring her home, the brothers would have to fight their way back through every realm.',quote:'She is alive. I can feel her.',quoteSpeaker:'Trevour'}
];

const characterArt:Record<CharacterId,{name:string;src:string}>={
 carson:{name:'Carson',src:'./story/characters/carson-v7.png'},
 trevour:{name:'Trevour',src:'./story/characters/trevour-v2.png'},
 addisynn:{name:'Addisynn',src:'./story/characters/addisynn-v4.png'},
 arabella:{name:'Arabella',src:'./story/characters/arabella-v1.png'},
 kalz:{name:'Kalz Mahan',src:'./story/characters/kalz-mahan-v2.png'},
 'carson-resolute':{name:'Carson',src:'./story/characters/carson-resolute-v1.png'},
 'trevour-resolute':{name:'Trevour',src:'./story/characters/trevour-resolute-v1.png'},
 'addisynn-alarmed':{name:'Addisynn',src:'./story/characters/addisynn-alarmed-v1.png'}
};

function StorySequence({chapters,header,closeLabel,closeText,lastLabel,onClose}:{chapters:readonly StoryChapter[];header:string;closeLabel:string;closeText:string;lastLabel:string;onClose:()=>void}){
 const [chapter,setChapter]=useState(0),current=chapters[chapter],last=chapter===chapters.length-1;
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==='ArrowRight'&&!last)setChapter(value=>value+1);if(event.key==='ArrowLeft'&&chapter>0)setChapter(value=>value-1);if(event.key==='Escape')onClose();};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[chapter,last,onClose]);
 return <div className="story-backdrop"><section className="story-opening" role="dialog" aria-modal="true" aria-labelledby="story-title"><img className="story-map" src={current.image} alt=""/><div className="story-shade"/>{current.cast.length>0&&<div className="story-characters" data-count={current.cast.length}>{current.cast.map((id,index)=>{const character=characterArt[id];return <img key={id+index} src={character.src} alt={character.name}/>;})}</div>}<header><span><BookOpen size={15}/>{header}</span><button onClick={onClose} aria-label={closeLabel}><X size={19}/></button></header><div className="story-copy"><small>{current.eyebrow}</small><h1 id="story-title">{current.title}</h1><p>{current.text}</p>{current.quote&&<blockquote><Shield size={18}/><span>“{current.quote}”{current.quoteSpeaker&&<small> — {current.quoteSpeaker}</small>}</span></blockquote>}</div><footer><button className="story-skip" onClick={onClose}>{closeText}</button><div className="story-progress" aria-label={`Story panel ${chapter+1} of ${chapters.length}`}>{chapters.map((_,index)=><i key={index} className={index===chapter?'active':index<chapter?'seen':''}/>)}</div><div><button disabled={chapter===0} onClick={()=>setChapter(value=>value-1)}><ArrowLeft size={16}/>Back</button><button className="primary" autoFocus onClick={()=>last?onClose():setChapter(value=>value+1)}>{last?lastLabel:'Continue'}<ArrowRight size={16}/></button></div></footer></section></div>;
}

export function StoryOpening({onClose}:{onClose:()=>void}){
 return <StorySequence chapters={openingChapters} header="THE STORY OF CARTREV TOWERS" closeLabel="Skip opening story" closeText="Skip opening" lastLabel="Begin defense" onClose={onClose}/>;
}

export function ChapterOneEpilogue({onClose}:{onClose:()=>void}){
 return <StorySequence chapters={chapterOneEpilogueChapters} header="CHAPTER ONE FINALE · THE FALSE VICTORY" closeLabel="Close chapter one ending" closeText="Close finale" lastLabel="Finish chapter" onClose={onClose}/>;
}
