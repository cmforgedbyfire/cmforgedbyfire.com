import {Gauge,MonitorCog,Music2,RotateCcw,SlidersHorizontal,Volume2,VolumeX,X} from 'lucide-react';
import {defaultPocketSettings,type PocketSettings,type VisualQuality} from './game/settings';
import './settings.css';

type Props={
 settings:PocketSettings;
 soundEnabled:boolean;
 onSoundEnabled:(enabled:boolean)=>void;
 onChange:(settings:PocketSettings)=>void;
 onClose:()=>void;
};

const percent=(value:number)=>Math.round(value*100);
const qualityOptions:[VisualQuality,string,string][]=[
 ['auto','Auto','Balances quality for this device'],
 ['quality','Quality','Sharper rendering and full frame rate'],
 ['performance','Performance','Lower rendering load and steadier play'],
];

export default function SettingsDialog({settings,soundEnabled,onSoundEnabled,onChange,onClose}:Props){
 const update=<K extends keyof PocketSettings>(key:K,value:PocketSettings[K])=>onChange({...settings,[key]:value});
 return <div className="settings-backdrop" role="presentation"><section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
  <header><div><small>PHONE OPTIONS</small><h2 id="settings-title"><SlidersHorizontal size={22}/>Settings</h2></div><button className="settings-close" type="button" aria-label="Close settings" onClick={onClose}><X size={20}/></button></header>
  <div className="settings-scroll">
   <section className="settings-group" aria-labelledby="audio-settings-title">
    <div className="settings-group-title"><Volume2 size={19}/><div><h3 id="audio-settings-title">Audio</h3><p>The game always starts muted. Your volume levels are remembered.</p></div></div>
    <div className="settings-master"><span><strong>Master audio</strong><small>{soundEnabled?'Music and effects are on':'Muted'}</small></span><button type="button" className={soundEnabled?'enabled':''} aria-pressed={soundEnabled} onClick={()=>onSoundEnabled(!soundEnabled)}>{soundEnabled?<><Volume2 size={18}/>On</>:<><VolumeX size={18}/>Off</>}</button></div>
    <label className="settings-slider"><span><Music2 size={17}/><strong>Music</strong><output>{percent(settings.musicVolume)}%</output></span><input aria-label="Music volume" type="range" min="0" max="100" step="5" value={percent(settings.musicVolume)} onChange={event=>update('musicVolume',Number(event.target.value)/100)}/></label>
    <label className="settings-slider"><span><Volume2 size={17}/><strong>Sound effects</strong><output>{percent(settings.effectsVolume)}%</output></span><input aria-label="Sound effects volume" type="range" min="0" max="100" step="5" value={percent(settings.effectsVolume)} onChange={event=>update('effectsVolume',Number(event.target.value)/100)}/></label>
   </section>
   <section className="settings-group" aria-labelledby="video-settings-title">
    <div className="settings-group-title"><MonitorCog size={19}/><div><h3 id="video-settings-title">Graphics</h3><p>Choose clarity or reduce battery and graphics load.</p></div></div>
    <div className="quality-options" role="radiogroup" aria-label="Graphics quality">{qualityOptions.map(([value,label,description])=><button key={value} type="button" role="radio" aria-checked={settings.visualQuality===value} className={settings.visualQuality===value?'selected':''} onClick={()=>update('visualQuality',value)}><Gauge size={17}/><span><strong>{label}</strong><small>{description}</small></span></button>)}</div>
    <label className="settings-toggle"><span><strong>Reduced motion</strong><small>Stops decorative movement while keeping gameplay readable.</small></span><input type="checkbox" checked={settings.reducedMotion} onChange={event=>update('reducedMotion',event.target.checked)}/></label>
    <label className="settings-toggle"><span><strong>Reduced visual effects</strong><small>Removes extra glows and animated tower auras.</small></span><input type="checkbox" checked={settings.reducedEffects} onChange={event=>update('reducedEffects',event.target.checked)}/></label>
   </section>
  </div>
  <footer><button type="button" className="settings-reset" onClick={()=>onChange({...defaultPocketSettings})}><RotateCcw size={16}/>Reset defaults</button><button type="button" className="settings-done" onClick={onClose}>Done</button></footer>
 </section></div>;
}
