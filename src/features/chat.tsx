'use client';
import {useState} from 'react';
import {Send,KeyRound,Shield} from 'lucide-react';
import {Panel,External} from '@/components/ui';
import {PageHeading} from './shared';
import type {Snapshot} from '@/core/types';

// Providers. AntSeed is a local, free OpenAI-compatible proxy on this machine
// (127.0.0.1:8377, key 'antseed') and is the reliable default. OpenBroker is the
// hosted Gonka gateway and is bring-your-own-key. Neither key reaches the
// GonkaStats server; requests go straight from this browser to the chosen host.
const PROVIDERS=[
  {id:'antseed',name:'AntSeed (local · free)',base:'http://127.0.0.1:8377/v1',defaultKeyValue:'antseed',model:'deepseek-v4-flash',modelsHint:'274 local models'},
  {id:'openbroker',name:'OpenBroker (hosted · BYOK)',base:'https://api.openbroker.gonka.gg/v1',defaultKeyValue:'',model:'deepseek-ai/DeepSeek-V4-Flash-0731',modelsHint:'GLM contended · MiniMax budget-exhausted'},
] as const;
type ProviderId=typeof PROVIDERS[number]['id'];

interface Msg{role:'user'|'assistant';content:string;}

export function ChatConsole({s}:{s:Snapshot}){
  const [providerId,setProviderId]=useState<ProviderId>(()=>{try{return (localStorage.getItem('gonkastats-chat-provider') as ProviderId)||'antseed';}catch{return 'antseed';}});
  const provider=PROVIDERS.find(p=>p.id===providerId)!;
  const [key,setKey]=useState<string>(()=>{try{return localStorage.getItem('gonkastats-chat-key')??'';}catch{return '';}});
  const [showKey,setShowKey]=useState(false);
  const [model,setModel]=useState<string>(provider.model);
  const [messages,setMessages]=useState<Msg[]>([]);
  const [input,setInput]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const effectiveKey=key||provider.defaultKeyValue;
  const saveKey=(k:string)=>{setKey(k);try{localStorage.setItem('gonkastats-chat-key',k);}catch{}};
  const switchProvider=(id:ProviderId)=>{const p=PROVIDERS.find(x=>x.id===id)!;setProviderId(id);setModel(p.model);try{localStorage.setItem('gonkastats-chat-provider',id);}catch{}};
  const send=async()=>{
    const text=input.trim();if(!text||busy)return;if(!effectiveKey){setError('Enter a key for this provider to send.');return;}
    setInput('');setError(null);setBusy(true);
    const next:Msg[]=[...messages,{role:'user',content:text}];setMessages(next);
    try{
      const url=providerId==='antseed'?'/api/chat':(provider.base+'/chat/completions');
      const headers:Record<string,string>={'Content-Type':'application/json'};
      if(providerId!=='antseed')headers['Authorization']='Bearer '+effectiveKey;
      const res=await fetch(url,{method:'POST',headers,body:JSON.stringify({model,messages:next.map(({role,content})=>({role,content})),max_tokens:1200})});
      const data=await res.json();
      if(!res.ok)throw new Error(data?.error?.message??('HTTP '+res.status));
      const out=data?.choices?.[0]?.message?.content?.trim();
      if(!out)throw new Error('Empty response.');
      setMessages([...next,{role:'assistant',content:out}]);
    }catch(e:any){setError(e.message??'Request failed.');setMessages(next);}
    finally{setBusy(false);}
  };
  const catalog=(s?.models?.length?s.models:[{id:PROVIDERS[1].model,name:'DeepSeek-V4-Flash'}]).filter(m=>m.id!=='MiniMaxAI/MiniMax-M2.7');
  return <><PageHeading eyebrow="WORKSPACE / CHAT" title="Ask Gonka's models" description="A chat console. Defaults to a local, free AntSeed proxy; OpenBroker is available as a bring-your-own-key hosted option. Requests go straight from this browser to the chosen host." snapshot={s}/><Panel title="Provider & connection"><div className="form-grid"><div><small>Provider</small><select value={providerId} onChange={e=>switchProvider(e.target.value as ProviderId)}>{PROVIDERS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><p className="small muted">{provider.modelsHint}</p></div>{providerId==='antseed'?<div><small>Endpoint</small><code className="code-sample">{provider.base}</code><p className="small muted">Free local proxy on this machine · no spend</p></div>:<div><small>OpenBroker API key</small><div className="key-input"><KeyRound size={15}/><input type={showKey?'text':'password'} value={key} onChange={e=>saveKey(e.target.value)} placeholder="obk-… paste your OpenBroker API key" aria-label="OpenBroker API key"/><button onClick={()=>setShowKey(v=>!v)}>{showKey?'Hide':'Show'}</button></div><p className="small muted">Stored only in this browser; sent directly to api.openbroker.gonka.gg, never to gonkastats.</p></div>}</div><div className="form-grid"><div><small>Model</small>{providerId==='antseed'?<code className="code-sample">{model}</code>:<select value={model} onChange={e=>setModel(e.target.value)}>{catalog.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>}</div></div><p className="small muted">AntSeed is free and reliable. On OpenBroker, GLM-5.3-Flash frequently 429s under contention and MiniMax was budget-exhausted on this account; DeepSeek-V4-Flash is the proven-available hosted model.</p></Panel><Panel title="Console" description="Send a message. Responses return as a single completion."><div className="chat-log" aria-live="polite">{messages.length===0&&<p className="muted chat-empty">No messages yet. Ask a question to get started.</p>}{messages.map((m,i)=><div key={i} className={'chat-msg '+(m.role==='user'?'user':'assistant')}><span className="chat-role">{m.role==='user'?'You':'Model'}</span><pre className="chat-content">{m.content}</pre></div>)}</div>{error&&<div className="chat-error">{error}</div>}<div className="chat-compose"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey))send();}} placeholder={'Ask about Gonka, models, or costs… (Ctrl/Cmd+Enter · '+provider.name+')'} rows={2}/><button className="button primary" disabled={busy||!input.trim()} onClick={send}><Send size={15}/>{busy?'Sending…':'Send'}</button></div></Panel><Panel title="Privacy & cost"><div className="notice"><Shield size={18}/><p>This is an independent, read-only observatory. The chat sends messages straight from this browser to the provider you chose — AntSeed (local, free) or <External href="https://openbroker.gonka.gg">OpenBroker</External> (your key). GonkaStats does not proxy, log, or bill your requests, and never asks for a wallet seed or private key.</p></div></Panel></>;
}
