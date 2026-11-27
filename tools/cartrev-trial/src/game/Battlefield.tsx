import {baseOutline} from './basePlacement';
import {placement,towerPosition} from './placement';
import { useEffect, useRef, useState } from "react";
import {
  enemyColor,
  enemyFlying,
  enemyUsesDirectRoute,
  routePosition,
  towerDefinitions,
} from "./engine";
import {
  realmTowerImage,
  towerHeadPose,
  towerVisualScale,
} from "./realmTowerArt";
import {
  drawFoundryHelicopterRotor,
  foundryEnemyArtwork,
  foundryEnemySizes,
  preloadFoundryEnemies,
} from "./foundryEnemyArt";
import {medievalEnemyArtwork,medievalEnemySizes,preloadMedievalEnemies} from './medievalEnemyArt';
import {monsterEnemyArtwork,monsterEnemySizes,preloadMonsterEnemies} from './monsterEnemyArt';
import {spaceEnemyArtwork,spaceEnemySizes,preloadSpaceEnemies} from './spaceEnemyArt';
import {heroFacing,heroTowerImage} from './heroTowerArt';
import { pickBattlefieldTarget } from "./selection";
import type {VisualQuality} from './settings';
import type { EnemyKind, GameState, PocketMap, Shot, TowerKind } from "./types";

type Props = {
  map: PocketMap;
  state: GameState;
  placementKind: TowerKind | null;
  selectedTower: number | null;
  visualQuality:VisualQuality;
  reducedMotionSetting:boolean;
  reducedEffects:boolean;
  onPlace: (x:number,y:number) => void;
  onPreview: (message:string) => void;
  onTower: (id: number) => void;
  onClear: () => void;
};

const towerImages = new Map<string, HTMLImageElement>();
function towerImage(kind: TowerKind, level: number, part: "base" | "head",realm:PocketMap['realm']='foundry') {
  const key = `${realm}-${kind}-${level}-${part}`;
  let image = towerImages.get(key);
  if (image) return image;
  image = new Image();
  image.src = realmTowerImage(kind, level, realm, part);
  towerImages.set(key, image);
  return image;
}

const clamp01=(value:number)=>Math.max(0,Math.min(1,value));
const shotProgress=(shot:Shot,duration:number)=>1-clamp01(shot.life/(shot.duration||duration));
const nativeRuntime=()=>Boolean((window as Window&{Capacitor?:{isNativePlatform?:()=>boolean}}).Capacitor?.isNativePlatform?.());

