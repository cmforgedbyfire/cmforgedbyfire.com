import {Capacitor,registerPlugin} from '@capacitor/core';

export type PlayGamesStatus={supported:boolean;authenticated:boolean;playerName?:string;message?:string};

type PlayGamesNative={
 status():Promise<PlayGamesStatus>;
 signIn():Promise<PlayGamesStatus>;
 syncAchievements(options:{updates:GoogleAchievementUpdate[]}):Promise<{synced:boolean;submitted:number}>;
 syncLeaderboards(options:{scores:GoogleLeaderboardScore[]}):Promise<{synced:boolean;submitted:number}>;
 loadLeaderboardScores():Promise<{scores:GoogleLeaderboardEntry[]}>;
 showAchievements():Promise<void>;
 showLeaderboards():Promise<void>;
 showLeaderboard(options:{id:string}):Promise<void>;
};

export type GoogleAchievementUpdate={id:string;current:number;target:number;earned:boolean;incremental:boolean};
export type GoogleLeaderboardScore={id:string;score:number};
export type GoogleLeaderboardEntry={id:string;score:number;displayScore?:string;rank?:number;displayRank?:string};

const nativePlayGames=registerPlugin<PlayGamesNative>('PlayGames');
const unavailable:PlayGamesStatus={supported:false,authenticated:false};

export function playGamesSupported(){return Capacitor.getPlatform()==='android';}

export async function readPlayGamesStatus():Promise<PlayGamesStatus>{
 if(!playGamesSupported())return unavailable;
 try{return await nativePlayGames.status();}
 catch(reason){return {...unavailable,supported:true,message:reason instanceof Error?reason.message:'Google Play Games is unavailable.'};}
}

export async function connectPlayGames():Promise<PlayGamesStatus>{
 if(!playGamesSupported())return unavailable;
 try{return await nativePlayGames.signIn();}
 catch(reason){return {...unavailable,supported:true,message:reason instanceof Error?reason.message:'Google Play Games could not connect.'};}
}

export async function syncPlayGamesAchievements(updates:GoogleAchievementUpdate[]){
 if(!playGamesSupported())return {synced:false,submitted:0};
 try{return await nativePlayGames.syncAchievements({updates});}
 catch{return {synced:false,submitted:0};}
}

export async function syncPlayGamesLeaderboards(scores:GoogleLeaderboardScore[]){
 if(!playGamesSupported())return {synced:false,submitted:0};
 try{return await nativePlayGames.syncLeaderboards({scores});}
 catch{return {synced:false,submitted:0};}
}

export async function readPlayGamesLeaderboards():Promise<GoogleLeaderboardEntry[]>{
 if(!playGamesSupported())return [];
 try{return (await nativePlayGames.loadLeaderboardScores()).scores||[];}
 catch{return [];}
}

export async function openPlayGamesAchievements(){
 if(playGamesSupported())await nativePlayGames.showAchievements();
}

export async function openPlayGamesLeaderboards(){
 if(playGamesSupported())await nativePlayGames.showLeaderboards();
}

export async function openPlayGamesLeaderboard(id:string){
 if(playGamesSupported())await nativePlayGames.showLeaderboard({id});
}
