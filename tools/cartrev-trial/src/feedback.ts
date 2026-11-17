import packageInfo from '../package.json' with {type:'json'};

export const FEEDBACK_URL='https://trev.cmforgedbyfire.com/api/cartrev-towers/android-feedback';
export const APP_VERSION=packageInfo.version;
const MAX_RESPONSE_BYTES=8*1024;

export type FeedbackKind='bug'|'suggestion'|'other';
export type FeedbackInput={body:string;kind:FeedbackKind;email?:string};
type FeedbackTransport=(input:RequestInfo|URL,init?:RequestInit)=>Promise<Response>;

export function feedbackPayload(input:unknown){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Enter your feedback.');
 const {body,kind,email=''}=input as Record<string,unknown>;
 if(typeof body!=='string'||!body.trim()||body.trim().length>4000)throw new Error('Enter a message of 1–4000 characters.');
 if(typeof kind!=='string'||!['bug','suggestion','other'].includes(kind))throw new Error('Choose a feedback category.');
 if(typeof email!=='string'||email.trim().length>254||(email.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())))throw new Error('Enter a valid reply email or leave it blank.');
 return {body:body.trim(),kind,email:email.trim(),version:APP_VERSION};
}

async function readBounded(response:Response){
 const declared=Number(response.headers.get('content-length')||0);if(declared>MAX_RESPONSE_BYTES)throw new Error('oversized');
 if(!response.body){const text=await response.text();if(new TextEncoder().encode(text).length>MAX_RESPONSE_BYTES)throw new Error('oversized');return text;}
 const reader=response.body.getReader(),chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;if(value){size+=value.byteLength;if(size>MAX_RESPONSE_BYTES)throw new Error('oversized');chunks.push(value);}}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}return new TextDecoder().decode(bytes);
}

export async function sendFeedback(input:unknown,transport:FeedbackTransport=fetch):Promise<{ok:true;feedbackId:number}>{
 const payload=feedbackPayload(input),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await transport(FEEDBACK_URL,{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal,cache:'no-store'});
  if(response.status===429)throw new Error('Please wait 10 minutes before sending more feedback. Your draft is still here.');
  let result:unknown;try{result=JSON.parse(await readBounded(response));}catch(error){if(error instanceof Error&&error.message==='oversized')throw error;}
  const receipt=(result as {feedback_id?:unknown}|undefined)?.feedback_id;
  if(!response.ok||(result as {ok?:unknown}|undefined)?.ok!==true||!Number.isInteger(receipt)||Number(receipt)<=0)throw new Error('unconfirmed');
  return {ok:true,feedbackId:Number(receipt)};
 }catch(error){
  if(error instanceof Error&&error.message.startsWith('Please wait'))throw error;
  throw new Error('Could not confirm delivery. Your draft is still here; check your connection and try again later.');
 }finally{clearTimeout(timeout);}
}
