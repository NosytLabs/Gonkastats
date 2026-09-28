'use client';
import {Badge,DataTable} from '@/components/ui';
import type {ProtocolModelStatus} from '@/core/protocol';
import type {ProviderMetadata} from '@/core/providers';
import type {Model} from '@/core/types';

// Keep table callbacks within the client boundary. Server views pass only rows.
const yn=(value:boolean|null)=>value===null?'Unknown':value?'Yes':'No';
const tone=(state:string)=>state==='active'?'green':state==='registered-inactive'?'amber':state==='unknown'?'muted':'blue';

export function ProtocolModelsTable({rows}:{rows:ProtocolModelStatus[]}){return <DataTable rows={rows} rowKey={row=>row.id} exportName="protocol model lifecycle" pageSize={10} columns={[
   {key:'model',label:'Model',value:r=>r.name,render:r=><div><strong>{r.name}</strong><br/><code className="small">{r.id}</code></div>},
   {key:'state',label:'Observed state',value:r=>r.state,render:r=><Badge tone={tone(r.state)}>{r.state.replaceAll('-',' ')}</Badge>},
   {key:'network',label:'Network API',value:r=>yn(r.networkAvailable)},
   {key:'poc',label:'PoC params',value:r=>yn(r.pocActive)},
   {key:'provider',label:'OpenBroker',value:r=>yn(r.providerAvailable)},
   {key:'governance',label:'Governance registry',value:r=>yn(r.governanceRegistered)},
   {key:'scale',label:'Weight scale',value:r=>r.weightScaleFactor},
  ]}/>;}

export function ProtocolVersionsTable({rows}:{rows:{key:string;value:string}[]}){return <DataTable rows={rows} rowKey={r=>r.key} exportName="software versions" pageSize={8} columns={[{key:'key',label:'Field',value:r=>r.key},{key:'value',label:'Observed value',value:r=>r.value}]}/>;}

export function ProtocolParametersTable({rows}:{rows:{key:string;value:string}[]}){return <DataTable rows={rows} rowKey={r=>r.key} exportName="protocol parameters" pageSize={12} columns={[{key:'parameter',label:'Parameter',value:r=>r.key},{key:'value',label:'Value',value:r=>r.value}]}/>;}

export function ProvidersTable({rows}:{rows:ProviderMetadata[]}){return <DataTable rows={rows} rowKey={r=>r.id} exportName="providers" columns={[{key:'provider',label:'Provider',value:r=>r.name},{key:'scope',label:'Scope',value:r=>r.scope},{key:'status',label:'GonkaStats state',value:r=>r.status,render:r=><Badge tone={r.status==='observed'?'green':'muted'}>{r.status}</Badge>},{key:'private',label:'Private usage',value:r=>r.privateUsage},{key:'billing',label:'Billing / operation',value:r=>r.billing}]}/>;}

export function ProxyModelsTable({rows}:{rows:Model[]}){return <DataTable rows={rows} rowKey={m=>m.id} exportName="proxy model metadata" columns={[{key:'model',label:'Model',value:m=>m.name},{key:'context',label:'Context',value:m=>m.context},{key:'output',label:'Max output',value:m=>m.output},{key:'tools',label:'Tools',value:m=>m.tools===null?'unknown':m.tools?'reported yes':'reported no'},{key:'price',label:'USD / 1M',value:m=>m.price}]}/>;}
