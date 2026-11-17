import type {EnemyKind} from './types';

const frames=[0,1,2,3] as const;
const images=new Map<string,HTMLImageElement>();

export const spaceEnemySizes:Record<EnemyKind,number>={crawler:53,runner:53,armored:62,flyer:73,airship:146,boss:126,shielded:55};
export const spaceEnemyImage=(kind:EnemyKind,frame=0)=>kind==='airship'?'./enemies/space-v3/airship.png':`./enemies/space-v2/${kind}-${frames[Math.abs(frame)%frames.length]}.png`;

function load(kind:EnemyKind,frame=0){
 const key=`${kind}-${kind==='airship'?0:Math.abs(frame)%4}`;
 let image=images.get(key);
 if(image)return image;
 image=new Image();image.src=spaceEnemyImage(kind,frame);images.set(key,image);return image;
}

export function preloadSpaceEnemies(){
 return Promise.all((['crawler','runner','armored','flyer','airship','boss','shielded'] as EnemyKind[]).flatMap(kind=>(kind==='airship'?[0]:frames).map(frame=>new Promise<void>((resolve,reject)=>{
  const image=load(kind,frame);
  if(image.complete&&image.naturalWidth){resolve();return;}
  image.addEventListener('load',()=>resolve(),{once:true});
  image.addEventListener('error',()=>reject(new Error(`Could not load ${spaceEnemyImage(kind,frame)}`)),{once:true});
 }))));
}

export const spaceEnemyArtwork=(kind:EnemyKind,time:number,id:number)=>load(kind,kind==='airship'?0:Math.floor(time/125+id)%4);
