import type {EnemyKind} from './types';

const frames=[0,1,2,3] as const;
const images=new Map<string,HTMLImageElement>();
export const medievalEnemySizes:Record<EnemyKind,number>={crawler:60,runner:58,armored:62,flyer:68,airship:136,boss:155,shielded:58};

export const medievalEnemyImage=(kind:EnemyKind,frame=0)=>kind==='boss'?'./enemies/medieval-v3/boss-rigid.png':kind==='airship'?'./enemies/medieval-v3/airship.png':`./enemies/medieval-v2/${kind}-${frames[Math.abs(frame)%frames.length]}.png`;
function load(kind:EnemyKind,frame=0){const fixed=kind==='boss'||kind==='airship',key=`${kind}-${fixed?0:Math.abs(frame)%4}`;let image=images.get(key);if(image)return image;image=new Image();image.src=medievalEnemyImage(kind,frame);images.set(key,image);return image;}
export function preloadMedievalEnemies(){return Promise.all((['crawler','runner','armored','flyer','airship','boss'] as EnemyKind[]).flatMap(kind=>(kind==='boss'||kind==='airship'?[0]:frames).map(frame=>new Promise<void>((resolve,reject)=>{const image=load(kind,frame);if(image.complete&&image.naturalWidth){resolve();return;}image.addEventListener('load',()=>resolve(),{once:true});image.addEventListener('error',()=>reject(new Error(`Could not load ${medievalEnemyImage(kind,frame)}`)),{once:true});}))));}
export const medievalEnemyArtwork=(kind:EnemyKind,time:number,id:number)=>load(kind,kind==='boss'||kind==='airship'?0:Math.floor(time/130+id)%4);
