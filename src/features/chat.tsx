'use client';
import {useState} from 'react';
import {Send,KeyRound,Shield} from 'lucide-react';
import {Panel,External} from '@/components/ui';
import {PageHeading} from './shared';
import type {Snapshot} from '@/core/types';

const OPENBROKER_URL='https://api.openbroker.gonka.gg/v1/chat/completions';
// DeepSeek-V4-Flash is the proven-available default (live-tested 200). GLM-5.3-Flash
// is popular and frequently 429s under contention; MiniMax on this account was
// 'participant request budget exhausted'. Both remain selectable.
const MODEL='deepseek-ai/DeepSeek-V4-Flash-0731';

interface Msg{role:'user'|'assistant';content:string;}

export function ChatConsole({s}:{s:Snapshot}){
  const [key,setKey]=useState<string>(()=>{try{return localStorage.getItem('gonkastats-openbroker-key')??'';}catch{return '';}});
  const [showKey,setShowKey]=useState(false);
  const [model,setModel]=useState(MODEL);
  const [messages,setMessages]=useState<Msg[]>([]);
  const [input,setInput]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const saveKey=(k:string)=>{setKey(k);try{localStorage.setItem('gonkastats-openbroker-key',k);}catch{}};
  const send=async()=>{
    const text=input.trim();if(!text||busy)return;if(!key){setError('Enter your OpenBroker API key to send.');return;}
    setInput('');setError(null);setBusy(true);
    const next:Msg[]=[...messages,{role:'user',content:text}];setMessages(next);
    try{
      const res=await fetch(OPENBROKER_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model,messages:next.map(({role,content})=>({role,content})),max_tokens:1200})});
      const data=await res.json();
      if(!res.ok)throw new Error(data?.error?.message??('HTTP '+res.status));
      const out=data?.choices?.[0]?.message?.content?.trim();
      if(!out)throw new Error('Empty response from OpenBroker.');
      setMessages([...next,{role:'assistant',content:out}]);
    }catch(e:any){setError(e.message??'Request failed.');setMessages(next);}
    finally{setBusy(false);}
  };
  const catalog=(s?.models?.length?s.models:[{id:MODEL,name:'DeepSeek-V4-Flash'}]);const modelOptions=[{id:MODEL,name:'DeepSeek-V4-Flash (default)'},...catalog.filter(m=>m.id!==MODEL&&m.id!=='MiniMaxAI/MiniMax-M2.7')];
  return <><PageHeading eyebrow="WORKSPACE / CHAT" title="Ask Gonka's models" description="A bring-your-own-key console. Requests go straight from this browser to OpenBroker; this site never sees or stores your key server-side." snapshot={s}/><Panel title="Connect your OpenBroker key" description="Your key is kept only in this browser's local storage and sent directly to api.openbroker.gonka.gg. It is never transmitted to gonkastats, and no wallet/signing is ever requested."><div className="key-input"><KeyRound size={15}/><input type={showKey?'text':'password'} value={key} onChange={e=>saveKey(e.target.value)} placeholder="obk-… paste your OpenBroker API key" aria-label="OpenBroker API key"/><button onClick={()=>setShowKey(v=>!v)}>{showKey?'Hide':'Show'}</button></div><div className="form-grid"><div><small>Model</small><select value={model} onChange={e=>setModel(e.target.value)}>{modelOptions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div></div><p className="small muted">Free-tier accounts are subject to a concurrent-request rate limit. Costs, if any, are billed to the key you paste; this page adds no mark-up and sets a 1,200-token output cap.</p></Panel><Panel title="Console" description="Send a message to OpenBroker. Responses stream back as a single completion."><div className="chat-log" aria-live="polite">{messages.length===0&&<p className="muted chat-empty">No messages yet. Ask a question to get started.</p>}{messages.map((m,i)=><div key={i} className={'chat-msg '+(m.role==='user'?'user':'assistant')}><span className="chat-role">{m.role==='user'?'You':'Model'}</span><pre className="chat-content">{m.content}</pre></div>)}</div>{error&&<div className="chat-error">{error}</div>}<div className="chat-compose"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey))send();}} placeholder="Ask about Gonka, models, or costs… (Ctrl/Cmd+Enter to send)" rows={2}/><button className="button primary" disabled={busy||!input.trim()} onClick={send}><Send size={15}/>{busy?'Sending…':'Send'}</button></div></Panel><Panel title="Privacy & cost"><div className="notice"><Shield size={18}/><p>This is an independent, read-only observatory. The chat console sends messages directly from your browser to <External href="https://openbroker.gonka.gg">OpenBroker</External>; GonkaStats does not proxy, log, or bill your requests, and never asks for a wallet seed or private key.</p></div></Panel></>;
}
