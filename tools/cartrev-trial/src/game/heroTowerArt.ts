import type {TowerKind} from './types';

export type HeroDirection='front'|'front-side'|'side'|'back-side'|'back';
const images=new Map<string,HTMLImageElement>();

export function heroFacing(aim:number){
 const horizontal=Math.cos(aim),vertical=Math.sin(aim),elevation=Math.atan2(vertical,Math.abs(horizontal));
 const direction:HeroDirection=elevation>=Math.PI*3/8?'front':elevation>=Math.PI/8?'front-side':elevation>-Math.PI/8?'side':elevation>-Math.PI*3/8?'back-side':'back';
 // The hero and platform PNGs share the same registered 512px frame. Keeping
 // both at the same origin plants the hero's feet on the platform instead of
 // floating the character in front of a neighboring tower.
 const originY=.5;
 return {direction,flipX:horizontal<0&&direction!=='front'&&direction!=='back',originY,depthOffset:vertical*1.8};
}

export function heroTowerImage(kind:Extract<TowerKind,'carson'|'trevour'>,level:number,part:'head'|'attack',direction:HeroDirection){
 const tier=Math.max(1,Math.min(3,level)),key=`${kind}-${tier}-${part}-${direction}`;
 let image=images.get(key);if(image)return image;
 image=new Image();image.src=`./towers/heroes-v3/${part}/${kind}-${tier}-${direction}.png`;images.set(key,image);return image;
}
