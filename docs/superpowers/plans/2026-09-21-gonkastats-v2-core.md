# GonkaStats v2 Core Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade GonkaStats into a clearer, more current Gonka network observatory with protocol radar, model lifecycle context, provider/source observability, richer agent/developer tooling, and tighter UI/data architecture without weakening exact-data safeguards.

**Architecture:** Keep the existing Next.js App Router application and normalized snapshot model. Add protocol/provider/source metadata as derived, tested core services; feed those same services to UI and `/api/v1`; keep all upstream I/O in the collector/service layer and all browser filters client-only/shareable. Historical storage remains optional and no paid/private integrations are activated.

**Tech Stack:** Next.js 16.3.5, React 19.3, TypeScript 6 strict mode, Zod 4.6.5, Decimal.js 10.6, Recharts 3.10.1, PostgreSQL/Drizzle optional history, Vitest 5, Playwright 1.63, axe.

**Spec:** `docs/superpowers/specs/2026-09-21-gonkastats-v2-design.md`

## Global Constraints

- Keep the existing Next.js App Router application; do not rewrite the stack.
- GonkaStats remains an independent Nosyt Labs community site.
- Missing data displays unavailable/`—`, never zero unless the source actually reports zero.
- Never substitute blockchain/provider/account populations for unavailable network inference data.
- Preserve exact large integers and decimal strings through parsing, calculation, API serialization, sorting and CSV.
- Keep chain, indexer, provider, account, probe and derived scopes explicit.
- Public site stays read-only: no broadcast, voting, signing, withdrawals, escrow creation or paid inference.
- Keep upstream credentials server-only and restrict remote calls to allowlisted origins.
- Runtime-discovered endpoint/tool counts are derived from registries/catalogs, never hardcoded marketing counts.
- Use URL state for client-only filters with `useSearchParams` plus native history updates; do not refetch the server tree for local filtering.
- No public deployment/domain, private OpenBroker credential storage, paid G-Meter probing, Pulse ingestion or Feather provisioning in this plan.
- Every new helper or behavior change follows RED → GREEN → refactor TDD.
- Final merge requires locked install, unit/contract tests, strict typecheck, lint, production build, bounded public snapshot and all browser QA suites.

## Review Focus

1. **Discovery-count disagreement:** `/api/endpoints.total_endpoints` can differ from text on `/agents`; display the structured catalog count and a warning only when the flattened catalog disagrees with its own declared total.
2. **Partial provider refresh:** a fresh Proxy capability/price read with failed OpenBroker catalog must update only fields backed by the successful source while preserving stale catalog availability.
3. **Epoch shape drift:** nested `epoch_params`, numeric strings, absent ML-node fields and missing optional model/runtime fields must yield unknowns rather than crashes/zeros.
4. **Catalog write operations:** RPC discovery can contain POST/write/broadcast paths; they must be visible as documentation but never executable through GonkaStats curated tooling.
5. **Mobile dense tables:** provider/source/protocol comparison tables must remain keyboard-scrollable and avoid whole-page horizontal overflow at 390px.

---

## File Structure Map

### Core contracts and derivation
- Create `src/core/protocol.ts`: protocol model/runtime/status derivation from already-observed data.
- Create `src/core/source-dependencies.ts`: route/feature → source dependency registry and status summaries.
- Modify `src/core/types.ts`: add optional protocol/version fields to normalized snapshot/epoch without breaking retained snapshots.
- Modify `src/core/normalize.ts`: parse current epoch model/runtime metadata and software versions defensively.
- Modify `src/core/collect.ts`: collect `/v1/versions` and governance model metadata and reconcile per source.
- Modify `src/core/sources.ts`: register new sources and source-specific TTL/coverage text.

### UI
- Create `src/features/protocol.tsx`: Protocol Radar.
- Create `src/features/providers.tsx`: canonical provider directory/detail presentation.
- Modify `src/features/overview.tsx`: command-center hierarchy and protocol/source cards.
- Modify `src/features/model-explorer.tsx`: lifecycle/source rows in cards/table/comparison.
- Modify `src/features/network.tsx`: protocol/model context and clearer compute source boundaries.
- Modify `src/features/platform.tsx`: source dependency/status center and Pulse/network-update reading room.
- Modify `src/features/tools.tsx`: Agent Workbench namespace/method/safety UX.
- Modify `src/components/shell.tsx`: add Protocol and canonical Providers navigation while keeping old broker URLs compatible.
- Modify `src/app/[[...route]]/page.tsx`: add protocol/providers canonical routes and aliases.
- Modify `src/app/globals.css`, `src/app/observatory.css`, `src/app/audit.css`: shared dense layouts only where existing tokens/components are insufficient.

### API/developer
- Modify `src/core/api-definitions.ts`: register protocol/source-health/provider metadata endpoints.
- Modify `src/core/api-data.ts`: return derived services without duplicate calculations.
- Modify `src/app/api/v1/[resource]/route.ts`: validate new read-only resources.
- Modify `src/core/openapi.ts`: generated paths remain registry-driven.
- Modify `public/llms.txt` and `AGENTS.md`: advertise only implemented GonkaStats reads and upstream discovery safety.

### Tests and browser QA
- Create `tests/protocol.test.ts`.
- Create `tests/source-dependencies.test.ts`.
- Extend `tests/normalize.test.ts`, `tests/collector-reconciliation.test.ts`, `tests/api-contract.test.ts`.
- Create `scripts/v2-qa.mjs`.
- Modify `package.json` to include `v2-qa.mjs` in `test:e2e` after it passes independently.

---

### Task 1: Protocol metadata contracts and epoch compatibility

**Files:**
- Create: `src/core/protocol.ts`
- Modify: `src/core/types.ts`
- Modify: `src/core/normalize.ts`
- Test: `tests/protocol.test.ts`
- Test: `tests/normalize.test.ts`

