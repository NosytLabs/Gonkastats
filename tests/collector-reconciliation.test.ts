import {it,expect,vi,afterEach} from 'vitest';
import {collect} from '../src/core/collect';
import {emptySnapshot,unavailable} from '../src/core/sources';
import {readJSON} from '../src/core/http';
import type {Model} from '../src/core/types';
vi.mock('../src/core/http',()=>({configuredOrigin:()=> 'https://rpc.gonka.gg',readJSON:vi.fn()}));
afterEach(()=>vi.resetAllMocks());
const model:Model={id:'test/model',name:'model',slug:'abcd',provider:'openbroker',context:128000,output:8000,vram:80,tools:true,reasoning:true,price:'0.01',ngonka:'10',hfRepo:null,hfCommit:null};
it('catalog failure cannot leave an old model price beside a fresh pricing source',async()=>{
 const previous=emptySnapshot();previous.models=[model];previous.sources=['models','pricing','capabilities'].map(id=>({...unavailable(id),error:null,status:'recent' as const}));
 vi.mocked(readJSON).mockImplementation(async url=>{
  if(url.endsWith('/api/pricing'))return {gonka_usd:'0.2',fx_updated_at:new Date().toISOString(),models:[{model_id:'test/model',usd_per_million_tokens:'0.025',ngonka_per_token:'20'}]};
  throw new Error('Upstream unavailable');
 });
 const result=await collect(previous);
 expect(result.models[0].price).toBe('0.025');expect(result.models[0].context).toBe(128000);
 expect(result.sources.find(s=>s.id==='models')?.status).toBe('stale');
 expect(result.sources.find(s=>s.id==='pricing')?.status).toBe('recent');
});
it('pricing failure keeps last-good price with its old failed-source timestamp',async()=>{
 const previous=emptySnapshot();previous.models=[model];const when='2026-09-20T00:00:00Z';previous.sources=[{...unavailable('pricing'),error:null,status:'recent',fetchedAt:when}];
 vi.mocked(readJSON).mockImplementation(async url=>{if(url.endsWith('/v1/models'))return {data:[{id:'test/model'}]};throw new Error('Upstream unavailable');});
 const result=await collect(previous);expect(result.models[0].price).toBe('0.01');expect(result.sources.find(s=>s.id==='pricing')?.fetchedAt).toBe(when);expect(result.sources.find(s=>s.id==='pricing')?.status).toBe('stale');
});
