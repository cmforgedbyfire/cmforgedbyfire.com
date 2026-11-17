import type {EnemyKind} from './types';

const kinds:EnemyKind[]=['crawler','runner','armored','flyer','airship','boss','shielded'];
const images=new Map<EnemyKind,HTMLImageElement>();

export const foundryEnemySizes:Record<EnemyKind,number>={
  crawler:53,
  runner:51,
  armored:59,
  flyer:79,
  airship:134,
  boss:101,
  shielded:53,
};

export const foundryEnemyImage=(kind:EnemyKind)=>`./enemies/foundry-v3/${kind}.png`;

function load(kind:EnemyKind){
  const cached=images.get(kind);
  if(cached)return cached;
  const image=new Image();
  image.src=foundryEnemyImage(kind);
  images.set(kind,image);
  return image;
}

export function preloadFoundryEnemies(){
  return Promise.all(kinds.map(kind=>new Promise<void>((resolve,reject)=>{
    const image=load(kind);
    if(image.complete&&image.naturalWidth){resolve();return;}
    image.addEventListener('load',()=>resolve(),{once:true});
    image.addEventListener('error',()=>reject(new Error(`Could not load ${foundryEnemyImage(kind)}`)),{once:true});
  })));
}

export const foundryEnemyArtwork=(kind:EnemyKind)=>load(kind);

function rotorPose(x:number,y:number,heading:number,size:number,time:number,id:number){
  // The rotor hub in the Windows helicopter body is at 60.2%, 49.8%.
  const dx=.102*size,dy=-.002*size;
  return {
    x:x+Math.cos(heading)*dx-Math.sin(heading)*dy,
    y:y+Math.sin(heading)*dx+Math.cos(heading)*dy,
    angle:heading+time*.041+id*.7,
    radius:size*.43,
  };
}

export function drawFoundryHelicopterRotor(
  ctx:CanvasRenderingContext2D,
  x:number,
  y:number,
  heading:number,
  size:number,
  time:number,
  id:number,
  reducedMotion:boolean,
){
  const hub=rotorPose(x,y,heading,size,reducedMotion?0:time,id);
  ctx.save();
  if(!reducedMotion){
    ctx.globalAlpha=.055;
    ctx.fillStyle='#b5c1c7';
    ctx.beginPath();ctx.arc(hub.x,hub.y,hub.radius,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.13;
    ctx.strokeStyle='#d6e0e4';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(hub.x,hub.y,hub.radius,0,Math.PI*2);ctx.stroke();
  }
  ctx.globalAlpha=1;
  for(let blade=0;blade<4;blade++){
    const angle=hub.angle+blade*Math.PI/2,dx=Math.cos(angle),dy=Math.sin(angle),start=size*.035;
    ctx.strokeStyle='#151d23';ctx.lineWidth=size*.047;
    ctx.beginPath();ctx.moveTo(hub.x+dx*start,hub.y+dy*start);ctx.lineTo(hub.x+dx*hub.radius,hub.y+dy*hub.radius);ctx.stroke();
    ctx.strokeStyle='#b3bec2';ctx.lineWidth=size*.013;
    ctx.beginPath();ctx.moveTo(hub.x+dx*start-dy,hub.y+dy*start+dx);ctx.lineTo(hub.x+dx*hub.radius-dy,hub.y+dy*hub.radius+dx);ctx.stroke();
    ctx.strokeStyle='#d6a557';ctx.lineWidth=size*.033;
    ctx.beginPath();ctx.moveTo(hub.x+dx*hub.radius*.89,hub.y+dy*hub.radius*.89);ctx.lineTo(hub.x+dx*hub.radius,hub.y+dy*hub.radius);ctx.stroke();
  }
  ctx.fillStyle='#10191e';ctx.beginPath();ctx.arc(hub.x,hub.y,size*.053,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#c5cbd0';ctx.lineWidth=1;ctx.beginPath();ctx.arc(hub.x,hub.y,size*.044,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#c88a46';ctx.beginPath();ctx.arc(hub.x,hub.y,size*.019,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
