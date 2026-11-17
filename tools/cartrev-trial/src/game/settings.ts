export type VisualQuality='auto'|'quality'|'performance';

export type PocketSettings={
 musicVolume:number;
 effectsVolume:number;
 visualQuality:VisualQuality;
 reducedMotion:boolean;
 reducedEffects:boolean;
};

export const SETTINGS_KEY='cartrev-pocket-settings-v1';
export const defaultPocketSettings:PocketSettings={
 musicVolume:1,
 effectsVolume:1,
 visualQuality:'auto',
 reducedMotion:false,
 reducedEffects:false,
};

const clampVolume=(value:unknown,fallback:number)=>typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(1,value)):fallback;

export function readPocketSettings():PocketSettings{
 try{
  const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null') as Partial<PocketSettings>|null;
  if(!saved)return {...defaultPocketSettings};
  const visualQuality:VisualQuality=saved.visualQuality==='quality'||saved.visualQuality==='performance'?saved.visualQuality:'auto';
  return {
   musicVolume:clampVolume(saved.musicVolume,defaultPocketSettings.musicVolume),
   effectsVolume:clampVolume(saved.effectsVolume,defaultPocketSettings.effectsVolume),
   visualQuality,
   reducedMotion:saved.reducedMotion===true,
   reducedEffects:saved.reducedEffects===true,
  };
 }catch{return {...defaultPocketSettings};}
}

export function writePocketSettings(settings:PocketSettings){
 localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));
 return settings;
}