function drawMedievalImpact(ctx:CanvasRenderingContext2D,shot:Shot,progress:number,angle:number){
  if(progress<.68)return;
  const impact=clamp01((progress-.68)/.32),fade=1-impact,x=shot.to[0],y=shot.to[1],seed=shot.id*.73;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=fade;
  if(shot.kind==='mortar'){
    ctx.fillStyle='#f29a42';ctx.shadowColor='#ffb45f';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(0,0,6+impact*30,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#ffe0a1';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,9+impact*42,0,Math.PI*2);ctx.stroke();
    ctx.shadowBlur=0;for(let i=0;i<7;i++){const a=seed+i*Math.PI*2/7,d=12+impact*39;ctx.fillStyle=i%2?'#8d785a':'#d5b178';ctx.beginPath();ctx.arc(Math.cos(a)*d,Math.sin(a)*d,3+impact*3,0,Math.PI*2);ctx.fill();}
  }else if(shot.kind==='frost'){
    ctx.fillStyle='#7de7dc33';ctx.beginPath();ctx.arc(0,0,8+impact*28,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#c6fff8';ctx.lineWidth=3;for(let i=0;i<6;i++){const a=i*Math.PI/3,d=7+impact*26;ctx.beginPath();ctx.moveTo(Math.cos(a)*4,Math.sin(a)*4);ctx.lineTo(Math.cos(a)*d,Math.sin(a)*d);ctx.stroke();}
  }else if(shot.kind==='bolt'||shot.kind==='sky'){
    ctx.rotate(angle);ctx.strokeStyle=shot.kind==='sky'?'#e4d9ff':'#f0d29c';ctx.lineWidth=2.5;
    for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(-12-impact*13,side*(5+impact*10));ctx.stroke();}
    ctx.fillStyle='#fff3d0';ctx.beginPath();ctx.arc(0,0,2+impact*3,0,Math.PI*2);ctx.fill();
  }else if(shot.kind==='monkey'){
    ctx.strokeStyle='#ffc06d';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,4+impact*13,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#ffe0a3';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

function drawMonsterImpact(ctx:CanvasRenderingContext2D,shot:Shot,progress:number){
  if(progress<.7)return;
  const impact=clamp01((progress-.7)/.3),fade=1-impact,x=shot.to[0],y=shot.to[1];
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=fade;
  const color=shot.kind==='bolt'?'#b8ee78':shot.kind==='frost'?'#a9f4ff':shot.kind==='sky'?'#d7b6ff':shot.kind==='storm'?'#fff08a':shot.kind==='monkey'?'#ffc277':'#eda8ef';
  ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.shadowColor=color;ctx.shadowBlur=12;
  if(shot.kind==='frost'){
    for(let i=0;i<8;i++){const a=i*Math.PI/4,d=8+impact*27;ctx.beginPath();ctx.moveTo(Math.cos(a)*4,Math.sin(a)*4);ctx.lineTo(Math.cos(a)*d,Math.sin(a)*d);ctx.stroke();}
  }else if(shot.kind==='bolt'){
    for(let i=0;i<7;i++){const a=i*Math.PI*2/7+shot.id*.21,d=9+impact*29;ctx.beginPath();ctx.moveTo(Math.cos(a)*5,Math.sin(a)*5);ctx.lineTo(Math.cos(a)*d,Math.sin(a)*d);ctx.stroke();}
  }else{
    ctx.beginPath();ctx.arc(0,0,5+impact*25,0,Math.PI*2);ctx.stroke();
    if(shot.kind==='sky'){ctx.globalAlpha=fade*.7;ctx.beginPath();ctx.arc(0,0,12+impact*35,Math.PI*.15,Math.PI*1.55);ctx.stroke();}
    for(let i=0;i<6;i++){const a=i*Math.PI/3+shot.id*.31,d=7+impact*25;ctx.fillStyle=color;ctx.beginPath();ctx.arc(Math.cos(a)*d,Math.sin(a)*d,2.5,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
}

function drawMonsterProjectile(ctx:CanvasRenderingContext2D,shot:Shot,progress:number,time:number){
  const rawDx=shot.to[0]-shot.from[0],rawDy=shot.to[1]-shot.from[1],angle=Math.atan2(rawDy,rawDx),dx=Math.cos(angle),dy=Math.sin(angle),arc=Math.sin(progress*Math.PI)*(shot.kind==='frost'?18:shot.kind==='sky'?8:4),x=shot.from[0]+rawDx*progress,y=shot.from[1]+rawDy*progress-arc;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=.97;
  if(shot.kind==='bolt'){
    ctx.shadowColor='#b8ee78';ctx.shadowBlur=9;ctx.strokeStyle='#25391f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-17,0);ctx.lineTo(10,0);ctx.stroke();ctx.strokeStyle='#c9f39a';ctx.lineWidth=2;ctx.stroke();
    for(const sx of [-11,-3]){for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx-5,side*6);ctx.stroke();}}
    ctx.fillStyle='#f1ffd9';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(5,-4);ctx.lineTo(5,4);ctx.closePath();ctx.fill();
  }else if(shot.kind==='sky'){
    ctx.shadowColor='#c390ff';ctx.shadowBlur=18;const orb=ctx.createRadialGradient(-3,-2,1,0,0,13);orb.addColorStop(0,'#ffffff');orb.addColorStop(.28,'#e8d4ff');orb.addColorStop(.68,'#a969dc');orb.addColorStop(1,'#5a2b8200');ctx.fillStyle=orb;ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#f6eaff';ctx.lineWidth=2;ctx.rotate(time*.008+shot.id);ctx.beginPath();ctx.ellipse(0,0,17,7,0,0,Math.PI*2);ctx.stroke();
  }else{
    ctx.shadowColor='#7de7f3';ctx.shadowBlur=17;ctx.fillStyle='#c8fbff';ctx.beginPath();ctx.arc(2,0,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#efffff';ctx.lineWidth=2;
    for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(-3,side*3);ctx.quadraticCurveTo(-13,side*(10+Math.sin(time*.018+shot.id)*3),-22,side*5);ctx.stroke();}
    ctx.fillStyle='#315f77';ctx.beginPath();ctx.arc(4,-2,1.2,0,Math.PI*2);ctx.arc(4,2,1.2,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();drawMonsterImpact(ctx,shot,progress);
}

function monsterEnemyMotion(kind:EnemyKind,time:number,id:number,reduced:boolean){
  const airborne=kind==='flyer'||kind==='airship';
  if(reduced)return {bob:airborne?-7:0,tilt:0,scaleX:1,scaleY:1,step:0};
  const phase=time*(kind==='runner'?.015:airborne?.01:kind==='boss'?.0045:.007)+id*.91,sine=Math.sin(phase),step=Math.abs(Math.sin(phase*1.7));
  if(kind==='crawler')return {bob:sine*1.4,tilt:sine*.045,scaleX:1+sine*.07,scaleY:1-sine*.055,step};
  if(kind==='runner')return {bob:-step*3.2,tilt:sine*.075,scaleX:1+step*.035,scaleY:1-step*.035,step};
  if(kind==='armored')return {bob:-step*1.25,tilt:sine*.022,scaleX:1,scaleY:1,step};
  if(airborne)return {bob:-9+sine*(kind==='airship'?2.5:5.5),tilt:sine*(kind==='airship'?.035:.09),scaleX:1+Math.cos(phase*1.35)*.025,scaleY:1-Math.cos(phase*1.35)*.025,step};
  return {bob:-step*1.8,tilt:sine*.018,scaleX:1+Math.sin(phase*.7)*.018,scaleY:1+Math.sin(phase*.7)*.018,step};
}

function drawMonsterEnemyShadow(ctx:CanvasRenderingContext2D,kind:EnemyKind,x:number,y:number,angle:number,size:number,motion:ReturnType<typeof monsterEnemyMotion>){
  const airborne=kind==='flyer'||kind==='airship';ctx.save();ctx.translate(x,y+(airborne?12:8));ctx.rotate(angle);ctx.globalAlpha=airborne?.24:.38;
  ctx.fillStyle=kind==='boss'?'#250f2d':'#06100d';ctx.shadowColor=kind==='boss'?'#d56be0':'#020706';ctx.shadowBlur=kind==='boss'?12:6;
  const lift=airborne?Math.max(.62,1-(Math.abs(motion.bob)+4)/42):1;
  ctx.beginPath();ctx.ellipse(0,0,size*(kind==='boss'?.39:.34)*lift,size*(kind==='boss'?.17:.14)*lift,0,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawMonsterTowerAura(ctx:CanvasRenderingContext2D,kind:TowerKind,level:number,time:number,id:number,reduced:boolean){
  const pulse=reduced ? .5 : .5+Math.sin(time*.006+id)*.5,color=kind==='frost'?'#92eff2':kind==='sky'?'#c493ff':kind==='storm'?'#f2dc72':kind==='mortar'?'#d484d7':'#a8dd72';
  ctx.save();ctx.globalAlpha=.12+pulse*.12;ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=10+level*2;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(0,0,26+level*2+pulse*3,0,Math.PI*2);ctx.stroke();
  if(kind==='mortar'||kind==='frost')for(let i=0;i<level+1;i++){const a=time*.0007*(kind==='frost'?-1:1)+i*Math.PI*2/(level+1);ctx.fillStyle=color;ctx.beginPath();ctx.arc(Math.cos(a)*(22+level*2),Math.sin(a)*(15+level),2+i*.35,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

function spaceEnemyMotion(kind:EnemyKind,time:number,id:number,reduced:boolean){
  const airborne=kind==='flyer'||kind==='airship';
  if(reduced)return {bob:airborne?-8:kind==='runner'?-2:0,tilt:0};
  const phase=time*(kind==='runner'?.016:airborne?.009:.006)+id*.83;
  return {bob:airborne?-9+Math.sin(phase)*(kind==='airship'?2.25:4.5):kind==='runner'?-2+Math.sin(phase)*1.4:Math.sin(phase)*.7,tilt:airborne?Math.sin(phase*.8)*(kind==='airship'?.025:.055):Math.sin(phase)*.018};
}

function drawSpaceEnemyShadow(ctx:CanvasRenderingContext2D,kind:EnemyKind,x:number,y:number,angle:number,size:number,bob:number,performanceMode=false){
  const airborne=kind==='flyer'||kind==='airship';ctx.save();ctx.translate(x,y+(airborne?13:8));ctx.rotate(angle);ctx.globalAlpha=airborne?.2:.38;ctx.fillStyle='#020711';ctx.shadowColor='#60cfff';ctx.shadowBlur=performanceMode?0:airborne?10:4;
  const lift=airborne?Math.max(.58,1-(Math.abs(bob)+4)/45):1;ctx.beginPath();ctx.ellipse(0,0,size*(kind==='boss'?.4:.34)*lift,size*(kind==='boss'?.18:.14)*lift,0,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawSpaceTowerAura(ctx:CanvasRenderingContext2D,kind:TowerKind,level:number,time:number,id:number,reduced:boolean,performanceMode=false){
  const pulse=reduced?.5:.5+Math.sin(time*.007+id)*.5,color=kind==='mortar'?'#ffbd71':kind==='frost'?'#bc9cff':kind==='sky'?'#8ff3ce':kind==='storm'?'#f8e879':'#70e4ff';
  ctx.save();ctx.globalAlpha=.12+pulse*.1;ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=performanceMode?0:9+level*2;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(0,2,24+level*2+pulse*2,17+level+pulse,0,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<level;i++){const a=(reduced?0:time*.0012)+i*Math.PI*2/Math.max(1,level);ctx.fillStyle=color;ctx.beginPath();ctx.arc(Math.cos(a)*(22+level),Math.sin(a)*(13+level),1.8,0,Math.PI*2);ctx.fill();}ctx.restore();
}

function drawSpaceImpact(ctx:CanvasRenderingContext2D,shot:Shot,progress:number,performanceMode=false){
  if(progress<.7)return;const impact=clamp01((progress-.7)/.3),fade=1-impact,color=shot.kind==='mortar'?'#ffbd71':shot.kind==='frost'?'#bc9cff':shot.kind==='sky'?'#8ff3ce':shot.kind==='storm'?'#f8e879':'#70e4ff';
  ctx.save();ctx.translate(...shot.to);ctx.globalAlpha=fade;ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=performanceMode?0:14;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,0,6+impact*31,4+impact*20,shot.id*.17,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,3+impact*17,0,Math.PI*2);ctx.stroke();ctx.restore();
}

function drawSpaceProjectile(ctx:CanvasRenderingContext2D,shot:Shot,progress:number,performanceMode=false){
  const rawDx=shot.to[0]-shot.from[0],rawDy=shot.to[1]-shot.from[1],angle=Math.atan2(rawDy,rawDx),dx=Math.cos(angle),dy=Math.sin(angle),arc=shot.kind==='frost'?Math.sin(progress*Math.PI)*13:0,x=shot.from[0]+rawDx*progress,y=shot.from[1]+rawDy*progress-arc,color=shot.kind==='frost'?'#bc9cff':shot.kind==='sky'?'#8ff3ce':'#70e4ff';
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=.97;ctx.shadowColor=color;ctx.shadowBlur=performanceMode?0:15;
  if(shot.kind==='sky'){ctx.strokeStyle='#d8fff2';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-27,0);ctx.lineTo(8,0);ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#efffff';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(4,-5);ctx.lineTo(4,5);ctx.closePath();ctx.fill();}
  else if(shot.kind==='frost'){ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,0,11,7,progress*7,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f2eaff';ctx.beginPath();ctx.arc(0,0,4.5,0,Math.PI*2);ctx.fill();}
  else{ctx.strokeStyle='#bff6ff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(5,0);ctx.stroke();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(6,0,4,0,Math.PI*2);ctx.fill();}
  ctx.restore();drawSpaceImpact(ctx,shot,progress,performanceMode);
}

function enemyShape(
  ctx: CanvasRenderingContext2D,
  kind: EnemyKind,
  radius: number,
  color: string,
  time: number,
  seed: number,
) {
  const edge = "#10191b",
    steel = "#344a53",
    light = "#ffe2a0",
    pulse = 0.7 + Math.sin(time * 0.009 + seed) * 0.3;
  const armor = ctx.createLinearGradient(-radius, -radius, radius, radius);
  armor.addColorStop(0, "#f2f4e055");
  armor.addColorStop(0.25, color);
  armor.addColorStop(0.72, color);
  armor.addColorStop(1, "#05090988");
  ctx.fillStyle = "#06100dcc";
  ctx.beginPath();
  ctx.ellipse(0, 7, radius + 7, radius * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = 2.4;
  if (kind === "flyer") {
    const flap = Math.sin(time * 0.012 + seed) * 3;
    ctx.globalAlpha = 0.36;
    ctx.fillStyle = "#9eeeff";
    for (const y of [-8, 8]) {
      ctx.beginPath();
      ctx.moveTo(-radius - 6, y);
      ctx.lineTo(-radius - 18 - Math.abs(flap), y - 3);
      ctx.lineTo(-radius - 18 - Math.abs(flap), y + 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = armor;
    ctx.beginPath();
    ctx.moveTo(-radius - 5, 0);
    ctx.lineTo(-6, -7);
    ctx.lineTo(-2, -radius - 5 - flap);
    ctx.lineTo(7, -9);
    ctx.lineTo(radius + 10, -radius * 0.52);
    ctx.lineTo(radius - 2, 0);
    ctx.lineTo(radius + 10, radius * 0.52);
    ctx.lineTo(7, 9);
    ctx.lineTo(-2, radius + 5 + flap);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#263447";
    ctx.beginPath();
    ctx.ellipse(2, 0, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = `rgba(190,246,255,${0.72 + 0.28 * pulse})`;
    ctx.beginPath();
    ctx.arc(4, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d8f8ff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-7, -5);
    ctx.lineTo(15, -11);
    ctx.moveTo(-7, 5);
    ctx.lineTo(15, 11);
    ctx.stroke();
    ctx.fillStyle = `rgba(255,126,74,${0.55 + 0.4 * pulse})`;
    for (const y of [-7, 7]) {
      ctx.beginPath();
      ctx.ellipse(-radius - 5, y, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "runner") {
    ctx.fillStyle = "#16252b";
    for (const y of [-radius * 0.58, radius * 0.58]) {
      ctx.beginPath();
      ctx.roundRect(-radius * 0.7, y - 3, radius * 1.35, 6, 3);
      ctx.fill();
    }
    ctx.fillStyle = armor;
    ctx.beginPath();
    ctx.moveTo(-radius, -radius * 0.48);
    ctx.lineTo(radius * 0.25, -radius * 0.72);
    ctx.lineTo(radius, radius * -0.34);
    ctx.lineTo(radius, radius * 0.34);
    ctx.lineTo(radius * 0.25, radius * 0.72);
    ctx.lineTo(-radius, radius * 0.48);
    ctx.lineTo(-radius * 0.72, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#24383f";
    ctx.beginPath();
    ctx.moveTo(-5, -9);
    ctx.lineTo(9, -7);
    ctx.lineTo(14, 0);
    ctx.lineTo(9, 7);
    ctx.lineTo(-5, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#8be8ef";
    ctx.fillRect(-radius - 4, -5, 5, 10);
    ctx.fillStyle = light;
    ctx.fillRect(radius - 4, -6, 3, 4);
    ctx.fillRect(radius - 4, 2, 3, 4);
    ctx.strokeStyle = "#d5eff1aa";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.62, -radius * 0.34);
    ctx.lineTo(radius * 0.35, -radius * 0.52);
    ctx.moveTo(-radius * 0.62, radius * 0.34);
    ctx.lineTo(radius * 0.35, radius * 0.52);
    ctx.stroke();
  } else if (kind === "armored") {
    ctx.fillStyle = "#182328";
    for (const y of [-radius * 0.68, radius * 0.68]) {
      ctx.beginPath();
      ctx.roundRect(-radius - 3, y - 5, radius * 2 + 6, 10, 4);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#687b83";
      ctx.lineWidth = 1;
      for (let x = -radius + 2; x < radius; x += 7) {
        ctx.beginPath();
        ctx.moveTo(x, y - 4);
        ctx.lineTo(x, y + 4);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2.4;
    ctx.fillStyle = armor;
    ctx.beginPath();
    ctx.moveTo(-radius, -radius * 0.5);
    ctx.lineTo(-radius * 0.55, -radius * 0.78);
    ctx.lineTo(radius * 0.68, -radius * 0.58);
    ctx.lineTo(radius, radius * 0.38);
    ctx.lineTo(radius * 0.5, radius * 0.68);
    ctx.lineTo(-radius * 0.72, radius * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = steel;
    ctx.beginPath();
    ctx.arc(1, 0, radius * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#aebcc0";
    ctx.fillRect(2, -3, radius + 8, 6);
    ctx.strokeRect(2, -3, radius + 8, 6);
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#cfd9d1";
    for (const [x, y] of [
      [-radius * 0.65, -radius * 0.38],
      [radius * 0.48, -radius * 0.35],
      [-radius * 0.58, radius * 0.35],
      [radius * 0.42, radius * 0.3],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "boss") {
    ctx.globalAlpha = 0.22 + 0.13 * pulse;
    ctx.fillStyle = "#ff684b";
    ctx.beginPath();
    ctx.arc(0, 0, radius + 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#172126";
    for (const y of [-radius * 0.72, radius * 0.72]) {
      ctx.beginPath();
      ctx.roundRect(-radius - 7, y - 7, radius * 2 + 14, 14, 5);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#819096";
      ctx.lineWidth = 1.3;
      for (let x = -radius + 1; x < radius; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x, y + 6);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = "#321c18";
    ctx.lineWidth = 3;
    ctx.fillStyle = armor;
    ctx.beginPath();
    ctx.moveTo(-radius, -radius * 0.52);
    ctx.lineTo(-radius * 0.58, -radius * 0.8);
    ctx.lineTo(radius * 0.62, -radius * 0.72);
    ctx.lineTo(radius, radius * 0.5);
    ctx.lineTo(radius * 0.54, radius * 0.78);
    ctx.lineTo(-radius * 0.68, radius * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#71352e";
    ctx.beginPath();
    ctx.arc(-1, 0, radius * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#b8c5c5";
    ctx.fillRect(4, -4, radius + 13, 8);
    ctx.strokeRect(4, -4, radius + 13, 8);
    ctx.fillStyle = `rgba(255,226,162,${0.72 + 0.28 * pulse})`;
    ctx.beginPath();
    ctx.arc(-2, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffe0a1";
    ctx.lineWidth = 2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12);
      ctx.lineTo(Math.cos(a) * 18, Math.sin(a) * 18);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "#172328";
    for (const [x, y] of [
      [-radius * 0.55, -radius * 0.68],
      [0, -radius * 0.68],
      [radius * 0.55, -radius * 0.68],
      [-radius * 0.55, radius * 0.68],
      [0, radius * 0.68],
      [radius * 0.55, radius * 0.68],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = armor;
    ctx.beginPath();
    ctx.roundRect(-radius, -radius * 0.58, radius * 2, radius * 1.16, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = steel;
    ctx.beginPath();
    ctx.roundRect(
      -radius * 0.78,
      -radius * 0.43,
      radius * 0.82,
      radius * 0.86,
      3,
    );
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#18282f";
    ctx.fillRect(-radius * 0.62, -radius * 0.32, radius * 0.42, radius * 0.64);
    ctx.fillStyle = "#bd7b3c";
    ctx.fillRect(radius * 0.08, -radius * 0.42, radius * 0.57, radius * 0.84);
    ctx.strokeRect(radius * 0.08, -radius * 0.42, radius * 0.57, radius * 0.84);
    ctx.fillStyle = light;
    ctx.fillRect(radius * 0.72, -radius * 0.36, 4, 5);
    ctx.fillRect(radius * 0.72, radius * 0.2, 4, 5);
    ctx.strokeStyle = "#f2c77f";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(radius * 0.15, 0);
    ctx.lineTo(radius * 0.58, 0);
    ctx.stroke();
    ctx.strokeStyle = "#d8e0d166";
    ctx.lineWidth = 1;
    for (const y of [-radius * 0.68, radius * 0.68]) {
      ctx.beginPath();
      ctx.moveTo(-radius * 0.9, y);
      ctx.lineTo(radius * 0.9, y);
      ctx.stroke();
    }
  }
}

export function Battlefield({
  map,
  state,
  placementKind,
  selectedTower,
  visualQuality,
  reducedMotionSetting,
  reducedEffects,
  onPlace,
  onPreview,
  onTower,
  onClear,
}: Props) {
  const performanceMode=visualQuality==='performance'||(visualQuality==='auto'&&map.realm==='space'&&nativeRuntime());
  const systemReducedMotion=useRef(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const reducedMotion=reducedMotionSetting||systemReducedMotion.current;
  const lowEffects=reducedEffects||performanceMode;
  const canvas = useRef<HTMLCanvasElement>(null),
    background = useRef<HTMLImageElement | null>(null),
    enemyPortal = useRef<HTMLImageElement | null>(null),
    friendlyPortal = useRef<HTMLImageElement | null>(null);
  const pointer=useRef<{x:number;y:number}|null>(null);
  const pointerStart = useRef<{id:number;x:number;y:number}|null>(null);
  const stateRef=useRef(state),placementKindRef=useRef(placementKind),selectedTowerRef=useRef(selectedTower);
  stateRef.current=state;
  placementKindRef.current=placementKind;
  selectedTowerRef.current=selectedTower;
  const [loadedArtwork, setLoadedArtwork] = useState(""),
    [enemyArtworkLoaded,setEnemyArtworkLoaded]=useState(false);
  useEffect(()=>{
    let active=true;
    setEnemyArtworkLoaded(false);
    const preload=map.realm==='medieval'?preloadMedievalEnemies():map.realm==='monster'?preloadMonsterEnemies():map.realm==='space'?preloadSpaceEnemies():preloadFoundryEnemies();
    preload.then(()=>{if(active)setEnemyArtworkLoaded(true);}).catch(()=>{if(active)setEnemyArtworkLoaded(false);});
    return()=>{active=false;};
  },[map.realm]);
  useEffect(() => {
    let active = true;
    background.current=null;
    setLoadedArtwork("");
    const image = new Image();
    image.onload = () => {
      if (active){background.current=image;setLoadedArtwork(map.artwork);}
    };
    image.src = `./maps/${map.artwork}`;
    return () => {
      active = false;
    };
  }, [map.artwork]);
  useEffect(() => {
    for (const [ref, src] of [
      [enemyPortal, "./portals/enemy-v1.png"],
      [friendlyPortal, "./portals/friendly-v1.png"],
    ] as const) {
      const image = new Image();
      image.onload = () => {
        ref.current = image;
      };
      image.src = src;
    }
  }, []);
  useEffect(() => {
    let frame = 0,lastPaint=0;
    const paint = (time: number) => {
      if(performanceMode&&time-lastPaint<40){frame=requestAnimationFrame(paint);return;}
      lastPaint=time;
      const element = canvas.current;
      if (!element) return;
      const state=stateRef.current,
        placementKind=placementKindRef.current,
        selectedTower=selectedTowerRef.current;
      const rect = element.getBoundingClientRect(),
        ratio = performanceMode?1:Math.min(2, window.devicePixelRatio || 1);
      const pixelWidth = Math.round(rect.width * ratio),
        pixelHeight = Math.round(rect.height * ratio);
      if (element.width !== pixelWidth || element.height !== pixelHeight) {
        element.width = pixelWidth;
        element.height = pixelHeight;
      }
      const width = map.width || 960,
        height = map.height || 576,
        ctx = element.getContext("2d")!;
      ctx.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if(background.current)ctx.drawImage(background.current,0,0,width,height);
      else{ctx.fillStyle="#243127";ctx.fillRect(0,0,width,height);}
      const first = map.route[0],
        last = map.route.at(-1)!;
      for (const [image, point] of [
        [enemyPortal.current, first],
        [friendlyPortal.current, last],
      ] as const)
        if (image) ctx.drawImage(image, point[0] - 42, point[1] - 42, 84, 84);
      const selected = state.towers.find((tower) => tower.id === selectedTower);
      if (selected) {
        const site = towerPosition(map,selected),
          def = towerDefinitions[selected.kind];
        if (site) {
          ctx.fillStyle = def.color + "22";
          ctx.strokeStyle = def.color + "aa";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(
            site[2],
            site[3],
            def.range * (1 + (selected.level - 1) * 0.08),
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.stroke();
        }
      }
      const cursor=pointer.current;
      element.dataset.placementHint='';
      if(placementKind&&cursor){
        const hint=placement(map,state,cursor.x,cursor.y,placementKind),color=hint.allowed?'#93eed1':'#ff927d';
        element.dataset.placementHint=hint.reason;element.dataset.placementAllowed=String(hint.allowed);
        ctx.save();ctx.fillStyle=color+'16';ctx.strokeStyle=color+'80';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cursor.x,cursor.y,towerDefinitions[placementKind].range,0,Math.PI*2);ctx.fill();ctx.stroke();
        const ghost=towerImage(placementKind,1,'base',map.realm),head=towerImage(placementKind,1,'head',map.realm),size=map.towerSize||60;
        ctx.globalAlpha=.65;if(ghost.complete&&ghost.naturalWidth)ctx.drawImage(ghost,cursor.x-size/2,cursor.y-size/2,size,size);if(head.complete&&head.naturalWidth)ctx.drawImage(head,cursor.x-size/2,cursor.y-size/2,size,size);ctx.globalAlpha=1;
        const outline=baseOutline(map,placementKind,1,cursor.x,cursor.y);ctx.beginPath();outline.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
        if(!hint.allowed){ctx.font='bold 14px Segoe UI';const labelWidth=ctx.measureText(hint.reason).width+20,lx=Math.max(labelWidth/2,Math.min(width-labelWidth/2,cursor.x)),ly=Math.max(22,Math.min(height-18,cursor.y+52));ctx.fillStyle='#101814ee';ctx.fillRect(lx-labelWidth/2,ly-18,labelWidth,26);ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(hint.reason,lx,ly);}
        ctx.restore();
      }
      for (const tower of state.towers) {
        const site = towerPosition(map,tower);
        if (!site) continue;
        const def = towerDefinitions[tower.kind],
          isSelected = tower.id === selectedTower,
          size =
            (map.towerSize || 60) * towerVisualScale(tower.kind, tower.level,map.realm) * (map.realm === "monster" ? 0.9 : map.realm==='space'?0.82:1),
          base = towerImage(tower.kind, tower.level, "base",map.realm);
        const firingShot=state.shots.find(shot=>(shot.delay||0)<=0&&shot.kind===tower.kind&&Math.hypot(shot.from[0]-site[2],shot.from[1]-site[3])<=36),
          firingDuration=tower.kind==='mortar'?.42:tower.kind==='monkey'?.38:tower.kind==='storm'?.22:.15,
          kick=firingShot?clamp01(firingShot.life/(firingShot.duration||firingDuration)):0,
          aim=tower.aim||0,
          visualAim=map.realm==='monster'&&!reducedMotion&&(tower.kind==='sky'||tower.kind==='storm')?aim+Math.sin(time*.003+tower.id)*.035:aim,
          pose=towerHeadPose(tower.kind,visualAim,map.realm),heroKind=tower.kind==='carson'||tower.kind==='trevour'?tower.kind:null,heroPose=heroKind?heroFacing(aim):null,
          head=heroKind&&heroPose?heroTowerImage(heroKind,tower.level,kick>.08?'attack':'head',heroPose.direction):towerImage(tower.kind,tower.level,"head",map.realm),
          recoil=tower.kind==='mortar'?7:tower.kind==='sky'?5:3;
        ctx.save();
        ctx.translate(site[2], site[3]);
        if(map.realm==='monster'&&!lowEffects)drawMonsterTowerAura(ctx,tower.kind,tower.level,time,tower.id,reducedMotion);
        if(map.realm==='space'&&!lowEffects)drawSpaceTowerAura(ctx,tower.kind,tower.level,time,tower.id,reducedMotion,performanceMode);
        if(map.realm==='medieval'||map.realm==='monster'||map.realm==='space'){
          ctx.fillStyle=map.realm==='monster'?'#071012cc':map.realm==='space'?'#020814cc':'#10130dcc';ctx.shadowColor=map.realm==='space'?'#42bde0':'#090b08';ctx.shadowBlur=lowEffects?0:map.realm==='space'?10:8;ctx.beginPath();ctx.ellipse(0,9,size*.4,size*.25,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
          ctx.strokeStyle=map.realm==='monster'?(tower.kind==='sky'?'#c8a3efaa':'#9bce7199'):map.realm==='space'?(tower.kind==='mortar'?'#ffbd71aa':'#70e4ffaa'):(tower.kind==='sky'?'#a993d7aa':'#d2a95b99');ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,size*.39,0,Math.PI*2);ctx.stroke();
        }
        if (tower.kind === "storm") {
          const pulse = 0.72 + Math.sin(time * 0.012 + tower.id) * 0.18;
          ctx.globalAlpha = pulse * 0.34;
          ctx.fillStyle = "#fff09a";
          ctx.shadowColor = "#ffe36e";
          ctx.shadowBlur = lowEffects?0:20;
          ctx.beginPath();
          ctx.arc(0, 0, 28 + pulse * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.72;
          ctx.strokeStyle = "#fff2a4";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 7]);
          ctx.lineDashOffset = -time * 0.025;
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
        if (isSelected) {
          ctx.shadowBlur = lowEffects?0:18;
          ctx.shadowColor = "#fff0b5";
        }
        if(map.realm==='monster'&&!reducedMotion){const breathe=Math.sin(time*.004+tower.id)*.014,hover=tower.kind==='frost'?Math.sin(time*.005+tower.id)*2.2:0;ctx.translate(0,hover);ctx.scale(1+breathe,1-breathe*.65);}
        if(map.realm==='space'&&!reducedMotion)ctx.translate(0,Math.sin(time*.004+tower.id)*1.2);
        if (base.complete)
          ctx.drawImage(base, -size / 2, -size / 2, size, size);
        if(heroKind){ctx.translate(Math.cos(aim)*kick*4,Math.sin(aim)*kick*4+(heroPose?.depthOffset||0));if(heroPose?.flipX)ctx.scale(-1,1);}else{ctx.rotate(pose.rotation);if(pose.flipY)ctx.scale(1,-1);ctx.translate(-kick*recoil,0);}
        if(tower.kind==='frost'&&map.realm==='medieval')ctx.scale(1+kick*.055,1+kick*.055);
        if (head.complete)
          ctx.drawImage(head, -size / 2, heroKind&&heroPose?-size*heroPose.originY:-size/2, size, size);
        ctx.restore();
        if(heroKind&&kick>.12){const distance=heroKind==='trevour'?19:27,muzzleX=site[2]+Math.cos(aim)*distance,muzzleY=site[3]+Math.sin(aim)*distance,tint=heroKind==='carson'?'#62e8ff':'#ff8b3d';ctx.save();ctx.fillStyle=tint;ctx.shadowColor=tint;ctx.shadowBlur=15;ctx.globalAlpha=Math.min(1,kick*1.5);ctx.beginPath();ctx.arc(muzzleX,muzzleY,heroKind==='carson'?7:5,0,Math.PI*2);ctx.fill();ctx.restore();}
        if(!heroKind&&(map.realm==='medieval'||map.realm==='monster'||map.realm==='space')&&kick>.12){
          const distance=tower.kind==='mortar'?29:tower.kind==='sky'?31:tower.kind==='monkey'?27:25,
            muzzleX=site[2]+Math.cos(aim)*distance,muzzleY=site[3]+Math.sin(aim)*distance;
          ctx.save();ctx.translate(muzzleX,muzzleY);ctx.rotate(aim);ctx.globalAlpha=Math.min(1,kick*1.45);
          if(map.realm==='space'){
            const color=tower.kind==='mortar'?'#ffbd71':tower.kind==='frost'?'#bc9cff':tower.kind==='sky'?'#8ff3ce':tower.kind==='storm'?'#f8e879':'#70e4ff';ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=lowEffects?0:16;ctx.beginPath();ctx.arc(2,0,4+kick*4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#efffff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,-5);ctx.lineTo(4,0);ctx.lineTo(-10,5);ctx.stroke();
          }else if(map.realm==='monster'&&tower.kind==='mortar'){
            ctx.fillStyle='#efb0ed';ctx.shadowColor='#c77ee0';ctx.shadowBlur=18;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(i*4-5,(i%2?1:-1)*5,3+kick*2,0,Math.PI*2);ctx.fill();}
          }else if(map.realm==='monster'&&tower.kind==='frost'){
            ctx.strokeStyle='#c8fbff';ctx.shadowColor='#8cecf2';ctx.shadowBlur=12;ctx.lineWidth=2;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(7,Math.sin(a)*7,14,Math.cos(a)*7);ctx.stroke();}
          }else if(map.realm==='monster'&&(tower.kind==='bolt'||tower.kind==='sky')){
            const color=tower.kind==='sky'?'#d8bbff':'#c8f08f';ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=12;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-9,-6);ctx.lineTo(5,0);ctx.lineTo(-9,6);ctx.stroke();
          }else if(tower.kind==='mortar'){
            ctx.fillStyle='#fff0ba';ctx.shadowColor='#ff9b42';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(0,0,5+kick*5,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#8d8779aa';ctx.shadowBlur=0;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-8-i*6,(i-1)*4,4+i*1.5,0,Math.PI*2);ctx.fill();}
          }else if(tower.kind==='frost'){
            ctx.strokeStyle='#c9fff7';ctx.lineWidth=2;for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*(7+kick*7),Math.sin(a)*(7+kick*7));ctx.stroke();}
          }else if(tower.kind==='storm'){
            ctx.strokeStyle='#fff6a8';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-7,-8);ctx.lineTo(1,-2);ctx.lineTo(-2,4);ctx.lineTo(9,8);ctx.stroke();
          }else if(tower.kind==='monkey'){
            ctx.fillStyle='#f2a35c';ctx.beginPath();ctx.arc(0,0,4+kick*3,0,Math.PI*2);ctx.fill();
          }else{
            ctx.strokeStyle=tower.kind==='sky'?'#e6dbff':'#f1d49a';ctx.lineWidth=tower.kind==='sky'?3:2;ctx.beginPath();ctx.moveTo(-11,-7);ctx.lineTo(3,0);ctx.lineTo(-11,7);ctx.stroke();
          }
          ctx.restore();
        }
        if(!heroKind&&(!map.realm||map.realm==='foundry')&&kick>.6){
          const distance=tower.kind==='mortar'?29:tower.kind==='sky'?31:tower.kind==='monkey'?27:25,
            muzzleX=site[2]+Math.cos(aim)*distance,muzzleY=site[3]+Math.sin(aim)*distance,
            tint=({bolt:'#ffb46c',mortar:'#ffdc98',frost:'#c6fffa',sky:'#d1dcff',carson:'#62e8ff',trevour:'#ff8b3d',storm:'#fff2ab',monkey:'#ffdda1'} as Record<TowerKind,string>)[tower.kind];
          ctx.save();ctx.globalAlpha=Math.min(1,(kick-.6)*2.5);ctx.fillStyle=tint;ctx.shadowColor=tint;ctx.shadowBlur=14;ctx.beginPath();ctx.arc(muzzleX,muzzleY,(tower.kind==='mortar'?9:5),0,Math.PI*2);ctx.fill();ctx.restore();
        }
        if (tower.kind === "storm") {
          const aim = tower.aim || 0,
            muzzleX = site[2] + Math.cos(aim) * 18,
            muzzleY = site[3] + Math.sin(aim) * 18,
            pulse = 5 + Math.sin(time * 0.018 + tower.id) * 1.4;
          ctx.save();
          ctx.fillStyle = "#fffbd1";
          ctx.shadowColor = "#fff08a";
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(muzzleX, muzzleY, pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        if (isSelected) {
          ctx.strokeStyle = def.color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(site[2], site[3], 35, 0, Math.PI * 2);
          ctx.stroke();
          if(map.realm==='medieval'||map.realm==='monster'||map.realm==='space')for(let level=0;level<tower.level;level++){
            const angle=-Math.PI/2+(level-(tower.level-1)/2)*.28;
            ctx.fillStyle=map.realm==='monster'?(tower.kind==='sky'?'#d9b9ff':'#b9e77f'):map.realm==='space'?(tower.kind==='mortar'?'#ffc887':'#8deaff'):(tower.kind==='sky'?'#cdbdff':'#f2c875');ctx.beginPath();ctx.arc(site[2]+Math.cos(angle)*(map.realm==='space'?35:42),site[3]+Math.sin(angle)*(map.realm==='space'?35:42),3.5,0,Math.PI*2);ctx.fill();
          }
        }
      }
      for (const enemy of state.enemies) {
        const flying = enemyFlying(enemy.kind),directFlight=enemyUsesDirectRoute(enemy.kind,map.id),
          pos = routePosition(map.route, enemy.distance, directFlight, map.routeJumps),
          ahead = routePosition(map.route, enemy.distance + 4, directFlight, map.routeJumps),
          angle = Math.atan2(ahead.y - pos.y, ahead.x - pos.x),
          radius =
            enemy.kind === "boss"
              ? 34
              : enemy.kind === "airship"
                ? 32
              : flying
                ? 22
                : enemy.kind === "armored"
                  ? 21
                  : 19,
          visualSize=(map.realm==='medieval'?medievalEnemySizes[enemy.kind]:map.realm==='monster'?monsterEnemySizes[enemy.kind]:map.realm==='space'?spaceEnemySizes[enemy.kind]:foundryEnemySizes[enemy.kind])*(enemy.sizeMultiplier||1),
          monsterMotion=monsterEnemyMotion(enemy.kind,time,enemy.id,reducedMotion),
          spaceMotion=spaceEnemyMotion(enemy.kind,time,enemy.id,reducedMotion),
          bob = map.realm==='monster'?monsterMotion.bob:map.realm==='space'?spaceMotion.bob:flying
            ? Math.sin(time * 0.008 + enemy.id) * 3
            : Math.sin(time * 0.015 + enemy.id) * 0.6,
          health = Math.max(0, enemy.hp / enemy.maxHp);
        if(map.realm==='monster')drawMonsterEnemyShadow(ctx,enemy.kind,pos.x,pos.y,angle,visualSize,monsterMotion);
        if(map.realm==='space')drawSpaceEnemyShadow(ctx,enemy.kind,pos.x,pos.y,angle,visualSize,spaceMotion.bob,performanceMode);
        ctx.save();
        ctx.translate(pos.x, pos.y + bob);
        ctx.rotate(angle+(map.realm==='medieval'&&enemy.kind==='boss'?Math.PI:0)+(map.realm==='monster'?monsterMotion.tilt:map.realm==='space'?spaceMotion.tilt:0));
        if(map.realm==='monster')ctx.scale(monsterMotion.scaleX,monsterMotion.scaleY);
        const artwork=map.realm==='medieval'?medievalEnemyArtwork(enemy.kind,time,enemy.id):map.realm==='monster'?monsterEnemyArtwork(enemy.kind,time,enemy.id):map.realm==='space'?spaceEnemyArtwork(enemy.kind,time,enemy.id):foundryEnemyArtwork(enemy.kind);
        if(artwork.complete&&artwork.naturalWidth)ctx.drawImage(artwork,-visualSize/2,-visualSize/2,visualSize,visualSize);
        else enemyShape(ctx,enemy.kind,radius,enemyColor(enemy.kind),time,enemy.id);
        ctx.restore();
        if((!map.realm||map.realm==='foundry')&&enemy.kind==="flyer"&&artwork.complete&&artwork.naturalWidth)drawFoundryHelicopterRotor(ctx,pos.x,pos.y+bob,angle,visualSize,time,enemy.id,reducedMotion);
        ctx.save();
        ctx.translate(pos.x, pos.y + bob);
        if (enemy.slow < 1) {
          ctx.strokeStyle = "#8effff";
          ctx.shadowColor = "#8effff";
          ctx.shadowBlur = 9;
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, radius + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        const barWidth = radius * 2.15,
          barY = -visualSize*.43-7;
        ctx.fillStyle = "#101716e8";
        ctx.strokeStyle = enemy.kind === "boss" ? "#f0c477" : enemy.kind === "airship" ? "#d8b76f" : "#657168";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-barWidth / 2, barY, barWidth, 7, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle =
          health < 0.35 ? "#ff765d" : health < 0.7 ? "#e7bb61" : "#6ed788";
        ctx.beginPath();
        ctx.roundRect(
          -barWidth / 2 + 1,
          barY + 1,
          (barWidth - 2) * health,
          5,
          2,
        );
        ctx.fill();
        if (enemy.kind === "boss") {
          ctx.fillStyle = "#ffe1a6";
          ctx.font = "700 8px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`${map.realm==='medieval'?"SIEGE CATAPULT":map.realm==='monster'?"DREADHORN":map.realm==='space'?"SIEGE CARRIER":"SIEGE BOSS"}${enemy.bossNumber?` ${enemy.bossNumber}`:''}`, 0, barY - 3);
        } else if(enemy.kind==='airship'){
          ctx.fillStyle='#ffe0a3';ctx.font='700 8px Inter, sans-serif';ctx.textAlign='center';ctx.fillText(map.realm==='monster'?'SKY LEVIATHAN':map.realm==='space'?'GRAVITY DREADNOUGHT':map.realm==='medieval'?'WAR AIRSHIP':'ATTACK ZEPPELIN',0,barY-3);
        }
        ctx.restore();
      }
      if (state.status === "running")
        for (const shot of state.shots) {
          if ((shot.delay || 0) > 0) continue;
          ctx.save();
          if(shot.kind==='carson'){
            const progress=shotProgress(shot,.28),x=shot.from[0]+(shot.to[0]-shot.from[0])*progress,y=shot.from[1]+(shot.to[1]-shot.from[1])*progress,dx=shot.to[0]-shot.from[0],dy=shot.to[1]-shot.from[1],length=Math.max(1,Math.hypot(dx,dy));ctx.globalAlpha=.95;ctx.strokeStyle='#62e8ff';ctx.shadowColor='#62e8ff';ctx.shadowBlur=lowEffects?0:18;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-dx/length*22,y-dy/length*22);ctx.lineTo(x,y);ctx.stroke();const glow=ctx.createRadialGradient(x-2,y-2,1,x,y,10);glow.addColorStop(0,'#ffffff');glow.addColorStop(.35,'#c9fbff');glow.addColorStop(1,'#42dff500');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();
          }else if(shot.kind==='trevour'){
            const progress=shotProgress(shot,.22),angle=Math.atan2(shot.to[1]-shot.from[1],shot.to[0]-shot.from[0]),reach=22+progress*18;ctx.translate(shot.to[0],shot.to[1]);ctx.rotate(angle);ctx.globalAlpha=1-progress*.65;ctx.strokeStyle='#ffb25c';ctx.shadowColor='#ff8b3d';ctx.shadowBlur=lowEffects?0:13;ctx.lineWidth=5;ctx.beginPath();ctx.arc(-8,0,reach,-.72,.72);ctx.stroke();ctx.strokeStyle='#fff0c8';ctx.lineWidth=2;ctx.stroke();
          }else if (shot.kind === "mortar") {
            const progress = 1 - Math.max(0, Math.min(1, shot.life / 0.42)),
              x = shot.from[0] + (shot.to[0] - shot.from[0]) * progress,
              y =
                shot.from[1] +
                (shot.to[1] - shot.from[1]) * progress -
                Math.sin(progress * Math.PI) * 45,
              trailProgress = Math.max(0, progress - 0.08),
              trailX =
                shot.from[0] + (shot.to[0] - shot.from[0]) * trailProgress,
              trailY =
                shot.from[1] +
                (shot.to[1] - shot.from[1]) * trailProgress -
                Math.sin(trailProgress * Math.PI) * 45;
            if(map.realm==='space'){
              const angle=Math.atan2(shot.to[1]-shot.from[1],shot.to[0]-shot.from[0]);ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=.96;ctx.strokeStyle='#ffbd71';ctx.shadowColor='#ff9d48';ctx.shadowBlur=lowEffects?0:16;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(-7,0);ctx.stroke();ctx.fillStyle='#31485d';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-7,-7);ctx.lineTo(-7,7);ctx.closePath();ctx.fill();ctx.strokeStyle='#d7e8ef';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#fff1c4';ctx.beginPath();ctx.arc(-7,0,3,0,Math.PI*2);ctx.fill();ctx.restore();ctx.save();drawSpaceImpact(ctx,shot,progress,lowEffects);
            }else if(map.realm==='monster'){
              ctx.globalAlpha=.94;ctx.strokeStyle='#b971cc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(trailX,trailY);ctx.quadraticCurveTo((trailX+x)/2,(trailY+y)/2-7,x,y);ctx.stroke();
              for(let i=1;i<=4;i++){const t=i/5,bx=x+(trailX-x)*t,by=y+(trailY-y)*t+Math.sin(shot.id+i)*3;ctx.globalAlpha=.16+(4-i)*.1;ctx.fillStyle=i%2?'#e9a7e7':'#9b66bc';ctx.beginPath();ctx.arc(bx,by,2+i*.75,0,Math.PI*2);ctx.fill();}
              ctx.globalAlpha=.96;const spore=ctx.createRadialGradient(x-3,y-3,1,x,y,13);spore.addColorStop(0,'#fff4ff');spore.addColorStop(.35,'#edb5ec');spore.addColorStop(.75,'#9e5abb');spore.addColorStop(1,'#5a2d7000');ctx.fillStyle=spore;ctx.shadowColor='#da8ee2';ctx.shadowBlur=15;ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f4cef4';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,7+Math.sin(time*.02)*2,0,Math.PI*2);ctx.stroke();drawMonsterImpact(ctx,shot,progress);
            }else if(map.realm==='medieval'){
              ctx.globalAlpha=.94;
              ctx.fillStyle='#0c100dcc';ctx.beginPath();ctx.ellipse(x,y+45*Math.sin(progress*Math.PI)+7,11,5,0,0,Math.PI*2);ctx.fill();
              ctx.strokeStyle='#9d8c70';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(trailX,trailY);ctx.lineTo(x,y);ctx.stroke();
              ctx.shadowColor='#ffb45f';ctx.shadowBlur=7;
              ctx.fillStyle='#2a2825';ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();
              ctx.strokeStyle='#c3aa7d';ctx.lineWidth=2;ctx.stroke();
              ctx.fillStyle='#ffdb83';ctx.beginPath();ctx.arc(x-4,y-4,2.5,0,Math.PI*2);ctx.fill();
              drawMedievalImpact(ctx,shot,progress,Math.atan2(shot.to[1]-shot.from[1],shot.to[0]-shot.from[0]));
            }else{
            ctx.globalAlpha = 0.88;
            ctx.shadowColor = "#ff8a42";
            ctx.shadowBlur = 22;
            const trail = ctx.createLinearGradient(trailX, trailY, x, y);
            trail.addColorStop(0, "#ff6a2200");
            trail.addColorStop(1, "#fff1a8");
            ctx.strokeStyle = trail;
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.moveTo(trailX, trailY);
            ctx.lineTo(x, y);
            ctx.stroke();
            const plasma = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, 12);
            plasma.addColorStop(0, "#ffffff");
            plasma.addColorStop(0.28, "#fff1a8");
            plasma.addColorStop(0.62, "#ff9a42");
            plasma.addColorStop(1, "#d83b1800");
            ctx.fillStyle = plasma;
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffd477";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 7 + Math.sin(time * 0.02) * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            }
          } else if (shot.kind === "monkey") {
            const duration = shot.duration || 0.38,
              progress = 1 - Math.max(0, Math.min(1, shot.life / duration)),
              dx = shot.to[0] - shot.from[0],
              dy = shot.to[1] - shot.from[1],
              facing = dx < 0 ? -1 : 1,
              angle = Math.atan2(dy, Math.abs(dx)),
              x = shot.from[0] + dx * progress,
              y =
                shot.from[1] +
                dy * progress -
                Math.sin(Math.PI * progress) * 26;
            if(map.realm==='medieval')drawMedievalImpact(ctx,shot,progress,Math.atan2(dy,dx));
            if(map.realm==='monster')drawMonsterImpact(ctx,shot,progress);
            if(map.realm==='space')drawSpaceImpact(ctx,shot,progress,lowEffects);
            ctx.translate(x, y);
            ctx.scale(facing, 1);
            ctx.rotate(angle);
            ctx.shadowColor = "#ffb35d";
            ctx.shadowBlur = lowEffects?0:9;
            ctx.strokeStyle = "#20130d";
            ctx.lineWidth = 2;
            ctx.fillStyle = "#75401f";
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            for (const earY of [-7, 7]) {
              ctx.beginPath();
              ctx.arc(0, earY, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }
            ctx.fillStyle = "#e0a265";
            ctx.beginPath();
            ctx.ellipse(3, 0, 9, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#17100d";
            ctx.beginPath();
            ctx.arc(4, -2, 1.2, 0, Math.PI * 2);
            ctx.arc(4, 2, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#c87832";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(-9, 3, 6, 0.15, Math.PI * 1.85);
            ctx.stroke();
            ctx.strokeStyle = "#ffd28a";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-15, -3);
            ctx.lineTo(-22, -3);
            ctx.stroke();
          } else if (shot.kind === "storm") {
            const duration = shot.duration || 0.22,
              life = Math.min(1, shot.life / duration),
              dx = shot.to[0] - shot.from[0],
              dy = shot.to[1] - shot.from[1],
              length = Math.max(1, Math.hypot(dx, dy)),
              nx = -dy / length,
              ny = dx / length;
            ctx.globalAlpha = life;
            ctx.shadowColor = map.realm==='medieval'?"#ffc85c":map.realm==='monster'?"#f8df72":map.realm==='space'?"#fff39a":"#fff08a";
            ctx.shadowBlur = lowEffects?0:21;
            ctx.strokeStyle = map.realm==='medieval'?"#efad38":map.realm==='monster'?"#d7c14c":map.realm==='space'?"#f8e879":"#f7df5e";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(...shot.from);
            for (let segment = 1; segment < 6; segment++) {
              const progress = segment / 6,
                wobble =
                  Math.sin(shot.id * 1.7 + segment * 2.1 + time * 0.035) *
                  (segment % 2 ? 8 : -8);
              ctx.lineTo(
                shot.from[0] + dx * progress + nx * wobble,
                shot.from[1] + dy * progress + ny * wobble,
              );
            }
            ctx.lineTo(...shot.to);
            ctx.stroke();
            ctx.shadowBlur = lowEffects?0:4;
            ctx.strokeStyle = map.realm==='medieval'?"#fff2b0":map.realm==='monster'?"#f7ffc9":map.realm==='space'?"#ffffff":"#fffbd1";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = "#fff6a8";
            ctx.beginPath();
            ctx.arc(shot.to[0], shot.to[1], 7, 0, Math.PI * 2);
            ctx.fill();
            if(map.realm==='monster')drawMonsterImpact(ctx,shot,1-life);
            if(map.realm==='space')drawSpaceImpact(ctx,shot,1-life,lowEffects);
          } else {
            const life = Math.min(1, shot.life * 7);
            ctx.globalAlpha = life;
            ctx.shadowColor = shot.color;
            ctx.shadowBlur = lowEffects?0:10;
            if(map.realm==='space'){
              drawSpaceProjectile(ctx,shot,shotProgress(shot,.15),lowEffects);
            }else if(map.realm==='monster'){
              drawMonsterProjectile(ctx,shot,shotProgress(shot,.15),time);
            }else if(map.realm==='medieval'){
              const progress=shotProgress(shot,.15),rawDx=shot.to[0]-shot.from[0],rawDy=shot.to[1]-shot.from[1],angle=Math.atan2(rawDy,rawDx),dx=Math.cos(angle),dy=Math.sin(angle),arc=shot.kind==='frost'?Math.sin(progress*Math.PI)*24:0,x=shot.from[0]+rawDx*progress,y=shot.from[1]+rawDy*progress-arc;
              ctx.globalAlpha=.96;
              if(shot.kind==='bolt'||shot.kind==='sky'){
                const length=shot.kind==='sky'?31:23;
                ctx.shadowColor=shot.kind==='sky'?'#a998ff':'#e2bb72';ctx.shadowBlur=shot.kind==='sky'?11:5;
                ctx.strokeStyle=shot.kind==='sky'?'#8e7bce':'#29231b';ctx.lineWidth=shot.kind==='sky'?6:4;ctx.beginPath();ctx.moveTo(x-dx*length,y-dy*length);ctx.lineTo(x+dx*3,y+dy*3);ctx.stroke();
                ctx.strokeStyle=shot.kind==='sky'?'#e0d5ff':'#e6c78e';ctx.lineWidth=shot.kind==='sky'?2.5:1.8;ctx.stroke();
                ctx.fillStyle='#cbd0c7';ctx.beginPath();ctx.moveTo(x+dx*9,y+dy*9);ctx.lineTo(x-dx*3-dy*5,y-dy*3+dx*5);ctx.lineTo(x-dx*3+dy*5,y-dy*3-dx*5);ctx.closePath();ctx.fill();
                ctx.strokeStyle=shot.kind==='sky'?'#b9a6e8':'#f0e1b9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-dx*length-dy*5,y-dy*length+dx*5);ctx.lineTo(x-dx*(length-7),y-dy*(length-7));ctx.stroke();
              }else{
                ctx.save();ctx.translate(x,y);ctx.rotate(angle+progress*4.5);ctx.shadowColor='#87fff0';ctx.shadowBlur=13;
                ctx.fillStyle='#6bd9d1';ctx.strokeStyle='#d8fff8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.stroke();
                ctx.fillStyle='#d8e2c9';ctx.fillRect(-3,-11,6,5);ctx.strokeRect(-3,-11,6,5);
                ctx.fillStyle='#ffffff';ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(-2,-2,2,0,Math.PI*2);ctx.fill();ctx.restore();
              }
              drawMedievalImpact(ctx,shot,progress,angle);
            }else{
              ctx.strokeStyle = shot.color;
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(...shot.from);
              ctx.lineTo(...shot.to);
              ctx.stroke();
              ctx.fillStyle = shot.color;
              ctx.beginPath();
              ctx.arc(shot.to[0], shot.to[1], 6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();
        }
      frame = requestAnimationFrame(paint);
    };
    frame = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(frame);
  }, [map,reducedEffects,reducedMotionSetting,visualQuality]);
  const position=(event:React.PointerEvent<HTMLCanvasElement>)=>{
    const rect=event.currentTarget.getBoundingClientRect();return {x:Math.round((event.clientX-rect.left)/rect.width*(map.width||960)),y:Math.round((event.clientY-rect.top)/rect.height*(map.height||576))};
  };
  const choose=(event:React.PointerEvent<HTMLCanvasElement>)=>{
    const p=position(event);
    if(placementKind){onPlace(p.x,p.y);return;}
    const target=pickBattlefieldTarget(map,state,p.x,p.y,false);
    if(target?.kind==='tower')onTower(target.id);else onClear();
  };
  const beginPointer=(event:React.PointerEvent<HTMLCanvasElement>)=>{
    if(event.button!==0){pointerStart.current=null;return;}
    pointer.current=position(event);pointerStart.current={id:event.pointerId,x:event.clientX,y:event.clientY};
  };
  const completePointer=(event:React.PointerEvent<HTMLCanvasElement>)=>{
    const start=pointerStart.current;pointerStart.current=null;
    if(event.button!==0||!start||start.id!==event.pointerId||Math.hypot(event.clientX-start.x,event.clientY-start.y)>10)return;
    choose(event);if(event.pointerType==='touch')pointer.current=null;
  };
  return (
    <canvas
      ref={canvas}
      className="battlefield"
      style={{'--battlefield-ratio': (map.width || 960) / (map.height || 576)} as React.CSSProperties}
      data-artwork={loadedArtwork === map.artwork ? "loaded" : "loading"}
      data-enemy-artwork={enemyArtworkLoaded ? "loaded" : "loading"}
      aria-label={`${map.name} battlefield`}
      onPointerMove={event=>{pointer.current=position(event);if(placementKind){const p=pointer.current;onPreview(placement(map,state,p.x,p.y,placementKind).reason);}}}
      onPointerLeave={()=>{pointer.current=null;}}
      onContextMenu={event=>{event.preventDefault();pointer.current=null;onClear();}}
      onPointerDown={beginPointer}
      onPointerUp={completePointer}
      onPointerCancel={()=>{pointerStart.current=null;}}
    />
  );
}