**Interfaces:**
- Consumes: normalized `Snapshot`, `Model`, `Epoch`.
- Produces:
  - `ProtocolModelState = 'poc-active' | 'provider-only' | 'poc-only' | 'unknown'`
  - `ProtocolModelStatus`
  - `ProtocolSnapshot`
  - `buildProtocolSnapshot(snapshot: Snapshot): ProtocolSnapshot`
  - `Epoch.pocModels: string[]`
  - `Epoch.devshardVersions: string[]`
  - `Snapshot.versions: Record<string,string>`

- [ ] **Step 1: Write failing protocol derivation tests**

```ts
import {describe,it,expect} from 'vitest';
import {buildProtocolSnapshot} from '../src/core/protocol';
import {emptySnapshot} from '../src/core/sources';

describe('buildProtocolSnapshot', () => {
  it('separates PoC-active, provider-only and PoC-only models', () => {
    const s=emptySnapshot();
    s.epoch={id:401,height:1,phase:'Inference',start:1,end:2,progress:0,remaining:1,boundaries:[],pocModels:['a','c'],devshardVersions:['v4.1','v5']};
    s.models=[
      {id:'a',name:'A',slug:'61',provider:'openbroker',context:null,output:null,vram:null,tools:null,reasoning:null,price:null,ngonka:null,hfRepo:null,hfCommit:null},
      {id:'b',name:'B',slug:'62',provider:'openbroker',context:null,output:null,vram:null,tools:null,reasoning:null,price:null,ngonka:null,hfRepo:null,hfCommit:null},
    ];
    expect(buildProtocolSnapshot(s).models.map(x=>[x.id,x.state])).toEqual([
      ['a','poc-active'],['b','provider-only'],['c','poc-only'],
    ]);
  });

  it('never turns an absent epoch model set into an empty authoritative set', () => {
    const s=emptySnapshot();
    expect(buildProtocolSnapshot(s).pocModelCoverage).toBe('unavailable');
  });

  it('accepts retained v1 snapshots that predate version metadata',()=>{
    const s:any=emptySnapshot();
    delete s.versions;
    expect(buildProtocolSnapshot(s).versions).toEqual({});
  });
});
```

- [ ] **Step 2: Run the new tests and verify RED**

Run:

```bash
npm test -- tests/protocol.test.ts
```

Expected: FAIL because `src/core/protocol.ts`, `Epoch.pocModels`, and `Epoch.devshardVersions` do not exist.

- [ ] **Step 3: Add epoch-shape regression tests before parser changes**

Add fixtures in `tests/normalize.test.ts` for both nesting forms:

```ts
it('reads PoC models from nested epoch params and numeric-string payloads',()=>{
  const data={
    block_height:'100',
    latest_epoch:{index:'8',epoch_params:{epoch_params:{poc_params:{models:[
      {model:'MiniMaxAI/MiniMax-M2.7'}
    ]},devshard_params:{approved_versions:[{name:'v5'}]}}}},
    phase:'Inference',
    epoch_stages:{poc_start:'90',poc_validation_start:'91',poc_validation_end:'92',set_new_validators:'93',next_poc_start:'110'}
  };
  const e=epochData(data);
  expect(e.pocModels).toEqual(['MiniMaxAI/MiniMax-M2.7']);
  expect(e.devshardVersions).toEqual(['v5']);
});
```

Also add a variant with top-level `epoch_params` and one with those optional fields absent; absent fields must produce empty arrays **plus an explicit coverage flag in the protocol derivation**, not a claim that zero models/versions are approved.

- [ ] **Step 4: Run parser tests and verify RED**

```bash
npm test -- tests/normalize.test.ts
```

Expected: new expectations fail because current `epochData` ignores these fields.

- [ ] **Step 5: Implement minimal normalized protocol fields**

In `src/core/types.ts` extend:

```ts
export interface Epoch {
  id:number; height:number; phase:string; start:number; end:number;
  boundaries:{label:string;height:number}[]; progress:number; remaining:number;
  pocModels:string[];
  devshardVersions:string[];
}
export interface Snapshot {
  // existing fields...
  versions:Record<string,string>;
}
```

Update `emptySnapshot()` to initialize `versions:{}`.

In `src/core/normalize.ts`, add focused helpers:

```ts
function optionalRecord(value:unknown):Record<string,unknown>|null {
  return value && typeof value==='object' && !Array.isArray(value) ? value as Record<string,unknown> : null;
}
function epochParams(payload:Record<string,unknown>):Record<string,unknown>|null {
  const latest=optionalRecord(payload.latest_epoch);
  const first=optionalRecord(payload.epoch_params) ?? optionalRecord(latest?.epoch_params);
  return optionalRecord(first?.epoch_params) ?? first;
}
function modelIds(value:unknown):string[] {
  if(!Array.isArray(value)) return [];
  return value.flatMap(item=>{
    if(typeof item==='string') return [item];
    const r=optionalRecord(item);
    return typeof r?.model==='string'?[r.model]:typeof r?.id==='string'?[r.id]:[];
  });
}
```

Use these only to populate optional normalized arrays; preserve existing epoch boundary validation.

- [ ] **Step 6: Implement protocol derivation**

Create `src/core/protocol.ts`:

```ts
import type {Snapshot} from './types';

export type ProtocolModelState='poc-active'|'provider-only'|'poc-only'|'unknown';
export interface ProtocolModelStatus {
  id:string;
  name:string;
  state:ProtocolModelState;
  providerAvailable:boolean;
  pocActive:boolean|null;
}
export interface ProtocolSnapshot {
  models:ProtocolModelStatus[];
  pocModelCoverage:'observed'|'unavailable';
  devshardVersions:string[];
  endpointCount:number|null;
  versions:Record<string,string>;
}
export function buildProtocolSnapshot(s:Snapshot):ProtocolSnapshot {
  const pocObserved=Boolean(s.epoch && s.sources.some(x=>x.id==='epoch'&&x.status!=='unavailable'));
  const poc=new Set(pocObserved?s.epoch!.pocModels:[]);
  const provider=new Map(s.models.map(m=>[m.id,m.name]));
  const ids=[...new Set([...provider.keys(),...poc])];
  return {
    models:ids.map(id=>({
      id,
      name:provider.get(id)??id.split('/').at(-1)??id,
      providerAvailable:provider.has(id),
      pocActive:pocObserved?poc.has(id):null,
      state:!pocObserved?'unknown':provider.has(id)&&poc.has(id)?'poc-active':provider.has(id)?'provider-only':'poc-only',
    })),
    pocModelCoverage:pocObserved?'observed':'unavailable',
    devshardVersions:pocObserved?s.epoch!.devshardVersions:[],
    endpointCount:s.endpoints.length||null,
    versions:{...(s.versions??{})},
  };
}
```

- [ ] **Step 7: Run protocol + normalization suites**

```bash
npm test -- tests/protocol.test.ts tests/normalize.test.ts
```

Expected: PASS.

- [ ] **Step 8: Run the full unit suite**

```bash
npm test
```

Expected: all existing and new tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/core/protocol.ts src/core/types.ts src/core/normalize.ts src/core/sources.ts tests/protocol.test.ts tests/normalize.test.ts
git commit -m "feat(protocol): normalize current model and runtime metadata"
```

---

### Task 2: Collect software/governance metadata and source dependency graph

**Files:**
- Create: `src/core/source-dependencies.ts`
- Modify: `src/core/collect.ts`
- Modify: `src/core/sources.ts`
- Modify: `src/core/normalize.ts`
- Test: `tests/source-dependencies.test.ts`
- Test: `tests/collector-reconciliation.test.ts`

**Interfaces:**
- Consumes: `Snapshot.sources`, route names, collected `/v1/versions` and `/v1/governance/models`.
- Produces:
  - `SourceDependency`
  - `dependenciesForRoute(path:string): SourceDependency[]`
  - `sourceDependents(sourceId:string): string[]`
  - normalized `Snapshot.versions`
  - optional governance-model metadata used only when successfully observed.

- [ ] **Step 1: Write source dependency tests**

```ts
import {describe,it,expect} from 'vitest';
import {dependenciesForRoute,sourceDependents} from '../src/core/source-dependencies';

