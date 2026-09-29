import {ProtocolModelsTable,ProtocolVersionsTable,ProtocolParametersTable} from './observation-tables';
import Link from 'next/link';
import {Activity,Cpu,GitBranch,Layers,Radio,ShieldCheck} from 'lucide-react';
import {Badge,Empty,External,Metric,Panel,Proof} from '@/components/ui';
import {buildProtocolSnapshot} from '@/core/protocol';
import {hasObservation} from '@/core/insights';
import type {Snapshot} from '@/core/types';
import {ObservationBar,PageHeading} from './shared';

export function ProtocolRadar({s}:{s:Snapshot}){
 const p=buildProtocolSnapshot(s),paramsObserved=hasObservation(s,'params'),versionsObserved=hasObservation(s,'versions');
 const parameters=Object.entries(s.protocol).filter(([key])=>['poc_params.','devshard_escrow_params.','collateral_params.','delegation_params.','epoch_params.'].some(prefix=>key.startsWith(prefix))).map(([key,value])=>({key,value}));
 const versions=Object.entries(p.versions).map(([key,value])=>({key,value}));
 return <div className="observatory-v2"><PageHeading eyebrow="PROTOCOL / CURRENT STATE" title="Protocol radar" description="Current chain rules, model lifecycle and approved runtimes—separate from provider availability and proposal text." snapshot={s}/><ObservationBar s={s}/>
 <div className="metric-grid">
  <Metric label="Current epoch" value={s.epoch?String(s.epoch.id):null} note={s.epoch?.phase??'Epoch source unavailable'} icon={<Activity size={17}/>}/>
  <Metric label="Network API models" value={hasObservation(s,'networkModels')?s.networkModels.length:null} kind="number" note="Gonka API node · not provider availability" icon={<Cpu size={17}/>}/>
  <Metric label="PoC parameter models" value={paramsObserved?s.pocModels.length:null} kind="number" note="Current chain inference params" icon={<GitBranch size={17}/>}/>
  <Metric label="Approved DevShard runtimes" value={paramsObserved?s.devshardVersions.length:null} kind="number" note="Current escrow parameter list" icon={<Layers size={17}/>}/>
  <Metric label="Node software" value={versionsObserved?p.versions['node_version.version']??null:null} note="Version API observation" icon={<Radio size={17}/>}/>
  <Metric label="RPC catalog definitions" value={hasObservation(s,'catalog')?p.endpointCount:null} kind="number" note="Structured discovery catalog" icon={<ShieldCheck size={17}/>}/>
 </div>
 <Panel title="Model lifecycle across chain and providers" description="A model can be governance-registered, in current PoC parameters, returned by the network API, and offered by a provider independently." footer={<Proof snapshot={s} ids={['networkModels','params','governanceModels','models']}/>}>
  {p.models.length?<ProtocolModelsTable rows={p.models}/>:<Empty>Model lifecycle sources are unavailable. No empty registry is treated as an observed zero.</Empty>}
  <p className="chart-explainer">“Active” here means the model appears in both the current Gonka network model list and current PoC parameter set. It is not a quality, capacity, profitability, or uptime score.</p>
 </Panel>
 <div className="grid-two">
  <Panel title="Approved DevShard runtimes" description="Current chain escrow parameter metadata—not a claim that every provider is serving every version." footer={<Proof snapshot={s} ids={['params']}/>}>
   {paramsObserved&&s.devshardVersions.length?<div className="table-scroll" tabIndex={0} role="region" aria-label="Approved DevShard runtimes"><table><thead><tr><th>Runtime</th><th>SHA-256</th><th>Binary</th></tr></thead><tbody>{s.devshardVersions.map(v=><tr key={v.name}><td><Badge tone="green">{v.name}</Badge></td><td><code>{v.sha256?v.sha256.slice(0,16)+'…':'—'}</code></td><td>{v.binary&&/^https:\/\//.test(v.binary)?<External href={v.binary}>Artifact</External>:v.binary?<code>Untrusted URL omitted</code>:'—'}</td></tr>)}</tbody></table></div>:<Empty>Approved runtime metadata is unavailable from the current parameter observation.</Empty>}
  </Panel>
  <Panel title="Software versions" description="Flattened values returned by /v1/versions; blank upstream fields stay blank." footer={<Proof snapshot={s} ids={['versions']}/>}>
   {versionsObserved&&versions.length?<ProtocolVersionsTable rows={versions}/>:<Empty>Software version metadata is unavailable.</Empty>}
  </Panel>
 </div>
 <Panel title="Current chain parameters" description="Exact scalar values from current inference params. Existing escrows or historical epochs can retain older terms." footer={<Proof snapshot={s} ids={['params']}/>}>
  {paramsObserved&&parameters.length?<ProtocolParametersTable rows={parameters}/>:<Empty>Current parameter data is unavailable.</Empty>}
 </Panel>
 <div className="reader-note"><GitBranch size={18}/><div><strong>Proposal is not execution.</strong> Governance pages show proposals and tallies separately; this page emphasizes state actually returned by current chain/API sources.</div><Link href="/governance">Inspect governance</Link></div>
 </div>;
}
