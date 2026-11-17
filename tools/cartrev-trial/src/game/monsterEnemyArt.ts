import type {EnemyKind} from './types';

const frames=[0,1,2,3] as const;
const images=new Map<string,HTMLImageElement>();

export const monsterEnemySizes:Record<EnemyKind,number>={crawler:46,runner:48,armored:59,flyer:67,airship:146,boss:126,shielded:53};
export const monsterEnemyImage=(kind:EnemyKind,frame=0)=>kind==='airship'?'./enemies/monster-v3/airship.png':`./enemies/monster-v2/${kind}-${frames[Math.abs(frame)%frames.length]}.png`;

function load(kind:EnemyKind,frame=0){
 const key=`${kind}-${kind==='airship'?0:Math.abs(frame)%4}`;
 let image=images.get(key);
 if(image)return image;
 image=new Image();image.src=monsterEnemyImage(kind,frame);images.set(key,image);return image;
}

export function preloadMonsterEnemies(){
 return Promise.all((['crawler','runner','armored','flyer','airship','boss'] as EnemyKind[]).flatMap(kind=>(kind==='airship'?[0]:frames).map(frame=>new Promise<void>((resolve,reject)=>{
  const image=load(kind,frame);
  if(image.complete&&image.naturalWidth){resolve();return;}
  image.addEventListener('load',()=>resolve(),{once:true});
  image.addEventListener('error',()=>reject(new Error(`Could not load ${monsterEnemyImage(kind,frame)}`)),{once:true});
 }))));
}

export const monsterEnemyArtwork=(kind:EnemyKind,time:number,id:number)=>load(kind,kind==='airship'?0:Math.floor(time/140+id)%4);