describe('source dependency map',()=>{
  it('keeps provider and chain sources distinct for models',()=>{
    const ids=dependenciesForRoute('/models').flatMap(x=>x.sourceIds);
    expect(ids).toContain('models');
    expect(ids).toContain('capabilities');
    expect(ids).toContain('pricing');
    expect(ids).not.toContain('stats');
  });
  it('shows where an unavailable source matters',()=>{
    expect(sourceDependents('stats')).toContain('/inference');
    expect(sourceDependents('stats')).not.toContain('/activity');
  });
});
```

- [ ] **Step 2: Run and verify RED**

```bash
npm test -- tests/source-dependencies.test.ts
```

Expected: FAIL because the dependency registry does not exist.

- [ ] **Step 3: Implement the dependency registry**

Create `src/core/source-dependencies.ts`:

```ts
export interface SourceDependency {route:string;sourceIds:string[];purpose:string}
export const sourceDependencies:SourceDependency[]=[
 {route:'/',sourceIds:['epoch','participants','blocks','models','capabilities','pricing','governance','catalog'],purpose:'overview'},
 {route:'/protocol',sourceIds:['epoch','params','versions','governanceModels','governance','catalog'],purpose:'current protocol state'},
 {route:'/models',sourceIds:['models','capabilities','pricing','participants','epoch'],purpose:'model availability and lifecycle'},
 {route:'/network',sourceIds:['participants','hardware','epoch'],purpose:'compute membership and hardware'},
 {route:'/inference',sourceIds:['stats'],purpose:'reported inference statistics'},
 {route:'/activity',sourceIds:['blocks'],purpose:'indexed chain activity'},
 {route:'/agents',sourceIds:['catalog'],purpose:'RPC discovery'},
 {route:'/sources',sourceIds:[],purpose:'source observability'},
];
export const dependenciesForRoute=(path:string)=>sourceDependencies.filter(x=>x.route===path);
export const sourceDependents=(id:string)=>sourceDependencies.filter(x=>x.sourceIds.includes(id)).map(x=>x.route);
```

- [ ] **Step 4: Add collector regression tests for independent version/model reads**

Add a regression around the existing fetch harness:

```ts
it('retains old versions when /v1/versions fails without marking other sources stale', async()=>{
  // Seed previous.versions and successful current epoch/models/pricing responses.
  // Make only /v1/versions throw.
  const next=await collect(previous);
  expect(next.versions).toEqual(previous.versions);
  expect(next.sources.find(x=>x.id==='versions')?.status).toBe('stale');
  expect(next.sources.find(x=>x.id==='pricing')?.status).toBe('recent');
});
```

Add the symmetric governance-model failure case.

- [ ] **Step 5: Verify RED**

```bash
npm test -- tests/collector-reconciliation.test.ts
```

Expected: FAIL because the new source IDs are not collected/registered.

- [ ] **Step 6: Register sources**

In `src/core/sources.ts` add:

```ts
{id:'versions',name:'Gonka software versions',scope:'chain',coverage:'Software/runtime version metadata returned by the Gonka API node.',docs:'https://rpc.gonka.gg/v1/versions'},
{id:'governanceModels',name:'Governance model registry',scope:'chain',coverage:'Governance-registered model metadata. Registration does not prove current PoC activation or provider availability.',docs:'https://rpc.gonka.gg/v1/governance/models'},
```

Keep TTLs at five minutes unless the source itself provides a usable timestamp.

- [ ] **Step 7: Implement tolerant version/model normalization**

In `src/core/normalize.ts` add:

```ts
export function versionsData(data:unknown):Record<string,string> {
  const root=record.parse(data);
  const out:Record<string,string>={};
  const visit=(prefix:string,value:unknown)=>{
    if(typeof value==='string'||typeof value==='number'||typeof value==='boolean') out[prefix]=String(value);
    else if(value&&typeof value==='object'&&!Array.isArray(value))
      for(const [k,v] of Object.entries(value as Record<string,unknown>)) visit(prefix?prefix+'.'+k:k,v);
  };
  visit('',root);
  return out;
}
```

Do not infer semantic meanings from unknown keys; Protocol Radar can display named known fields and an exact raw table fallback.

- [ ] **Step 8: Collect new reads independently**

In `src/core/collect.ts`, add parallel reads:

```ts
read('versions',rpc+'/v1/versions',d=>{s.versions=versionsData(d);}),
read('governanceModels',rpc+'/v1/governance/models',d=>{raw.governanceModels=d; record.parse(d);}),
```

Do not use governance-model data to resurrect provider availability. It is a separate chain registry input.

- [ ] **Step 9: Run focused and full tests**

```bash
npm test -- tests/source-dependencies.test.ts tests/collector-reconciliation.test.ts
npm test
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add src/core/source-dependencies.ts src/core/collect.ts src/core/sources.ts src/core/normalize.ts tests/source-dependencies.test.ts tests/collector-reconciliation.test.ts
git commit -m "feat(sources): add protocol metadata and dependency mapping"
```

---

### Task 3: Protocol Radar and canonical provider routes

**Files:**
- Create: `src/features/protocol.tsx`
- Create: `src/features/providers.tsx`
- Modify: `src/app/[[...route]]/page.tsx`
- Modify: `src/components/shell.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/api-contract.test.ts`
- Browser: `scripts/v2-qa.mjs`

**Interfaces:**
- Consumes: `buildProtocolSnapshot(s)`, existing `Panel`, `Metric`, `Proof`, `DataTable`.
- Produces: `ProtocolRadar({s})`, `ProviderDirectory({s,id})`.
- Routes: `/protocol`, `/providers`, `/providers/openbroker`, `/providers/proxy`, `/providers/feather`; existing `/brokers/*` remains compatible.

- [ ] **Step 1: Add browser route expectations before UI implementation**

Create `scripts/v2-qa.mjs` with the first failing checks:

```js
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';

const base='http://127.0.0.1:3104';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3104'],{
  env:{...process.env,DATA_MODE:'snapshot',NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'
});
let browser;
try{
  for(let i=0;i<60;i++){try{if((await fetch(base+'/api/v1/openapi')).ok)break;}catch{}await new Promise(r=>setTimeout(r,1000));}
  browser=await chromium.launch();
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  for(const [path,heading] of [['/protocol','Protocol radar'],['/providers','Provider layers']]){
    const response=await page.goto(base+path,{waitUntil:'networkidle'});
    assert.equal(response.status(),200);
    await expect(page.getByRole('heading',{name:new RegExp(heading,'i')})).toBeVisible();
  }
} finally {await browser?.close();server.kill('SIGTERM');}
```

- [ ] **Step 2: Run against the current built app and verify RED**

After a normal build, run:

```bash
node scripts/v2-qa.mjs
```

Expected: FAIL because `/protocol` and `/providers` are not routed.

- [ ] **Step 3: Implement Protocol Radar**

Create `src/features/protocol.tsx` with four panels:

1. **Current epoch & PoC** — current epoch, phase, PoC model states.
2. **DevShard runtimes** — only observed runtime names; empty state if not observed.
3. **Current chain parameters** — exact current parameter table grouped from `s.protocol`.
4. **Software/discovery** — flattened `s.versions` plus endpoint-catalog count.

Use:

```tsx
const p=buildProtocolSnapshot(s);
const modelRows=p.models.map(m=>({
  id:m.id,
  provider:m.providerAvailable?'Available':'Not in current provider catalog',
  poc:m.pocActive===null?'Unknown':m.pocActive?'Active PoC':'Not in observed PoC set',
  state:m.state,
}));
```

Every section ends with `Proof` for the exact source IDs.

- [ ] **Step 4: Implement provider directory/detail**

Move provider explanatory content out of the crowded `src/features/ecosystem.tsx` provider branch into `src/features/providers.tsx`.

Canonical rows:

```ts
const providerFacts=[
 {id:'openbroker',scope:'provider',publicModels:true,privateUsage:'Documented; not connected',billing:'GNK/ngonka provider ledger',sourceIds:['models']},
 {id:'proxy',scope:'provider',publicModels:true,privateUsage:'Provider account; not connected',billing:'Provider USD pricing',sourceIds:['capabilities','pricing']},
 {id:'feather',scope:'self-hosted indexer',publicModels:false,privateUsage:'N/A',billing:'Operator infrastructure',sourceIds:[]},
] as const;
```

Do not add measured uptime/latency unless a probe source exists.

- [ ] **Step 5: Add canonical routes and aliases**

In `src/app/[[...route]]/page.tsx`:
- add `protocol` and `providers` to allowed routes;
- validate provider IDs from `openbroker|proxy|feather`;
- map old `brokers` and `proxy` routes to the same new component.

In `src/components/shell.tsx`:
- add `/protocol` under Observatory;
- change nav label target from `/brokers` to `/providers`;
- keep old links valid but do not duplicate nav entries.

- [ ] **Step 6: Run browser check**

```bash
npm run build
npm run snapshot
node scripts/v2-qa.mjs
```

Expected: PASS for the initial route assertions.

- [ ] **Step 7: Add mobile overflow + accessibility assertions**

Extend `v2-qa.mjs`:

```js
for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1000});
  for(const path of ['/protocol','/providers','/providers/openbroker']){
    await page.goto(base+path,{waitUntil:'networkidle'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  }
}
```

Add axe scans at 1440 dark and 390 light.

- [ ] **Step 8: Run again and fix only failures found**

```bash
node scripts/v2-qa.mjs
```

Expected: PASS with zero overflow and zero selected axe findings.

- [ ] **Step 9: Commit**

```bash
git add src/features/protocol.tsx src/features/providers.tsx src/app/[[...route]]/page.tsx src/components/shell.tsx src/app/globals.css scripts/v2-qa.mjs
git commit -m "feat(ui): add protocol radar and canonical provider pages"
```

---

### Task 4: Model lifecycle/source provenance in explorer and detail pages

**Files:**
- Modify: `src/core/protocol.ts`
- Modify: `src/features/model-explorer.tsx`
- Modify: `src/features/ecosystem.tsx`
- Modify: `src/components/insight-charts.tsx`
- Test: `tests/protocol.test.ts`
- Test: `tests/model-comparison-regression.test.ts`
- Browser: `scripts/v2-qa.mjs`

**Interfaces:**
- Consumes: `ProtocolModelStatus`, current model explorer filters.
- Produces: source-qualified lifecycle rows; no unsourced deprecation/quality ranking.

- [ ] **Step 1: Add lifecycle edge-case tests**

```ts
it('does not call a provider-only model deprecated',()=>{
  const status=buildProtocolSnapshot(snapshotWith({provider:['x'],poc:[]})).models[0];
  expect(status.state).toBe('provider-only');
  expect(status).not.toHaveProperty('deprecated',true);
});
it('keeps PoC state unknown when epoch metadata is unavailable',()=>{
  const status=buildProtocolSnapshot(snapshotWith({provider:['x'],poc:null})).models[0];
  expect(status.pocActive).toBeNull();
  expect(status.state).toBe('unknown');
});
```

- [ ] **Step 2: Verify RED if helper fixtures/behavior are missing**

```bash
npm test -- tests/protocol.test.ts
```

- [ ] **Step 3: Add model-state mapping helper**

Expose:

```ts
export function modelStatusMap(s:Snapshot):Map<string,ProtocolModelStatus>{
  return new Map(buildProtocolSnapshot(s).models.map(x=>[x.id,x]));
}
```

- [ ] **Step 4: Update model explorer cards/table/comparison**

For each model show:
- Provider: available in OpenBroker catalog.
- PoC: active / not in observed PoC set / unknown.
- Context/output/tool/reasoning: Proxy-reported metadata.
- Price: Proxy-advertised price.
- Epoch support: participant footprint.
- Sources: catalog + capability + pricing + epoch/participants where applicable.

Do **not** create an overall score or “best model.”

Add table columns only if they remain readable at desktop; mobile continues using cards and scrollable exact table.

- [ ] **Step 5: Preserve URL-filter behavior**

Keep `readModelFilters(..., s.models)` as the single parser. For lifecycle filters add only if needed:

```ts
lifecycle:['poc-active','provider-only'].includes(params.get('lifecycle')??'')
  ? params.get('lifecycle')!
  : 'all'
```

Add regression tests proving unknown values reset to `all` and old shared URLs still load.

- [ ] **Step 6: Extend browser QA**

In `v2-qa.mjs`:
- open `/models`;
- select two real current models if available;
- assert lifecycle/provider/PoC labels appear;
- reload and confirm compare state persists;
- switch to 390px and confirm no page-level overflow;
- assert source details are reachable.

- [ ] **Step 7: Run focused tests + browser**

```bash
npm test -- tests/protocol.test.ts tests/model-comparison-regression.test.ts
npm run build
node scripts/v2-qa.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/core/protocol.ts src/features/model-explorer.tsx src/features/ecosystem.tsx src/components/insight-charts.tsx tests/protocol.test.ts tests/model-comparison-regression.test.ts scripts/v2-qa.mjs
git commit -m "feat(models): expose source-qualified lifecycle context"
```

---

### Task 5: Overview, network and source-status UX consolidation

**Files:**
- Modify: `src/features/overview.tsx`
- Modify: `src/features/network.tsx`
- Modify: `src/features/platform.tsx`
- Modify: `src/features/shared.tsx`
- Modify: `src/components/ui.tsx`
- Modify: `src/app/observatory.css`
- Test: `tests/source-dependencies.test.ts`
- Browser: `scripts/v2-qa.mjs`

**Interfaces:**
- Consumes: `overviewFacts`, `buildProtocolSnapshot`, `sourceDependents`.
- Produces: source-aware command center and richer `/sources` dependency view.

- [ ] **Step 1: Add tests for unavailable source impact summaries**

```ts
it('lists dependent routes for a failed source without fabricating metrics',()=>{
  expect(sourceDependents('stats')).toEqual(['/inference']);
});
it('catalog failure affects agents but not activity',()=>{
  expect(sourceDependents('catalog')).toContain('/agents');
  expect(sourceDependents('catalog')).not.toContain('/activity');
});
```

- [ ] **Step 2: Run and verify current expected behavior**

```bash
npm test -- tests/source-dependencies.test.ts
```

If already green, add one dependency case that is not yet represented (for example `versions -> /protocol`) and verify RED before adding that mapping.

- [ ] **Step 3: Restructure Overview into four sections**

In `src/features/overview.tsx`, use headings:
- `NOW`
- `COMPUTE`
- `MODELS & ACCESS`
- `COMMUNITY & PROTOCOL`

Keep six KPIs maximum above the fold. Move secondary values into compact `fact-strip` or existing panels instead of adding more KPI cards.

Add a protocol card:
- current observed PoC model count,
- DevShard versions if observed,
- source status,
- link to `/protocol`.

If inference `stats` is unavailable, show the existing unavailable state rather than chain transactions.

- [ ] **Step 4: Improve Network source boundaries**

On `/network`:
- show declared membership and exclusions as separate status counts;
- show hardware registration total only when `hardware` is observed;
- show PoC model support separately from provider availability;
- retain weight concentration wording as declared epoch weight.

- [ ] **Step 5: Upgrade Sources page to dependency observability**

For each source row add a “Used by” cell:

```tsx
{
 key:'usedBy',
 label:'Used by',
 value:r=>sourceDependents(r.id).join(', '),
 render:r=><div className="chip-list">{sourceDependents(r.id).map(path=><Link key={path} href={path}>{path}</Link>)}</div>
}
```

Add age/TTL display using the same freshness helper; do not invent uptime percentages.

- [ ] **Step 6: Add a reusable CoverageNotice only if it replaces repeated markup**

If three or more pages repeat the same source-warning presentation, add to `src/components/ui.tsx`:

```tsx
export function CoverageNotice({title,children}:{title:string;children:ReactNode}){
  return <div className="coverage-notice"><Info size={15}/><div><strong>{title}</strong><p>{children}</p></div></div>;
}
```

Replace only repeated warning blocks touched in this task.

- [ ] **Step 7: Browser acceptance**

Add to `v2-qa.mjs`:
- overview has one h1 and four named sections;
- no more than six `.dashboard-kpis .metric` elements;
- `/sources` displays a dependent route for the unavailable inference source when it is unavailable;
- 390/768/1440 no whole-page overflow;
- dark/light axe scans for overview/network/sources.

- [ ] **Step 8: Run full browser suite locally/CI**

```bash
npm run build
npm run snapshot
node scripts/v2-qa.mjs
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/features/overview.tsx src/features/network.tsx src/features/platform.tsx src/features/shared.tsx src/components/ui.tsx src/app/observatory.css tests/source-dependencies.test.ts scripts/v2-qa.mjs
git commit -m "feat(observatory): clarify current network and source coverage"
```

---

### Task 6: Agent Workbench safety/namespace UX and runtime discovery counts

**Files:**
- Modify: `src/core/normalize.ts`
- Modify: `src/core/types.ts`
- Modify: `src/features/tools.tsx`
- Modify: `src/core/api-data.ts`
- Modify: `src/core/api-definitions.ts`
- Test: `tests/normalize.test.ts`
- Test: `tests/api-contract.test.ts`
- Browser: `scripts/v2-qa.mjs`

**Interfaces:**
- Consumes: structured `/api/endpoints` catalog.
- Produces:
  - endpoint namespace,
  - `readOnly:boolean`,
  - catalog declared total,
  - flattened actual total,
  - mismatch warning.

- [ ] **Step 1: Add catalog-count and write-safety tests**

```ts
it('preserves catalog declared total and classifies write operations',()=>{
  const c=catalogData({
    total_endpoints:2,
    groups:[{label:'CometBFT RPC',tag:'COMET',endpoints:[
      {method:'GET',path:'/chain-rpc/status',description:'status'},
      {method:'POST',path:'/chain-rpc/broadcast_tx_sync',description:'broadcast'}
    ]}]
  });
  expect(c.declaredTotal).toBe(2);
  expect(c.endpoints[0].readOnly).toBe(true);
  expect(c.endpoints[1].readOnly).toBe(false);
});
```

Add a mismatch test where `total_endpoints:354` but only two fixtures are present; the parser returns both values instead of rewriting either.

- [ ] **Step 2: Verify RED**

```bash
npm test -- tests/normalize.test.ts
```

Expected: FAIL because `catalogData` currently returns only an endpoint array.

- [ ] **Step 3: Change normalized catalog contract**

In `src/core/types.ts`:

```ts
export interface Endpoint {
  method:string; path:string; description:string; group:string; params:string; cache:string;
  namespace:'chain-rpc'|'chain-api'|'v1'|'api/ch'|'other';
  readOnly:boolean;
}
export interface EndpointCatalog {
  declaredTotal:number|null;
  endpoints:Endpoint[];
}
```

In `catalogData`, derive namespace from the path prefix and `readOnly = method.toUpperCase()==='GET'`.

Store `Snapshot.endpointDeclaredTotal:number|null` and keep `Snapshot.endpoints` for compatibility.

- [ ] **Step 4: Upgrade Agent Workbench**

Controls:
- keyword search,
- namespace filter,
- GET-only vs all definitions,
- safety label.

Write methods render an amber `DOCUMENTATION ONLY` badge and **never** get a Run button.

Display:
- structured declared count,
- flattened normalized count,
- mismatch notice if they differ.

The current upstream can expose write/broadcast operations; GonkaStats remains curated-read-only.

- [ ] **Step 5: Add API discovery metadata**

Add `/api/v1/endpoints` fields:

```json
{
  "declaredTotal": 354,
  "normalizedTotal": 354,
  "readOnlyCount": 300,
  "writeDefinitionCount": 54,
  "data": []
}
```

Exact numbers are runtime-derived; the snippet is only the response shape.

- [ ] **Step 6: Contract tests**

In `tests/api-contract.test.ts` assert:
- endpoint resource has no hardcoded 352/354 constant;
- counts equal the current snapshot fixture;
- unsupported POST to GonkaStats API still returns 405;
- write discovery entries have no executable GonkaStats route.

- [ ] **Step 7: Browser QA**

In `v2-qa.mjs`:
- open `/agents`;
- filter `chain-rpc`;
- toggle all definitions;
- verify any POST row has “Documentation only”;
- verify GET rows can still use curated GonkaStats examples;
- test 390px scroll/overflow and axe.

- [ ] **Step 8: Run tests**

```bash
npm test -- tests/normalize.test.ts tests/api-contract.test.ts
npm run build
node scripts/v2-qa.mjs
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/core/normalize.ts src/core/types.ts src/features/tools.tsx src/core/api-data.ts src/core/api-definitions.ts tests/normalize.test.ts tests/api-contract.test.ts scripts/v2-qa.mjs
git commit -m "feat(agents): expose safe runtime RPC discovery metadata"
```

---

### Task 7: Normalized protocol/provider/source APIs and OpenAPI

**Files:**
- Create: `src/core/providers.ts`
- Modify: `src/core/api-definitions.ts`
- Modify: `src/core/api-data.ts`
- Modify: `src/app/api/v1/[resource]/route.ts`
- Modify: `src/core/openapi.ts`
- Modify: `public/llms.txt`
- Modify: `AGENTS.md`
- Test: `tests/api-contract.test.ts`

**Interfaces:**
- Produces new GET resources:
  - `/api/v1/protocol`
  - `/api/v1/source-health`
  - `/api/v1/providers`

- [ ] **Step 1: Write failing API registry tests**

```ts
it('publishes protocol/source-health/providers from the implementation registry',()=>{
  const ids=apiDefinitions.map(x=>x.id);
  expect(ids).toContain('protocol');
  expect(ids).toContain('source-health');
  expect(ids).toContain('providers');
});
it('OpenAPI paths exactly match the registered GET resources',()=>{
  const spec=openapi('https://example.test');
  const expected=new Set(apiDefinitions.map(x=>'/api/v1/'+x.id));
  expect(new Set(Object.keys(spec.paths))).toEqual(expected);
});
```

- [ ] **Step 2: Verify RED**

```bash
npm test -- tests/api-contract.test.ts
```

Expected: FAIL because new definitions do not exist.

- [ ] **Step 3: Register API definitions**

Add:
- `protocol`: output of `buildProtocolSnapshot`.
- `source-health`: source status plus dependent routes.
- `providers`: static documented provider-layer metadata joined only to provider-source availability.

Descriptions must state provider/network scope boundaries.

- [ ] **Step 4: Reuse core helpers in api-data**

No duplicate calculations in the route handler:

```ts
case 'protocol':
  return buildProtocolSnapshot(s);
case 'source-health':
  return s.sources.map(source=>({...source,usedBy:sourceDependents(source.id)}));
case 'providers':
  return providerMetadata(s);
```

Create `src/core/providers.ts` so UI and API share one provider-layer definition:

```ts
import type {Snapshot} from './types';
export interface ProviderMetadata {id:'openbroker'|'proxy'|'feather';name:string;scope:string;status:'observed'|'documented'|'not-configured';sourceIds:string[];}
export function providerMetadata(s:Snapshot):ProviderMetadata[] {
  const observed=(ids:string[])=>ids.some(id=>s.sources.some(source=>source.id===id&&source.status!=='unavailable'));
  return [
    {id:'openbroker',name:'OpenBroker',scope:'managed provider',status:observed(['models'])?'observed':'documented',sourceIds:['models']},
    {id:'proxy',name:'Proxy by gonka.gg',scope:'managed provider',status:observed(['capabilities','pricing'])?'observed':'documented',sourceIds:['capabilities','pricing']},
    {id:'feather',name:'Feather',scope:'self-hosted indexer',status:process.env.FEATHER_URL?'documented':'not-configured',sourceIds:[]},
  ];
}
```

Do not add uptime, benchmark or account-state fields without an observed source.

- [ ] **Step 5: Update machine-readable docs**

`public/llms.txt` advertises the current count from documentation text only as “see /api/v1/openapi for implemented routes”; do not paste a numeric count that can drift.

`AGENTS.md` reiterates:
- use GonkaStats normalized reads for this app,
- use upstream catalog only for discovery,
- do not execute discovered write operations.

- [ ] **Step 6: Run contract tests**

```bash
npm test -- tests/api-contract.test.ts
```

Expected: PASS.

- [ ] **Step 7: Verify OpenAPI live**

After production build:

```bash
curl --fail --silent http://127.0.0.1:3000/api/v1/openapi > /tmp/gonkastats-openapi.json
node -e "const s=require('/tmp/gonkastats-openapi.json'); if(!s.paths['/api/v1/protocol']) process.exit(1)"
```

- [ ] **Step 8: Commit**

```bash
git add src/core/api-definitions.ts src/core/api-data.ts src/app/api/v1/[resource]/route.ts src/core/openapi.ts src/core/providers.ts public/llms.txt AGENTS.md tests/api-contract.test.ts
git commit -m "feat(api): expose protocol provider and source health reads"
```

---

### Task 8: Performance, route metadata and UI code cleanup

**Files:**
- Modify: `src/app/[[...route]]/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/shell.tsx`
- Modify: `src/features/platform.tsx`
- Modify: `src/features/ecosystem.tsx`
- Create if justified: `src/core/routes.ts`
- Test: `tests/routes.test.ts` if route registry is extracted.
- Browser: `scripts/v2-qa.mjs`

**Interfaces:**
- Produces one route metadata registry shared by title/breadcrumb/navigation validation where practical.
- Keeps heavy interactive chart components isolated from server-rendered page shells.

- [ ] **Step 1: Write failing route-registry tests before extraction**

If route metadata is duplicated in at least three places, create:

```ts
import {it,expect} from 'vitest';
import {routes} from '../src/core/routes';

it('has unique canonical hrefs',()=>{
  const hrefs=routes.map(x=>x.href);
  expect(new Set(hrefs).size).toBe(hrefs.length);
});
it('keeps legacy broker paths as aliases, not navigation duplicates',()=>{
  expect(routes.find(x=>x.href==='/providers')?.aliases).toContain('/brokers');
  expect(routes.filter(x=>x.nav).some(x=>x.href==='/brokers')).toBe(false);
});
```

- [ ] **Step 2: Run RED**

```bash
npm test -- tests/routes.test.ts
```

Expected: FAIL until the registry exists.

- [ ] **Step 3: Extract route metadata only if it removes real duplication**

Example:

```ts
export const routes=[
 {href:'/',label:'Overview',group:'OBSERVATORY',nav:true,aliases:[]},
 {href:'/protocol',label:'Protocol',group:'OBSERVATORY',nav:true,aliases:[]},
 {href:'/providers',label:'Providers',group:'ECOSYSTEM',nav:true,aliases:['/brokers','/proxy']},
] as const;
```

Use it for navigation names and page metadata where possible without making icon components part of core data.

- [ ] **Step 4: Add route-specific metadata**

`generateMetadata` should produce:
- title,
- short description,
- canonical pathname.

No dynamic social claims based on stale snapshot metrics. Model/participant detail metadata can use identifiers only unless the page already has loaded normalized data safely.

- [ ] **Step 5: Check bundle/client boundaries**

Keep `use client` only on components with state/browser APIs. Do not convert server page routing to client rendering.

Where a chart module is large and below-the-fold, use existing `dynamic(()=>import(...))` pattern with a fixed-height placeholder.

- [ ] **Step 6: Browser regression**

In `v2-qa.mjs` verify:
- canonical nav has one Providers entry;
- old `/brokers` still returns 200;
- `/protocol` title contains Protocol;
- no hydration/pageerror events;
- no chart container has zero rendered width/height after network idle.

- [ ] **Step 7: Run tests**

```bash
npm test -- tests/routes.test.ts
npm run typecheck
npm run lint
npm run build
node scripts/v2-qa.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/core/routes.ts src/app/[[...route]]/page.tsx src/app/layout.tsx src/components/shell.tsx src/features/platform.tsx src/features/ecosystem.tsx tests/routes.test.ts scripts/v2-qa.mjs
git commit -m "refactor(ui): unify route metadata and client boundaries"
```

---

### Task 9: History readiness and final verification

**Files:**
- Modify: `src/db/store.ts` only if tests reveal an issue.
- Modify: `src/core/history-point.ts` only if tests reveal an issue.
- Modify: `scripts/v2-qa.mjs`
- Modify: `package.json`
- Create: `docs/V2-VERIFICATION.md`
- Test: `tests/history.test.ts`

**Interfaces:**
- No database is provisioned.
- Existing history API remains explicit when PostgreSQL is absent.
- Final QA becomes part of `npm run test:e2e` only after it passes standalone.

- [ ] **Step 1: Add history boundary tests if missing**

Ensure tests cover:
- no database → explicit empty/not-configured state;
- gaps remain null/non-connected;
- no duplicate timestamp slot creates duplicate chart observation;
- max hours/points remain bounded.

Example:

```ts
it('does not turn a missing collection interval into a numeric point',()=>{
  const rows=seriesWithGap([
    {at:'2026-09-21T00:00:00Z',value:'10'},
    {at:'2026-09-21T00:30:00Z',value:'20'},
  ],15*60_000);
  expect(rows.some(x=>x.value===null)).toBe(true);
});
```

- [ ] **Step 2: Run history suite**

```bash
npm test -- tests/history.test.ts
```

If green, do not alter the storage implementation unnecessarily. This step is a verification gate, not a refactor quota.

- [ ] **Step 3: Run fresh public API probes before the final snapshot**

Probe only read-only endpoints actually used by the collector:
- `/chain-rpc/status`
- `/v1/epochs/latest`
- `/v1/versions`
- `/v1/governance/models`
- `/api/endpoints`
- OpenBroker `/v1/models`
- Proxy capability/pricing
- existing chain params/supply/governance/hardware reads.

Record HTTP/schema failures in the final verification doc. A failed source is acceptable if the UI shows unavailable/stale correctly.

- [ ] **Step 4: Add v2 QA to the e2e script only after standalone green**

Change `package.json`:

```json
"test:e2e":"node scripts/browser-qa.mjs && node scripts/revamp-qa.mjs && node scripts/audit-qa.mjs && node scripts/workload-qa.mjs && node scripts/v2-qa.mjs"
```

- [ ] **Step 5: Run complete verification**

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run snapshot
npx playwright install chromium
npm run test:e2e
```

Expected: every command exits 0. Record exact test/check counts from the output; do not reuse historical counts.

- [ ] **Step 6: Inspect real screenshots**

Open at minimum:
- overview 1440 dark,
- overview 390 dark,
- protocol 1440 dark,
- protocol 390 light,
- models compare 1440 dark,
- providers/openbroker 390 dark,
- agents 1440 dark,
- sources 390 light.

Check:
- no clipped headings,
- no overlapping provenance popovers,
- readable labels,
- no full-page horizontal overflow,
- tables intentionally scroll inside their region,
- unavailable source notices are visible and comprehensible.

- [ ] **Step 7: Write verification record**

Create `docs/V2-VERIFICATION.md` with:
- tested commit SHA,
- exact commands,
- exact test/browser counts,
- source observation timestamp,
- upstream failures,
- screenshots inspected,
- known unconfigured integrations,
- statement that no public deployment/private account/paid inference was performed.

- [ ] **Step 8: Commit verification artifacts/docs only**

```bash
git add package.json scripts/v2-qa.mjs docs/V2-VERIFICATION.md tests/history.test.ts
git commit -m "test(v2): verify protocol provider and observability release"
```

- [ ] **Step 9: Whole-branch review before merge**

Compare branch to the base and check:
- no unrelated repository changes,
- no secrets,
- no scheduled workflows,
- no write/broadcast API route,
- no hardcoded “current” model/runtime values from research prose,
- source counts/endpoint counts are runtime-derived,
- every new route has source/coverage handling.

Only after that review and the full green verification should the implementation branch be merged.

---

## Deliberately Separate Follow-up Plans

The approved design also mentions capabilities that require operational or privacy decisions. They are **not** hidden inside this core plan:

1. **Historical operations plan:** provision PostgreSQL, operate collector, choose retention/backfill policy, then add daily/weekly/epoch historical charts from stored observations.
2. **Measured broker monitoring plan:** G-Meter/synthetic probes with explicit paid-inference budget, probe locations, token limits, intervals and published methodology.
3. **Private OpenBroker account plan:** authenticated multi-tenant account usage with encrypted server-side credentials, no shared cache, revocation and deletion.
4. **Pulse ingestion plan:** only after a supported/authorized feed and methodology are verified.
5. **Self-hosted Feather plan:** only if independent indexing/archival needs justify operating the infrastructure.

Those plans must be approved independently before provisioning or collecting private/paid data.
