export type PocketMusicMode='intro'|'menu'|'foundry'|'medieval'|'monster'|'space';

export const pocketMusicTracks:Record<PocketMusicMode,string>={
 intro:'./audio/music/brothers-adventure-intro.ogg',
 menu:'./audio/music/kingdom-menu.ogg',
 foundry:'./audio/music/foundry-battle.ogg',
 medieval:'./audio/music/medieval-battle.ogg',
 monster:'./audio/music/monster-battle.ogg',
 space:'./audio/music/space-battle.ogg'
};

const trackLevels:Record<PocketMusicMode,number>={intro:.24,menu:.18,foundry:.2,medieval:.2,monster:.2,space:.2};

export class PocketMusic {
 private audio?:HTMLAudioElement;
 private mode?:PocketMusicMode;
 private enabled=false;
 private active=false;
 private volume=1;

 configure(mode:PocketMusicMode|null,enabled:boolean,volume=this.volume){
  this.enabled=enabled;
  this.volume=Math.max(0,Math.min(1,volume));
  this.active=mode!==null;
  if(mode&&mode!==this.mode){this.release();this.mode=mode;}
  if(this.audio&&mode)this.audio.volume=trackLevels[mode]*this.volume;
  if(!enabled||!mode){this.audio?.pause();return;}
  if(!this.audio){
   this.audio=new Audio(pocketMusicTracks[mode]);
   this.audio.loop=true;
   this.audio.preload='auto';
   this.audio.volume=trackLevels[mode]*this.volume;
  }
  this.unlock();
 }

 unlock(){
  if(!this.enabled||!this.active||!this.audio?.paused)return;
  void this.audio.play().catch(()=>{});
 }

 private release(){
  if(!this.audio)return;
  this.audio.pause();
  this.audio.removeAttribute('src');
  this.audio.load();
  this.audio=undefined;
 }

 close(){this.release();this.mode=undefined;this.active=false;this.enabled=false;}
}
