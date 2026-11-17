import {useRef,useState} from 'react';
import {Check,MessageSquare,Send,X} from 'lucide-react';
import {sendFeedback,type FeedbackKind} from './feedback';
import './feedback.css';

const kinds:[FeedbackKind,string][]=[['suggestion','Suggestion'],['bug','Problem'],['other','Other']];

export default function FeedbackDialog({onClose}:{onClose:()=>void}){
 const messageField=useRef<HTMLTextAreaElement>(null),sending=useRef(false);
 const [body,setBody]=useState(''),[email,setEmail]=useState(''),[kind,setKind]=useState<FeedbackKind>('suggestion'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState<number|null>(null);
 const hasMessage=Boolean(body.trim());
 const send=async()=>{if(sending.current)return;if(!hasMessage){setError('Enter a message before sending.');messageField.current?.focus();return;}sending.current=true;setBusy(true);setError('');setReceipt(null);try{const result=await sendFeedback({body,kind,email});setReceipt(result.feedbackId);setBody('');setEmail('');}catch(reason){setError(reason instanceof Error?reason.message:'Could not confirm delivery. Your draft is still here.');}finally{sending.current=false;setBusy(false);}};
 return <div className="feedback-backdrop" role="presentation"><section className="feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
  <header><div><small>HELP SHAPE THE DEFENSE</small><h2 id="feedback-title"><MessageSquare size={22}/>Share feedback</h2></div><button className="feedback-close" type="button" aria-label="Close feedback" disabled={busy} onClick={onClose}><X size={20}/></button></header>
  <p>Report a problem or share an idea with Forged by Fire Software.</p>
  {receipt&&<div className="feedback-success" role="status"><Check size={19}/><span>Thank you. Your feedback was received.<small>Receipt #{receipt}</small></span></div>}
  <form onSubmit={event=>{event.preventDefault();void send();}}>
   <fieldset disabled={busy}><legend>Category</legend><div className="feedback-kinds">{kinds.map(([value,label])=><button key={value} type="button" className={kind===value?'selected':''} aria-pressed={kind===value} onClick={()=>setKind(value)}>{label}</button>)}</div></fieldset>
   <label>Message<textarea ref={messageField} autoFocus value={body} maxLength={4000} disabled={busy} onChange={event=>setBody(event.target.value)} placeholder="What happened, or what would improve the game?"/></label>
   <div className="feedback-message-meta"><small>{hasMessage?'Message ready to send.':'A message is required.'}</small><small>{body.length.toLocaleString()} / 4,000</small></div>
   <label>Reply email <small>(optional)</small><input type="email" autoComplete="email" value={email} maxLength={254} disabled={busy} onChange={event=>setEmail(event.target.value)} placeholder="Only if you would like a reply"/></label>
   <details><summary>Privacy details</summary><p>Sends only your message, category, optional reply email and app version over HTTPS. Maps, saves, progression, player activity, device details and installation identifiers are not attached. Unsent drafts remain only in this form and are not retried automatically.</p></details>
   {error&&<p className="feedback-error" role="alert">{error}</p>}
   <footer><button type="button" disabled={busy} onClick={onClose}>Close</button><button className="feedback-send" type="submit" disabled={busy||!hasMessage}><Send size={17}/>{busy?'Sending…':'Send feedback'}</button></footer>
  </form>
 </section></div>;
}
