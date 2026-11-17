type CueKind='build'|'upgrade'|'sell'|'wave'|'auto'|'breach'|'victory'|'defeat';
type SoundName='shot-bolt'|'shot-mortar'|'shot-frost'|'shot-sky'|'shot-storm'|'cue-build'|'cue-upgrade'|'cue-wave'|'cue-breach'|'cue-victory'|'cue-defeat';

const soundNames:SoundName[]=[
 'shot-bolt','shot-mortar','shot-frost','shot-sky','shot-storm',
 'cue-build','cue-upgrade','cue-wave','cue-breach','cue-victory','cue-defeat'
];
const realmSoundNames=['shot-bolt','shot-mortar','shot-frost','shot-sky','shot-storm','shot-monkey','cue-wave','cue-victory','cue-air'];
const heroSoundNames=['shot-carson-1','shot-carson-2','impact-carson-1','impact-carson-2','shot-trevour-1','shot-trevour-2','impact-trevour-1','impact-trevour-2'];

const shotGaps:Record<string,number>={bolt:.075,mortar:.18,frost:.1,sky:.12,storm:.16,monkey:.14};
const shotVolumes:Record<string,number>={bolt:.34,mortar:.46,frost:.3,sky:.34,storm:.38,monkey:.43};

export class PocketAudio {
 private context?:AudioContext;
 private master?:GainNode;
 private effects?:GainNode;
 private buffers=new Map<string,AudioBuffer>();
 private loading?:Promise<void>;
 private enabled=true;
 private volume=1;
 private lastShotAt=-Infinity;
 private lastShotByKind=new Map<string,number>();
 private heroVariation=new Map<string,number>();
 private realm='foundry';

 setRealm(realm:string){this.realm=realm;}

 configure(enabled:boolean,volume=this.volume){
  this.enabled=enabled;
  this.volume=Math.max(0,Math.min(1,volume));
  if(this.master)this.master.gain.value=enabled?.72*this.volume:0;
  if(enabled){
   this.unlock();
  }else if(this.context?.state==='running'){
   void this.context.suspend();
  }
 }

 unlock(){
  if(!this.enabled)return;
  try{
   if(!this.context){
    this.context=new AudioContext();
    this.master=this.context.createGain();
    this.effects=this.context.createGain();
    const compressor=this.context.createDynamicsCompressor();
    this.master.gain.value=.72*this.volume;
    this.effects.gain.value=.5;
    compressor.threshold.value=-24;
    compressor.knee.value=20;
    compressor.ratio.value=6;
    compressor.attack.value=.004;
    compressor.release.value=.18;
    this.effects.connect(compressor);
    compressor.connect(this.master);
    this.master.connect(this.context.destination);
    this.loading=this.loadSounds();
   }
   if(this.context.state==='suspended')void this.context.resume();
  }catch{/* Gameplay must continue without audio. */}
 }

 private async loadSounds(){
  const context=this.context;
  if(!context)return;
  await Promise.all(soundNames.map(async name=>{
   try{
    const response=await fetch(new URL(`audio/${name}.mp3`,document.baseURI));
    if(!response.ok)return;
    this.buffers.set(name,await context.decodeAudioData(await response.arrayBuffer()));
   }catch{/* A missing sound must never interrupt the game. */}
  }));

 }

 private play(name:string,volume:number,rate=1,realmAware=false){
  const context=this.context,effects=this.effects,buffer=(realmAware?this.buffers.get(`${this.realm}/${name}`):undefined)||this.buffers.get(name);
  if(!this.enabled||!context||!effects||!buffer||context.state!=='running')return;
  const source=context.createBufferSource(),gain=context.createGain();
  source.buffer=buffer;
  source.playbackRate.value=rate;
  gain.gain.value=volume;
  source.connect(gain);
  gain.connect(effects);
  source.start();
 }

 shot(kind:string){
  const context=this.context;
  if(!this.enabled||!context||context.state!=='running')return;
  const now=context.currentTime,lastKind=this.lastShotByKind.get(kind)??-Infinity;
  if(now-this.lastShotAt<.045||now-lastKind<(shotGaps[kind]??.09))return;
  this.lastShotAt=now;
  this.lastShotByKind.set(kind,now);
  if(kind==='carson'||kind==='trevour'){
   const variation=this.heroVariation.get(kind)??1;
   const heroName=`heroes/shot-${kind}-${variation}`;
   this.heroVariation.set(kind,variation===1?2:1);
   if(this.buffers.has(heroName)){this.play(heroName,kind==='carson'?.38:.44,.98+Math.random()*.04);return;}
  }
  const name=kind==='monkey'?'shot-monkey':(soundNames.includes(`shot-${kind}` as SoundName)?`shot-${kind}`:'shot-bolt');
  this.play(name,shotVolumes[kind]??.32,.97+Math.random()*.06,true);
 }

 cue(kind:CueKind){
  if(kind==='sell'){
   this.play('cue-build',.36,.84);
   return;
  }
  if(kind==='auto'){
   this.play('cue-wave',.48,1.08);
   return;
  }
  const name=`cue-${kind}` as SoundName;
  const volume=kind==='breach'?.58:kind==='victory'||kind==='defeat'?.66:.52;
  this.play(name,volume,1,kind==='wave'||kind==='victory');
 }
}
