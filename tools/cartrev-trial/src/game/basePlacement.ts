import type {PocketMap as MapDef} from './types.ts';
type Run={towers:{id:number;kind:string;level:number;col:number;row:number}[]};
import {insidePolygon,segmentDistance,type Point} from './placementGeometry.ts';
export function baseOutline(map:MapDef,kind:string,level:number,x:number,y:number):Point[]{return (map.baseFootprints?.[kind]?.[Math.max(0,Math.min(2,level-1))]??[]).map(p=>({x:x+p[0],y:y+p[1]}));}
export function segmentGap(a:Point,b:Point,c:Point,d:Point){
 const den=(b.x-a.x)*(d.y-c.y)-(b.y-a.y)*(d.x-c.x);
 if(Math.abs(den)>1e-9){const t=((c.x-a.x)*(d.y-c.y)-(c.y-a.y)*(d.x-c.x))/den,u=((c.x-a.x)*(b.y-a.y)-(c.y-a.y)*(b.x-a.x))/den;if(t>=0&&t<=1&&u>=0&&u<=1)return 0;}
 return Math.min(segmentDistance(a,c,d),segmentDistance(b,c,d),segmentDistance(c,a,b),segmentDistance(d,a,b));
}
export function pointBaseGap(p:Point,shape:Point[]){return insidePolygon(p,shape)?0:Math.min(...shape.map((b,i)=>segmentDistance(p,shape[(i+shape.length-1)%shape.length],b)));}
function lineGap(shape:Point[],a:Point,b:Point){if(insidePolygon(a,shape)||insidePolygon(b,shape))return 0;return Math.min(...shape.map((d,i)=>segmentGap(a,b,shape[(i+shape.length-1)%shape.length],d)));}
function polygonGap(a:Point[],b:Point[]){if(insidePolygon(a[0],b)||insidePolygon(b[0],a))return 0;return Math.min(...b.map((d,i)=>lineGap(a,b[(i+b.length-1)%b.length],d)));}
export function basePlacement(map:MapDef,towers:Run['towers'],x:number,y:number,kind:string,level=1,ignoreId?:number){
 // Fixed foundations use authored centers, while retaining the base-shaped outline.
 if(!map.freePlacement&&map.buildPositions)return map.buildPositions.some(p=>p[0]===x&&p[1]===y)?{allowed:true,reason:'Click to place'}:{allowed:false,reason:'Choose a marked tower pad'};
 const shape=baseOutline(map,kind,level,x,y),terrain=map.placementTerrain!;
 const no=(reason:string)=>({allowed:false,reason});
 if(!shape.length||!Number.isFinite(x)||!Number.isFinite(y)||shape.some(p=>p.x<2||p.y<2||p.x>terrain.width-2||p.y>terrain.height-2))return no('Keep the whole base on the battlefield');
 // Authored ground polygons keep the complete base off cliffs, water and voids.
 if(map.placementAreas&&!map.placementAreas.some(points=>{const area=points.map(p=>({x:p[0],y:p[1]}));return shape.every(p=>insidePolygon(p,area))&&area.every((b,i)=>lineGap(shape,area[(i+area.length-1)%area.length],b)>2);}))return no('Keep the base on solid ground');
 if(map.placementExclusions?.some(points=>polygonGap(shape,points.map(([x,y])=>({x,y})))<=2))return no('Keep the base on solid ground');
 if(terrain.roadAreas?.some(area=>polygonGap(shape,area)<=2))return no('Keep the base clear of the road');
 if(terrain.route.slice(1).some((b,i)=>!map.routeJumps?.includes(i)&&lineGap(shape,terrain.route[i],b)<=(terrain.roadWidths?.[i]??terrain.roadWidth)/2+2))return no('Keep the base clear of the road');
 if([terrain.route[0],terrain.route.at(-1)!].some(p=>pointBaseGap(p,shape)<=terrain.portalRadius+2))return no('Keep the base clear of the portal');
 if(terrain.bridges?.some(b=>b.supports.some(p=>pointBaseGap(p,shape)<=p.radius+2)||b.deck.slice(1).some((p,i)=>lineGap(shape,b.deck[i],p)<=terrain.roadWidth/2+2)))return no('Keep the base clear of the bridge');
 for(const o of terrain.scenery){const blocked=o.shape==='circle'?pointBaseGap(o,shape)<=o.radius+2:polygonGap(shape,[{x:o.x-o.width/2,y:o.y-o.height/2},{x:o.x+o.width/2,y:o.y-o.height/2},{x:o.x+o.width/2,y:o.y+o.height/2},{x:o.x-o.width/2,y:o.y+o.height/2}])<=2;if(blocked)return no('Scenery blocks the tower base');}
 // Upgrades may overhang; every placed tower keeps its original ground footprint.
 if(towers.some(t=>t.id!==ignoreId&&polygonGap(shape,baseOutline(map,t.kind,1,t.col,t.row))<=2))return no('Too close to another tower base');
 return {allowed:true,reason:'Click to place'};
}
