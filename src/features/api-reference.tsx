'use client';
import {useState} from 'react';
import {Code2,Braces,ShieldCheck,Play,ChevronDown} from 'lucide-react';
import {apiDefinitions,type ApiDefinition} from '@/core/api-definitions';
import type {Snapshot} from '@/core/types';
import {Panel,Metric,Badge,CopyButton,External} from '@/components/ui';
import {PageHeading,RawRecord} from './shared';
function ReferenceCard({definition:d}:{definition:ApiDefinition}){
 const [values,setValues]=useState<Record<string,string>>(Object.fromEntries(d.parameters.filter(p=>p.default).map(p=>[p.name,p.default!])));
 const [busy,setBusy]=useState(false),[result,setResult]=useState<unknown>(null),[http,setHttp]=useState<number|null>(null);
 const query=new URLSearchParams(Object.entries(values).filter(([,v])=>v!==''));
 const path='/api/v1/'+d.id+(query.size?'?'+query:'');
 async function run(){setBusy(true);setResult(null);setHttp(null);try{const response=await fetch(path,{signal:AbortSignal.timeout(20000)});setHttp(response.status);setResult(await response.json());}catch(e){setResult({error:e instanceof Error?e.message:'Request failed'});}finally{setBusy(false);}}
 return <details className="reference-card" data-testid={'api-example-'+d.id}>
 <summary><Badge tone="green">GET</Badge><code>/api/v1/{d.id}</code><span>{d.title}</span><ChevronDown size={14}/></summary>
 <div className="reference-body"><p>{d.description}</p><Badge>{d.cache}</Badge>
 {d.parameters.length>0&&<div className="reference-params">{d.parameters.map(p=><label key={p.name}>{p.name}{p.required?' *':''}<small className="muted" style={{display:'block'}}>{p.description}</small>{p.enum?<select aria-label={d.id+' '+p.name} value={values[p.name]??''} onChange={e=>setValues({...values,[p.name]:e.target.value})}><option value="">{p.required?'Choose a value':'Default / none'}</option>{p.enum.map(v=><option key={v}>{v}</option>)}</select>:<input aria-label={d.id+' '+p.name} value={values[p.name]??''} maxLength={500} onChange={e=>setValues({...values,[p.name]:e.target.value})}/>}</label>)}</div>}
 <pre className="code-sample">curl &apos;http://localhost:3000{path}&apos;</pre>
 <div className="inline-controls"><CopyButton text={'curl http://localhost:3000'+path} label="Copy curl"/><button className="button primary" disabled={busy} onClick={run}><Play size={13}/>{busy?'Reading…':'Try it'}</button>{http!==null&&<Badge tone={http<400?'green':'amber'}>HTTP {http}</Badge>}</div>
 {result!==null&&<div className="api-result"><RawRecord data={result}/></div>}</div></details>;
}
export function ApiReference({s}:{s:Snapshot}){
 const [group,setGroup]=useState('All');const groups=['All',...new Set(apiDefinitions.map(d=>d.group))];
 return <><PageHeading eyebrow="PLATFORM / DEVELOPERS" title="One data layer. Many ways in." description="A real read-only API, interactive examples, chart observations, and reproducible cost scenarios." snapshot={s}/>
 <div className="metric-grid three"><Metric label="Implemented GET routes" value={apiDefinitions.length} note="Counted from the shared implementation registry" icon={<Braces size={18}/>}/><Metric label="Authentication required" value={0} note="Public observations only; no private account API" icon={<ShieldCheck size={18}/>}/><Metric label="Executable mutation routes" value={0} note="No wallets, broadcasts, or billable inference" icon={<Code2 size={18}/>}/></div>
 <div className="grid-two"><Panel title="Quick start"><pre className="code-sample">curl http://localhost:3000/api/v1/metrics</pre><p>Responses include <code>data</code> and <code>meta</code>. Inspect source status, units, and coverage before using a metric. Ledger amounts stay decimal strings.</p><CopyButton text="curl http://localhost:3000/api/v1/metrics" label="Copy quick start"/></Panel><Panel title="Built for honest integrations"><p>ETags support conditional reads. Public responses use a short shared cache. A process-wide budget limits this API to 240 reads/minute; new chain lookups have a separate 30/minute budget. Multi-instance deployments need an edge-wide limiter.</p><External href="/api/v1/openapi">OpenAPI specification</External><span> · </span><External href="/llms.txt">Agent discovery</External></Panel></div>
 <section id="reference"><div className="section-heading"><div><div className="eyebrow">API REFERENCE</div><h2>Explore the working endpoints.</h2></div><Badge>v1 · JSON · READ ONLY</Badge></div><div className="reference-groups" aria-label="API groups">{groups.map(g=><button key={g} className="button" aria-pressed={group===g} onClick={()=>setGroup(g)}>{g}</button>)}</div>{apiDefinitions.filter(d=>group==='All'||d.group===group).map(d=><ReferenceCard key={d.id} definition={d}/>)}</section>
 <Panel title="From VeniceStats inspiration to Gonka-specific tools"><p>The reference pattern is depth: useful aggregates, bounded time series, transparent source health, real examples, and API/UI calculation parity. GonkaStats applies it to declared compute weight, epoch transitions, current escrow pricing, and provider boundaries—not Venice-specific staking or burn mechanics.</p><div className="chip-list"><External href="https://venicestats.com/developers#reference">VeniceStats reference</External><External href="https://rpc.gonka.gg/agents">Gonka agent guide</External></div></Panel></>;
}
